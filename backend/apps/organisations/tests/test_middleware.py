from apps.authentication.tests.factories import make_user
from django.test import RequestFactory, TestCase

from ..middleware import OrgMiddleware
from .factories import make_organisation


class OrgMiddlewareTests(TestCase):
    """
    Regression coverage for OrgMiddleware, which resolves `request.org` from
    the URL.
    """

    def setUp(self):
        self.org = make_organisation(created_by=make_user())
        self.middleware = OrgMiddleware(get_response=lambda request: request)

    def test_sets_org_for_scoped_path(self):
        request = RequestFactory().get(f"/api/organisations/{self.org.slug}/members/")
        result = self.middleware(request)
        self.assertEqual(result.org, self.org)

    def test_sets_none_for_non_org_path(self):
        request = RequestFactory().get("/api/tasks/")
        result = self.middleware(request)
        self.assertIsNone(result.org)

    def test_sets_none_for_bare_organisations_list_path(self):
        request = RequestFactory().get("/api/orgaisations/")
        self.assertIsNone(request.org)

    def test_raises_404_for_unknown_slug(self):
        from django.http import Http404

        request = RequestFactory().get("/api/organisations/does-not-exist/")
        with self.assertRaises(Http404):
            self.middleware(request)

    def test_registered_in_settings(self):
        """Guard against this specific regression recurring silently."""
        from django.conf import settings

        self.assertIn(
            "apps.organisations.middleware.OrgMiddleware", settings.MIDDLEWARE
        )
