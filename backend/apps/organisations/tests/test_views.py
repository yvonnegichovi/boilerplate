from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.authentication.tests.factories import make_user
from ..models import Organisation, Membership, Invitation
from .factories import make_organisation, make_membership, make_invitation, auth_client

LIST_URL = '/api/organisations/'
def detail_url(slug): return f'/api/organisations/{slug}/'
def members_url(slug): return f'/api/organisations/{slug}/members/'
def member_detail_url(slug, pk): return f'/api/organisations/{slug}/members/{pk}/'
def invitations_url(slug): return f'/api/organisations/{slug}/invitations/'
def invitation_detail_url(slug, pk): return f'/api/organisations/{slug}/invitations/{pk}/'
def preview_url(token): return f'/api/invitations/preview/{token}/'
def accept_url(token): return f'/api/invitations/accept/{token}/'


class OrganisationListCreateViewTests(APITestCase):

    def setUp(self):
        self.user = make_user()
        auth_client(self.client, self.user)

    def test_unauthenticated_returns_401(self):
        self.client.credentials()
        res = self.client.get(LIST_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_only_returns_orgs_user_belongs_to(self):
        mine = make_organisation(created_by=self.user, name='Mine', slug='mine')
        make_membership(user=self.user, organisation=mine, role=Membership.Role.OWNER)
        other_owner = make_user(email='other@example.com')
        make_organisation(created_by=other_owner, name='Theirs', slug='theirs')
        res = self.client.get(LIST_URL)
        slugs = [o['slug'] for o in res.data['results']]
        self.assertIn('mine', slugs)
        self.assertNotIn('theirs', slugs)

    def test_create_returns_201(self):
        res = self.client.post(LIST_URL, {'name': 'New Org'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_makes_creator_the_owner(self):
        """Regression test: the creator previously received the 'admin' role
        instead of 'owner', so owner-only actions (like deleting the org)
        were permanently unreachable."""
        res = self.client.post(LIST_URL, {'name': 'New Org'}, format='json')
        self.assertEqual(res.data['your_role'], 'owner')
        membership = Membership.objects.get(user=self.user, organisation__slug=res.data['slug'])
        self.assertEqual(membership.role, Membership.Role.OWNER)

    def test_create_with_empty_name_returns_400(self):
        res = self.client.post(LIST_URL, {'name': '  '}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class OrganisationDetailViewTests(APITestCase):
 
    def setUp(self):
        self.org = make_organisation(created_by=make_user(), name='Detail Org', slug='detail-org')
        self.owner = make_user(email='owner@example.com')
        self.admin = make_user(email='admin@example.com')
        self.member = make_user(email='member@example.com')
        self.outsider = make_user(email='outsider@example.com')
        make_membership(user=self.owner, organisation=self.org, role=Membership.Role.OWNER)
        make_membership(user=self.admin, organisation=self.org, role=Membership.Role.ADMIN)
        make_membership(user=self.member, organisation=self.org, role=Membership.Role.MEMBER)

    def test_member_can_retrieve(self):
        auth_client(self.client, self.member)
        res = self.client.get(detail_url(self.org.slug))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
 
    def test_outsider_cannot_retrieve(self):
        auth_client(self.client, self.outsider)
        res = self.client.get(detail_url(self.org.slug))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
 
    def test_admin_can_update(self):
        auth_client(self.client, self.admin)
        res = self.client.patch(detail_url(self.org.slug), {'name': 'Renamed'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
 
    def test_owner_can_update(self):
        """Regression coverage: owner must satisfy the admin-or-owner check."""
        auth_client(self.client, self.owner)
        res = self.client.patch(detail_url(self.org.slug), {'name': 'Renamed Again'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
 
    def test_member_cannot_update(self):
        auth_client(self.client, self.member)
        res = self.client.patch(detail_url(self.org.slug), {'name': 'Nope'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
 
    def test_owner_can_delete(self):
        auth_client(self.client, self.owner)
        res = self.client.delete(detail_url(self.org.slug))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Organisation.objects.filter(id=self.org.id).exists())
 
    def test_admin_cannot_delete(self):
        auth_client(self.client, self.admin)
        res = self.client.delete(detail_url(self.org.slug))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class MemberViewTests(APITestCase):
 
    def setUp(self):
        self.org = make_organisation(created_by=make_user(), name='Member Org', slug='member-org')
        self.owner = make_user(email='owner@example.com')
        self.admin = make_user(email='admin@example.com')
        self.member = make_user(email='member@example.com')
        self.owner_membership = make_membership(user=self.owner, organisation=self.org, role=Membership.Role.OWNER)
        self.admin_membership = make_membership(user=self.admin, organisation=self.org, role=Membership.Role.ADMIN)
        self.member_membership = make_membership(user=self.member, organisation=self.org, role=Membership.Role.MEMBER)
 
    def test_member_can_list_members(self):
        auth_client(self.client, self.member)
        res = self.client.get(members_url(self.org.slug))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 3)
 
    def test_outsider_cannot_list_members(self):
        auth_client(self.client, make_user(email='outsider@example.com'))
        res = self.client.get(members_url(self.org.slug))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
 
    def test_admin_can_promote_member(self):
        auth_client(self.client, self.admin)
        res = self.client.patch(member_detail_url(self.org.slug, self.member_membership.id), {'role': 'admin'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.member_membership.refresh_from_db()
        self.assertEqual(self.member_membership.role, Membership.Role.ADMIN)
 
    def test_member_cannot_change_roles(self):
        auth_client(self.client, self.member)
        res = self.client.patch(member_detail_url(self.org.slug, self.admin_membership.id), {'role': 'member'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
 
    def test_cannot_remove_self(self):
        auth_client(self.client, self.admin)
        res = self.client.delete(member_detail_url(self.org.slug, self.admin_membership.id))
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
 
    def test_cannot_remove_owner(self):
        auth_client(self.client, self.admin)
        res = self.client.delete(member_detail_url(self.org.slug, self.owner_membership.id))
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
 
    def test_admin_can_remove_regular_member(self):
        auth_client(self.client, self.admin)
        res = self.client.delete(member_detail_url(self.org.slug, self.member_membership.id))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Membership.objects.filter(id=self.member_membership.id).exists())


class InvitationViewTests(APITestCase):
 
    def setUp(self):
        self.org = make_organisation(created_by=make_user(), name='Invite Org', slug='invite-org')
        self.owner = make_user(email='owner@example.com')
        self.member = make_user(email='member@example.com')
        make_membership(user=self.owner, organisation=self.org, role=Membership.Role.OWNER)
        make_membership(user=self.member, organisation=self.org, role=Membership.Role.MEMBER)
 
    def test_owner_can_create_invitation(self):
        """Regression test: creating an invitation previously raised a 500
        (FieldError from an invalid `isexact` lookup) for every request."""
        auth_client(self.client, self.owner)
        res = self.client.post(invitations_url(self.org.slug), {'email': 'new@example.com', 'role': 'member'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['status'], 'pending')
 
    def test_member_cannot_create_invitation(self):
        auth_client(self.client, self.member)
        res = self.client.post(invitations_url(self.org.slug), {'email': 'new@example.com', 'role': 'member'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
 
    def test_cannot_invite_existing_member(self):
        auth_client(self.client, self.owner)
        res = self.client.post(invitations_url(self.org.slug), {'email': 'member@example.com', 'role': 'member'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
 
    def test_owner_can_revoke_pending_invitation(self):
        auth_client(self.client, self.owner)
        invite = make_invitation(organisation=self.org, invited_by=self.owner, email='pending@example.com')
        res = self.client.delete(invitation_detail_url(self.org.slug, invite.id))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        invite.refresh_from_db()
        self.assertEqual(invite.status, Invitation.Status.REVOKED)
 
    def test_cannot_revoke_already_accepted_invitation(self):
        auth_client(self.client, self.owner)
        invite = make_invitation(organisation=self.org, invited_by=self.owner, email='done@example.com')
        invite.accept(make_user(email='done@example.com'))
        res = self.client.delete(invitation_detail_url(self.org.slug, invite.id))
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class InvitePreviewAndAcceptViewTests(APITestCase):
 
    def setUp(self):
        self.org = make_organisation(created_by=make_user(), name='Preview Org', slug='preview-org')
        self.owner = make_user(email='owner@example.com')
        make_membership(user=self.owner, organisation=self.org, role=Membership.Role.OWNER)
        self.invite = make_invitation(organisation=self.org, invited_by=self.owner, email='newperson@example.com')
 
    def test_preview_valid_token_returns_200(self):
        res = self.client.get(preview_url(self.invite.token))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['organisation_slug'], self.org.slug)
 
    def test_preview_invalid_token_returns_404(self):
        res = self.client.get(preview_url('not-a-real-token'))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
 
    def test_accept_new_user_creates_account_and_membership(self):
        res = self.client.post(accept_url(self.invite.token), {
            'first_name': 'New', 'last_name': 'Person', 'password': 'SuperSecret123!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.invite.refresh_from_db()
        self.assertEqual(self.invite.status, Invitation.Status.ACCEPTED)
        self.assertTrue(Membership.objects.filter(
            user__email='newperson@example.com', organisation=self.org
        ).exists())
 
    def test_accept_missing_fields_returns_400(self):
        res = self.client.post(accept_url(self.invite.token), {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
 
    def test_accept_invalid_token_returns_400(self):
        res = self.client.post(accept_url('not-a-real-token'), {
            'first_name': 'New', 'last_name': 'Person', 'password': 'SuperSecret123!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
 
    def test_accept_existing_email_without_login_returns_400(self):
        make_user(email='newperson@example.com')
        res = self.client.post(accept_url(self.invite.token), {
            'first_name': 'New', 'last_name': 'Person', 'password': 'SuperSecret123!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
 
    def test_accept_authenticated_user_joins_immediately(self):
        existing_user = make_user(email='newperson@example.com')
        auth_client(self.client, existing_user)
        res = self.client.post(accept_url(self.invite.token), {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(Membership.objects.filter(user=existing_user, organisation=self.org).exists())
 
    def test_accept_expired_invite_returns_400(self):
        self.invite.expires_at = timezone.now() - timedelta(days=1)
        self.invite.save(update_fields=['expires_at'])
        res = self.client.post(accept_url(self.invite.token), {
            'first_name': 'New', 'last_name': 'Person', 'password': 'SuperSecret123!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
 