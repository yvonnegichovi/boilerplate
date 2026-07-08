"""
Serializers test for the tasks app.
"""
from datetime import date, timedelta
from django.test import TestCase
from apps.authentication.tests.factories import make_user
from ..serializers import TaskWriteSerializer
from .factories import make_task


class TaskWriteSerializerTests(TestCase):

    def setUp(self):
        self.user = make_user()

    def _valid_data(self, **overrides):
        data = {
            'title': 'New Task',
            'description': 'Description here.',
            'status': 'todo',
            'priority': 'medium',
            'due_date': str(date.today() + timedelta(days=5)),
        }
        data.update(overrides)
        return data
    
    def test_valid_data_is_valid(self):
        s = TaskWriteSerializer(data=self._valid_data())
        self.assertTrue(s.is_valid(), s.errors)

    def test_title_required(self):
        s = TaskWriteSerializer(data=self._valid_data(title=''))
        self.assertFalse(s.is_valid())
        self.assertIn('title', s.errors)

    def test_invalid_status_rejected(self):
        s = TaskWriteSerializer(data=self._valid_data(status='invalid'))
        self.assertFalse(s.is_valid())
        self.assertIn('status', s.errors)

    def test_invalid_priority_rejected(self):
        s = TaskWriteSerializer(data=self._valid_data(priority='urgent'))
        self.assertFalse(s.is_valid())
        self.assertIn('priority', s.errors)
 
    def test_past_due_date_rejected(self):
        s = TaskWriteSerializer(data=self._valid_data(
            due_date=str(date.today() - timedelta(days=1))
        ))
        self.assertFalse(s.is_valid())
        self.assertIn('due_date', s.errors)
 
    def test_due_date_optional(self):
        data = self._valid_data()
        data.pop('due_date')
        s = TaskWriteSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)
 
    def test_description_optional(self):
        s = TaskWriteSerializer(data=self._valid_data(description=''))
        self.assertTrue(s.is_valid(), s.errors)
 
    def test_all_status_choices_valid(self):
        for status in ['todo', 'in_progress', 'done']:
            s = TaskWriteSerializer(data=self._valid_data(status=status))
            self.assertTrue(s.is_valid(), f'{status} should be valid')
 
    def test_all_priority_choices_valid(self):
        for priority in ['low', 'medium', 'high']:
            s = TaskWriteSerializer(data=self._valid_data(priority=priority))
            self.assertTrue(s.is_valid(), f'{priority} should be valid')
