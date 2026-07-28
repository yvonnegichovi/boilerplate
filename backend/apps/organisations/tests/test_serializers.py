from django.test import TestCase, RequestFactory

from apps.authentication.tests.factories import make_user
from ..models import Membership
from ..serializers import (
    OrganisationSerializer,
    OrganisationWriteSerializer,
    UpdateMemberRoleSerializer,
    CreateInvitationSerializer,
    AcceptInvitationSerializer,
)
from .factories import make_invitation, make_membership, make_organisation


def _fake_request(user):
    request = RequestFactory().get('/')
    request.user = user
    return request


def _fake_request_with_org(org):
    request = RequestFactory().get('/')
    request.org = org
    return request


class OrganisationSerializerTests(TestCase):

    def setUp(self):
        self.user = make_user()
        self.org = make_organisation(created_by=self.user, name='Rotaract', slug='rotaract')
        make_membership(user=self.user, organisation=self.org, role=Membership.Role.OWNER)

    def test_member_count(self):
        make_membership(user=make_user(email='m2@example.com'), organisation=self.org)
        data = OrganisationSerializer(self.org, context={'request': _fake_request(self.user)}).data
        self.assertEqual(data['member_count'], 2)

    def test_your_role_reflects_requesting_user(self):
        data = OrganisationSerializer(self.org, context={'request': _fake_request(self.user)}).data
        self.assertEqual(data['your_role'], 'owner')

    def test_your_role_none_without_membership(self):
        outsider = make_user(email='outsider@example.com')
        data = OrganisationSerializer(self.org, context={'request': _fake_request(outsider)}).data
        self.assertIsNone(data['your_role'])


class OrganisationWriteSerializerTests(TestCase):

    def test_empty_name_rejected(self):
        s = OrganisationWriteSerializer(data={'name': '   '})
        self.assertFalse(s.is_valid())
        self.assertIn('name', s.errors)

    def test_name_is_stripped(self):
        s = OrganisationWriteSerializer(data={'name': '  Acme  '})
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data['name'], 'Acme')

    def test_create_generates_slug_from_name(self):
        s = OrganisationWriteSerializer(data={'name': 'My New Org'})
        s.is_valid(raise_exception=True)
        org = s.save(created_by=make_user())
        self.assertEqual(org.slug, 'my-new-org')

    def test_create_dedupes_slug_collision(self):
        make_organisation(created_by=make_user(), name='Dup', slug='dup')
        s = OrganisationWriteSerializer(data={'name': 'Dup'})
        s.is_valid(raise_exception=True)
        org = s.save(created_by=make_user(email='second@example.com'))
        self.assertEqual(org.slug, 'dup-1')


class UpdateMemberRoleSerializerTests(TestCase):

    def setUp(self):
        self.owner_user = make_user(email='owner@example.com')
        self.org = make_organisation(created_by=self.owner_user)
        self.owner_membership = make_membership(user=self.owner_user, organisation=self.org, role=Membership.Role.OWNER)
        self.member_membership = make_membership(
            user=make_user(email='me@example.com'), organisation=self.org, role=Membership.Role.MEMBER
        )

    def test_promote_member_to_admin_is_valid(self):
        s = UpdateMemberRoleSerializer(self.member_membership, data={'role': 'admin'})
        self.assertTrue(s.is_valid(), s.errors)

    def cannot_assign_owner_role_directly(self):
        s = UpdateMemberRoleSerializer(self.member_membership, data={'role': 'owner'})
        self.assertFalse(s.is_valid())
        self.assertIn('role', s.errors)

    def test_cannot_change_existing_owner_role(self):
        s = UpdateMemberRoleSerializer(self.owner_membership, data={'role': 'admin'})
        self.assertFalse(s.is_valid())
        self.assertIn('role', s.errors)


class CreateInvitationSerializerTests(TestCase):

    def setUp(self):
        self.org = make_organisation(created_by=make_user())
        self.member = make_user(email='existing@example.com')
        make_membership(user=self.member, organisation=self.org, role=Membership.Role.MEMBER)

    def test_valid_email_is_valid(self):
        s = CreateInvitationSerializer(
            data={'email': 'new@example.com', 'role': 'member'},
            context={'request': _fake_request_with_org(self.org)},
        )
        self.assertTrue(s.is_valid(), s.errors)

    def test_existing_member_rejected(self):
        s = CreateInvitationSerializer(
            data={'email': 'existing@example.com', 'role': 'member'},
            context={'request': _fake_request_with_org(self.org)},
        )
        self.assertFalse(s.is_valid())
        self.assertIn('email', s.errors)

    def test_existing_member_email_rejected_case_insensitively(self):
        """Regression test: validate_email used an invalid `isxact` lookup
        which raised a FieldError (500) on every invite attempt."""
        s = CreateInvitationSerializer(
            data={'email': 'EXISTING@EXAMPLE.COM', 'role': 'member'},
            context={'request': _fake_request_with_org(self.org)},
        )
        self.assertFalse(s.is_valid())
        self.assertIn('email', s.errors)

    def test_email_is_lowercased(self):
        s = CreateInvitationSerializer(
            data={'email': 'New@Example.com', 'role': 'member'},
            context={'request': _fake_request_with_org(self.org)}
        )
        s.is_valid(raise_exception=True)
        self.assertEqual(s.validated_data['email'], 'new@example.com')


class AcceptInvitationSerializerTests(TestCase):

    def setUp(self):
        self.org = make_organisation(created_by=make_user())
        self.invite = make_invitation(organisation=self.org, invited_by=self.org.created_by)

    def test_valid_token_is_valid(self):
        s = AcceptInvitationSerializer(data={'token': self.invite.token})
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.context['invitation'], self.invite)

    def test_unknown_token_rejected(self):
        s = AcceptInvitationSerializer(data={'token': 'not-a-real-token'})
        self.assertFalse(s.is_valid())
        self.assertIn('token', s.errors)

    def test_revoked_token_rejected(self):
        self.invite.revoke()
        s = AcceptInvitationSerializer(data={'token': self.invite.token})
        self.assertFalse(s.is_valid())
        self.assertIn('token', s.errors)
