"""
Tests for the Flower session-cookie + reverse-proxy views.
"""

from unittest.mock import Mock, patch

import requests
from apps.authentication.tests.factories import make_superuser, make_user
from django.core import signing
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from ..flower_proxy import FLOWER_PROXY_COOKIE, FLOWER_PROXY_SALT

SESSION_URL = "/api/monitoring/flower/session/"


def _fake_upstream_response(
    status_code=200, content=b"", content_type="text/plain", headers=None
):
    response = Mock()
    response.status_code = status_code
    response.content = content
    response.encoding = "utf-8"
    merged_headers = {"Content-Type": content_type}
    merged_headers.update(headers or {})
    response.headers = merged_headers
    return response


class FlowerSessionViewTests(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.staff = make_superuser()

    def _auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_unauthenticated_returns_401(self):
        res = self.client.get(SESSION_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_user_returns_403(self):
        self._auth_as(self.user)
        res = self.client.get(SESSION_URL)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_user_gets_session_cookie(self):
        self._auth_as(self.staff)
        res = self.client.get(SESSION_URL)

        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        cookie = res.cookies.get(FLOWER_PROXY_COOKIE)
        self.assertIsNotNone(cookie)
        self.assertTrue(cookie["httponly"])
        self.assertEqual(cookie["path"], "/flower/")

        payload = signing.loads(cookie.value, salt=FLOWER_PROXY_SALT, max_age=300)
        self.assertEqual(payload["user_id"], str(self.staff.id))


class FlowerProxyViewTests(APITestCase):
    def setUp(self):
        self.user = make_user()
        self.staff = make_superuser()

    def _set_session_cookie(self, user):
        token = signing.dumps({"user_id": str(user.id)}, salt=FLOWER_PROXY_SALT)
        self.client.cookies[FLOWER_PROXY_COOKIE] = token

    def test_no_cookie_and_html_accept_redirects_to_admin_login(self):
        res = self.client.get("/flower/tasks", HTTP_ACCEPT="text/html")

        self.assertEqual(res.status_code, status.HTTP_302_FOUND)
        self.assertEqual(res["Location"], "/admin/login?next=/flower/")

    def test_no_cookie_and_non_html_accept_returns_401_json(self):
        res = self.client.get("/flower/static/css/flower.css", HTTP_ACCEPT="text/css")

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(res["Content-Type"], "application/json")

    def test_tampered_cookie_is_rejected(self):
        self.client.cookies[FLOWER_PROXY_COOKIE] = "not-a-real-signed-value"
        res = self.client.get("/flower/tasks", HTTP_ACCEPT="text/html")
        self.assertEqual(res.status_code, status.HTTP_302_FOUND)

    def test_cookie_for_non_staff_user_is_rejected(self):
        # e.g. demoted after the cookie was issued - re-checked live, not
        # just trusted from the signed payload.
        self._set_session_cookie(self.user)
        res = self.client.get("/flower/tasks", HTTP_ACCEPT="text/html")
        self.assertEqual(res.status_code, status.HTTP_302_FOUND)

    @patch("apps.monitoring.flower_proxy.requests.request")
    def test_valid_cookie_proxies_through_and_injects_theme_on_html(self, mock_request):
        mock_request.return_value = _fake_upstream_response(
            content=b"<html><head><title>Flower</title></head><body></body></html>",
            content_type="text/html; charset=utf-8",
        )
        self._set_session_cookie(self.staff)

        res = self.client.get("/flower/tasks")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn(
            b'<link rel="stylesheet" href="/celery-flower-theme.css">', res.content
        )
        called_url = mock_request.call_args.kwargs["url"]
        self.assertEqual(called_url, "http://localhost:5555/flower/tasks")

    @patch("apps.monitoring.flower_proxy.requests.request")
    def test_non_html_responses_pass_through_unmodified(self, mock_request):
        css_body = b"body { color: red; }"
        mock_request.return_value = _fake_upstream_response(
            content=css_body, content_type="text/css"
        )
        self._set_session_cookie(self.staff)

        res = self.client.get("/flower/static/css/flower.css")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.content, css_body)

    @patch("apps.monitoring.flower_proxy.requests.request")
    def test_upstream_unreachable_returns_502(self, mock_request):
        mock_request.side_effect = requests.ConnectionError("boom")
        self._set_session_cookie(self.staff)

        res = self.client.get("/flower/tasks")

        self.assertEqual(res.status_code, 502)
