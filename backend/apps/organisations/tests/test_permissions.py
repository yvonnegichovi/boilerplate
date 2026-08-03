from apps.authentication.tests.factories import make_user
from django.test import RequestFactory, TestCase

from ..models import Membership
from ..permissions import IsOrgAdmin, IsOrgMember, IsOrgOwner
from .factories import make_membership, make_organisation


class OrgPermissionTests(TestCase):
    def setUp(self):
        self.org = make_organisation(created_by=make_user())
        self.owner = make_user(email="owner@example.com")
        self.admin = make_user(email="admin@example.com")
        self.member = make_user(email="member@example.com")
        self.outsider = make_user(email="outsider@example.com")
        make_membership(
            user=self.owner, organisation=self.org, role=Membership.Role.OWNER
        )
        make_membership(
            user=self.admin, organisation=self.org, role=Membership.Role.ADMIN
        )
        make_membership(
            user=self.member, organisation=self.org, role=Membership.Role.MEMBER
        )

    def _request(self, user, org=True):
        request = RequestFactory().get("/")
        request.user = user
        request.org = self.org if org else None
        return request

    def test_is_org_member_allows_any_role(self):
        perm = IsOrgMember()
        for user in (self.owner, self.admin, self.member):
            self.assertTrue(perm.has_permission(self._request(user), None))
        self.assertFalse(perm.has_permission(self._request(self.outsider), None))

    def test_is_org_admin_allows_admin_and_owner(self):
        """Regression test: IsOrgAdmin previously only allowed the literal
        'admin' role, locking owners out of admin-gated actions."""
        perm = IsOrgAdmin()
        self.assertTrue(perm.has_permission(self._request(self.owner), None))
        self.assertTrue(perm.has_permission(self._request(self.admin), None))
        self.assertFalse(perm.has_permission(self._request(self.member), None))

    def test_is_org_allows_only_oowner(self):
        perm = IsOrgOwner()
        self.assertTrue(perm.has_permission(self._request(self.owner), None))
        self.assertFalse(perm.has_permission(self._request(self.admin), None))
        self.assertFalse(perm.has_permission(self._request(self.member), None))

    def test_all_permissions_deny_without_org(self):
        for perm_cls in (IsOrgOwner, IsOrgAdmin, IsOrgMember):
            self.assertFalse(
                perm_cls().has_permission(self._request(self.owner, org=False), None)
            )
