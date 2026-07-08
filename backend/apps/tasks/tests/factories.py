"""
Sets up a task for an owner for test.
"""
from apps.authentication.tests.factories import make_user
from ..models import Task
from datetime import date, timedelta


def make_task(owner=None, **kwargs):
    """Create and return a task."""
    if owner is None:
        owner = make_user()
    defaults = {
        'title': 'Test Task',
        'description': 'A test task description.',
        'status': Task.Status.TODO,
        'priority': Task.Priority.MEDIUM,
        'due_date': date.today() + timedelta(days=7),
    }
    defaults.update(kwargs)
    return Task.objects.create(owner=owner, **defaults)