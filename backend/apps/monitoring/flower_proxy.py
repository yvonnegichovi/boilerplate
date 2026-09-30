"""
Authenticated reverse proxy for Flower, plus the endpoint that bootstraps
the short-lived cookie it relies on.

Flower is a separate service (see core/celery.py / docker-compose.yml's
celery-worker/celery-beat/flower processes) with no awareness of this
app's session model. A raw browser navigation to it carries no JWT - that's
only ever attached to XHR calls by the frontend's axios interceptor (see
frontend/src/api/client.js) - so a plain `IsAuthenticated` DRF view can't
gate a real page load. Access here works in two hops instead:

1. The frontend calls `GET /api/monitoring/flower/session/` (a normal XHR,
   JWT-authenticated, IsStaffUser-gated like every other endpoint in this
   app) right before navigating the browser to Flower. `FlowerSessionView`
   mints a short-lived signed cookie scoped to `/flower/`.
2. The browser's subsequent *real* navigation to `/flower/...` - and every
   static asset/AJAX request Flower's own pages make from there - carries
   that cookie automatically. `FlowerProxyView` checks it on every request
   and, if valid, forwards through to the real Flower origin
   (`settings.FLOWER_INTERNAL_URL`); if missing/expired, the request is
   rejected before it ever reaches Flower.

`FlowerProxyView` is mounted at the site root (`/flower/...`), not under
`/api/` - see core/urls.py - because it has to exactly match the path the
browser (and Flower's own `--url_prefix=flower` asset links) requests.
"""

import logging

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .docs import flower_session_docs
from .permissions import IsStaffUser

logger = logging.getLogger(__name__)

FLOWER_PROXY_COOKIE = "flower_proxy_session"
FLOWER_PROXY_SALT = "apps.monitoring.flower_proxy"
FLOWER_PROXY_MAX_AGE = 300  # 5 minutes - long enough to browse, short-lived by design

# Hop-by-hop headers (RFC 7230 6.1) plus Host/Content-Length must never be
# forwarded as-is - Host has to target Flower, not us, and Content-Length
# is recalculated by `requests` itself from the body.
_HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}


@flower_session_docs
class FlowerSessionView(APIView):
    """GET /api/monitoring/flower/session/ - mint the FlowerProxyView cookie."""

    permission_classes = [permissions.IsAuthenticated, IsStaffUser]

    def get(self, request, *args, **kwargs):
        token = signing.dumps({"user_id": str(request.user.id)}, salt=FLOWER_PROXY_SALT)
        response = Response(status=204)
        response.set_cookie(
            FLOWER_PROXY_COOKIE,
            token,
            max_age=FLOWER_PROXY_MAX_AGE,
            path="/flower/",
            httponly=True,
            samesite="Lax",
            secure=not settings.DEBUG,
        )
        return response


@csrf_exempt
def flower_proxy_view(request, path=""):
    """
    /flower/<path> - authenticate the FlowerProxyView cookie, then forward
    the request through to the real Flower origin. A plain function view
    (not DRF) since responses here are arbitrary bytes/content-types, not
    JSON - see module docstring for the two-hop auth design.
    """
    user = _authenticate(request)
    if user is None:
        return _unauthorized(request)
    return _proxy(request, path)


def _authenticate(request):
    token = request.COOKIES.get(FLOWER_PROXY_COOKIE)
    if not token:
        return None
    try:
        payload = signing.loads(
            token, salt=FLOWER_PROXY_SALT, max_age=FLOWER_PROXY_MAX_AGE
        )
    except signing.BadSignature:
        return None

    User = get_user_model()
    try:
        user = User.objects.get(pk=payload["user_id"])
    except (User.DoesNotExist, ValueError, TypeError, KeyError):
        return None
    if not (user.is_active and user.is_staff):
        return None
    return user


def _unauthorized(request):
    # A top-level page load (typing the URL, following a link) wants
    # `text/html` - send it to sign in. A stylesheet/script/AJAX request
    # failing mid-session doesn't; a redirect there would just be broken.
    if "text/html" in request.headers.get("Accept", ""):
        return HttpResponseRedirect("/admin/login?next=/flower/")
    return JsonResponse({"detail": "Not authenticated for Flower."}, status=401)


def _proxy(request, path):
    target_url = f"{settings.FLOWER_INTERNAL_URL}/flower/{path}"
    headers = {
        name: value
        for name, value in request.headers.items()
        if name.lower() not in _HOP_BY_HOP_HEADERS
    }

    try:
        upstream = requests.request(
            method=request.method,
            url=target_url,
            params=request.GET,
            headers=headers,
            data=request.body if request.method not in ("GET", "HEAD") else None,
            cookies=None,  # our proxy-session cookie is ours, not Flower's
            timeout=10,
            allow_redirects=False,
        )
    except requests.RequestException:
        logger.exception("Flower proxy: upstream request to %s failed", target_url)
        return HttpResponse(
            "Flower is unreachable.", status=502, content_type="text/plain"
        )

    content_type = upstream.headers.get("Content-Type", "")
    body = upstream.content
    if "text/html" in content_type:
        html = body.decode(upstream.encoding or "utf-8", errors="replace")
        html = html.replace(
            "</head>",
            '<link rel="stylesheet" href="/celery-flower-theme.css">\n</head>',
        )
        body = html.encode("utf-8")

    response = HttpResponse(
        body, status=upstream.status_code, content_type=content_type or None
    )
    for header in ("Cache-Control", "ETag", "Last-Modified", "Location"):
        if header in upstream.headers:
            response[header] = upstream.headers[header]
    return response
