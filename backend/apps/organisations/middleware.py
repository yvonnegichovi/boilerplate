"""
OrgMiddleware: resolves the active organisation from the URL.

URL pattern: /api/organisations/{org_slug}/...

Attaches `request.org` to every request so views and permissions
can access the current tenant without repeating the lookup.

If the slug doesn't exist -> 404.
If the URL has no org slug -> request.org is None (public routes).
"""
import logging
from django.http import Http404
from .models import Organisation

logger = logging.getLogger(__name__)


class OrgMiddleware:
    """
    Middleware to resolve the active organisation from the URL.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        """Extract org_slug from the URL path"""
        request.org = self._resolve_org(request)
        return self.get_response(request)
    
    def _resolve_org(self, request):
        """
        Extracts the organisation slug from the URL and attaches the corresponding Organisation object to the request.
        If the slug doesn't exist, raises Http404.
        If the URL has no org slug, sets request.org to None (public routes).
        """
        path = request.path_info
        parts = path.strip('/').split('/')

        if len(parts) >= 3 and parts[0] == 'api' and parts[1] == 'organisations':
            slug = parts[2]
            try:
                org = Organisation.objects.get(slug=slug)
                logger.info(f"Resolved organisation '{org.name}' for slug '{slug}'")
                return org
            except Organisation.DoesNotExist:
                logger.debug(f"Organisation with slug '{slug}' not found.")
                raise Http404(f"Organisation '{slug}' not found")
        return None
