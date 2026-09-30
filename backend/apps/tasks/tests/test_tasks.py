"""
Tests for the tasks app's Celery tasks.
"""

import uuid
from datetime import date

from apps.authentication.tests.factories import make_user
from apps.organisations.tests.factories import make_organisation
from django.core import mail
from django.test import TestCase

from ..models import Task
from ..tasks import send_task_created_email
from .factories import make_task


class SendTaskCreatedEmailTests(TestCase):
    def setUp(self):
        self.owner = make_user(email="owner@example.com")

    def test_sends_email_to_owner_for_personal_task(self):
        task = make_task(owner=self.owner, title="Write tests", due_date=None)

        result = send_task_created_email(str(task.id))

        self.assertEqual(result, {"sent": True, "task_id": str(task.id)})
        self.assertEqual(len(mail.outbox), 1)
        sent = mail.outbox[0]
        self.assertEqual(sent.to, ["owner@example.com"])
        self.assertIn("Write tests", sent.subject)
        self.assertIn("medium priority", sent.body)
        self.assertNotIn(" in ", sent.body)  # no organisation to mention

    def test_mentions_organisation_and_due_date_when_present(self):
        org = make_organisation(created_by=self.owner, name="Acme Corp")
        task = make_task(
            owner=self.owner,
            organisation=org,
            title="Ship it",
            priority=Task.Priority.HIGH,
            due_date=date(2026, 12, 31),
        )

        send_task_created_email(str(task.id))

        sent = mail.outbox[0]
        self.assertIn("Acme Corp", sent.body)
        self.assertIn("high priority", sent.body)
        self.assertIn("2026-12-31", sent.body)

    def test_missing_task_does_not_raise(self):
        result = send_task_created_email(str(uuid.uuid4()))

        self.assertEqual(result, {"sent": False, "reason": "task_not_found"})
        self.assertEqual(len(mail.outbox), 0)
