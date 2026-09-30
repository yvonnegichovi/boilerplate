"""
Tests for the organisations app's Celery tasks.
"""

import uuid

from apps.authentication.tests.factories import make_user
from django.core import mail
from django.test import TestCase

from ..tasks import send_invitation_email
from .factories import make_invitation, make_organisation


class SendInvitationEmailTests(TestCase):
    def setUp(self):
        self.inviter = make_user(email="owner@example.com")
        self.org = make_organisation(created_by=self.inviter, name="Acme Corp")

    def test_sends_email_to_invitee(self):
        invitation = make_invitation(
            organisation=self.org,
            invited_by=self.inviter,
            email="invitee@example.com",
        )

        result = send_invitation_email(str(invitation.id))

        self.assertEqual(result, {"sent": True, "invitation_id": str(invitation.id)})
        self.assertEqual(len(mail.outbox), 1)
        sent = mail.outbox[0]
        self.assertEqual(sent.to, ["invitee@example.com"])
        self.assertIn("Acme Corp", sent.subject)
        self.assertIn(f"/invitations/accept/{invitation.token}", sent.body)
        self.assertIn("Jane Doe", sent.body)

    def test_falls_back_to_generic_name_when_inviter_missing(self):
        invitation = make_invitation(
            organisation=self.org, invited_by=self.inviter, email="invitee@example.com"
        )
        invitation.invited_by = None
        invitation.save(update_fields=["invited_by"])

        result = send_invitation_email(str(invitation.id))

        self.assertTrue(result["sent"])
        self.assertIn("Someone invited you", mail.outbox[0].body)

    def test_missing_invitation_does_not_raise(self):
        result = send_invitation_email(str(uuid.uuid4()))

        self.assertEqual(result, {"sent": False, "reason": "invitation_not_found"})
        self.assertEqual(len(mail.outbox), 0)
