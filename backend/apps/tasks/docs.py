"""
Tasks API documentation constants.
Shared values imported by views.py and used inline with extend_schema.
"""
from drf_spectacular.utils import OpenApiParameter
from drf_spectacular.types import OpenApiTypes

TASKS_TAG = ['Tasks']

TASK_FILTERS = [
    OpenApiParameter(
        name='status',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Filter by status: `todo`, `in_progress`, `done`',
        required=False,
        enum=['todo', 'in_progress', 'done'],
    ),
    OpenApiParameter(
        name='priority',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Filter by priority: `low`, `medium`, `high`',
        required=False,
        enum=['low', 'medium', 'high'],
    ),
    OpenApiParameter(
        name='ordering',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Order results: `due_date`, `-due_date`, `created_at`, `-created_at`, `priority`',
        required=False,
    ),
]

EXAMPLE_TASK = {
    'id': '550e8400-e29b-41d4-a716-446655440000',
    'owner': 'jane@example.com',
    'title': 'Build the tasks module',
    'description': 'Implement CRUD endpoints for tasks with filtering and ordering.',
    'status': 'in_progress',
    'priority': 'high',
    'due_date': '2024-12-31',
    'created_at': '2024-01-01T00:00:00Z',
    'updated_at': '2024-01-02T00:00:00Z',
}