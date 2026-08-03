"""
Tests for the organisations model.
"""

from datetime import timedelta

from apps.authentication.tests.factories import make_user
from django.test import TestCase
from django.utils import timezone

from ..models import Invitation, Membership, Organisation
from .factories import make_invitation, make_membership, make_organisation


class OrganisationModelTests(TestCase):
    def setUp(self):
        self.owner = make_user()
        self.org = make_organisation(created_by=self.owner)

    def test_str_representation(self):
        self.assertEqual(str(self.org), "Test Org")

    def test_slug_must_be_unique(self):
        with self.assertRaises(Exception):
            make_organisation(created_by=self.owner, name="Other", slug="test-org")

    def test_created_by_set_null_when_user_deleted(self):
        self.owner.delete()
        self.org.refresh_from_db()
        self.assertIsNone(self.org.created_by)

    def test_ordering_is_alphabetical_by_name(self):
        make_organisation(
            created_by=self.owner, name="Aardvark Org", slug="aardvark-org"
        )
        names = list(Organisation.objects.values_list("name", flat=True))
        self.assertEqual(names[0], "Aardvark Org")


class MembershipModelTests(TestCase):
    def setUp(self):
        self.user = make_user()
        self.org = make_organisation(created_by=self.user)

    def test_default_role_is_member(self):
        membership = Membership.objects.create(user=self.user, organisation=self.org)
        self.assertEqual(membership.role, Membership.Role.MEMBER)

    def test_is_owner_true_only_for_owner_role(self):
        m = make_membership(
            user=self.user, organisation=self.org, role=Membership.Role.OWNER
        )
        self.assertTrue(m.is_owner)
        self.assertFalse(m.is_admin)

    def test_is_admin_true_only_for_admin_role(self):
        m = make_membership(
            user=self.user, organisation=self.org, role=Membership.Role.ADMIN
        )
        self.assertTrue(m.is_admin)
        self.assertFalse(m.is_owner)

    def test_membership_deleted_when_user_deleted(self):
        other = make_user(email="other@example.com")
        make_membership(user=other, organisation=self.org)
        other.delete()
        self.assertFalse(Membership.objects.filter(user_id=other.id).exists())

    def test_unique_user_organisation_constraint(self):
        make_membership(
            user=self.user, organisation=self.org, role=Membership.Role.OWNER
        )
        with self.assertRaises(Exception):
            make_membership(
                user=self.user, organisation=self.org, role=Membership.Role.MEMBER
            )


class InvitationModelTests(TestCase):
    def setUp(self):
        self.owner = make_user()
        self.org = make_organisation(created_by=self.owner)

    def test_default_status_is_pending(self):
        invite = make_invitation(organisation=self.org, invited_by=self.owner)
        self.assertEqual(invite.status, Invitation.Status.PENDING)

    def test_default_role_is_member(self):
        invite = make_invitation(
            organisation=self.org, invited_by=self.owner, email="x@example.com"
        )
        self.assertEqual(invite.role, Membership.Role.MEMBER)

    def test_token_is_generated_and_unique(self):
        i1 = make_invitation(
            organisation=self.org, invited_by=self.owner, email="a@example.com"
        )
        i2 = make_invitation(
            organisation=self.org, invited_by=self.owner, email="b@example.com"
        )
        self.assertNotEqual(i1.token, i2.token)

    def test_is_expired_false_for_new_invite(self):
        invite = make_invitation(organisation=self.org, invited_by=self.owner)
        self.assertFalse(invite.is_expired)

    def test_is_expired_true_past_expiry(self):
        invite = make_invitation(organisation=self.org, invited_by=self.owner)
        invite.expires_at = timezone.now() - timedelta(days=1)
        invite.save(update_fields=["expires_at"])
        self.assertTrue(invite.is_expired)

    def test_is_valid_true_when_pending_and_not_expired(self):
        invite = make_invitation(organisation=self.org, invited_by=self.owner)
        self.assertTrue(invite._is_valid)

    def test_accept_creates_membership_and_marks_accepted(self):
        invite = make_invitation(
            organisation=self.org, invited_by=self.owner, email="new@example.com"
        )
        new_user = make_user(email="new@example.com")
        invite.accept(new_user)
        self.assertEqual(invite.status, Invitation.Status.ACCEPTED)
        self.assertTrue(
            Membership.objects.filter(user=new_user, organisation=self.org).exists()
        )

    def test_accept_uses_invitation_role(self):
        invite = make_invitation(
            organisation=self.org,
            invited_by=self.owner,
            email="new@example.com",
            role=Membership.Role.ADMIN,
        )
        new_user = make_user(email="new@example.com")
        invite.accept(new_user)
        membership = Membership.objects.get(user=new_user, organisation=self.org)
        self.assertEqual(membership.role, Membership.Role.ADMIN)

    def test_accept_raises_when_already_accepted(self):
        invite = make_invitation(
            organisation=self.org, invited_by=self.owner, email="new@example.com"
        )
        new_user = make_user(email="new@example.com")
        invite.accept(new_user)
        with self.assertRaises(ValueError):
            invite.accept(new_user)

    def test_accept_raises_when_expired(self):
        invite = make_invitation(
            organisation=self.org, invited_by=self.owner, email="new@example.com"
        )
        invite.expires_at = timezone.now() - timedelta(days=1)
        invite.save(update_fields=["expires_at"])
        new_user = make_user(email="new@example.com")
        with self.assertRaises(ValueError):
            invite.accept(new_user)

    def test_revoke_marks_revoked(self):
        invite = make_invitation(organisation=self.org, invited_by=self.owner)
        invite.revoke()
        self.assertEqual(invite.status, Invitation.Status.REVOKED)

    def test_revoke_raises_when_not_pending(self):
        invite = make_invitation(organisation=self.org, invited_by=self.owner)
        invite.revoke()
        with self.assertRaises(ValueError):
            invite.revoke()
