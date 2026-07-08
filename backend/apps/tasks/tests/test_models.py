"""
Test tasks model
"""
import uuid
from datetime import date, timedelta
from django.test import TestCase
from apps.authentication.tests.factories import make_user
from apps.tasks.models import Task
from .factories import make_task


class TaskModelTests(TestCase):

    def setUp(self):
        self.user = make_user()
        self.task = make_task(owner=self.user)

    def test_primary_key_is_uuid(self):
        self.assertIsInstance(self.task.id, uuid.UUID)

    def test_str_representation(self):
        self.assertEqual(str(self.task), 'Test Task [todo]')

    def test_default_status_is_todo(self):
        self.assertEqual(self.task.status, Task.Status.TODO)

    def test_default_priority_is_medium(self):
        self.assertEqual(self.task.priority, Task.Priority.MEDIUM)

    def test_owner_relationship(self):
        self.assertEqual(self.task.owner, self.user)

    def test_task_deleted_when_owner_deleted(self):
        user = make_user(email='deleteme@example.com')
        make_task(owner=user)
        user_id = user.id
        user.delete()
        self.assertFalse(Task.objects.filter(owner_id=user_id).exists())

    def test_description_is_optional(self):
        task = make_task(owner=self.user, description='')
        self.assertEqual(task.description, '')
 
    def test_due_date_is_optional(self):
        task = make_task(owner=self.user, due_date=None)
        self.assertIsNone(task.due_date)

    def test_created_at_set_on_creation(self):
        self.assertIsNotNone(self.task.created_at)

    def test_updated_at_changes_on_save(self):
        original = self.task.updated_at
        self.task.title = 'Updated Title'
        self.task.save()
        self.task.refresh_from_db()
        self.assertGreaterEqual(self.task.updated_at, original)
 
    def test_ordering_is_newest_first(self):
        task2 = make_task(owner=self.user, title='Second Task')
        tasks = list(Task.objects.filter(owner=self.user))
        self.assertEqual(tasks[0], task2)
        self.assertEqual(tasks[1], self.task)
