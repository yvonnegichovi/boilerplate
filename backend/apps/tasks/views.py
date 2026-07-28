"""
Views of the tasks app.

Tasks support two modes, distinguished by whether the request URL is
org-scoped (/api/organisations/{slug}/tasks/, request.org is set by
OrgMiddleware) or flat (/api/tasks/, request.org is None):

- Org-scoped: task belongs to `request.org` and is visible to any member
  of that organisation.
- Personal: task belongs only to `request.user` (organisation is null).
"""
from django.db.models import Count
from django.utils import timezone
from rest_framework import generics, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import Task
from .serializers import TaskSerializer, TaskWriteSerializer
from apps.organisations.permissions import IsOrgMember
from .docs import (
    TASKS_TAG,
    TASK_FILTERS,
    EXAMPLE_TASK,
)


@extend_schema_view(
    list=extend_schema(
        tags=TASKS_TAG,
        summary='List tasks',
        description=(
            'Returns all tasks owned by the authenticated user. '
            'Supports filtering by `status` and `priority`, '
            'and ordering by `due_date`, `created_at`, or `priority`.'
        ),
        parameters=TASK_FILTERS,
        responses={200: TaskSerializer(many=True)},
    ),
    create=extend_schema(
        tags=TASKS_TAG,
        summary='Create a task',
        description='Creates a new task owned by the authenticated user.',
        request=TaskWriteSerializer,
        responses={201: TaskSerializer},
    ),
)
class TaskListCreateView(generics.ListCreateAPIView):
    filter_backends  = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'priority']
    ordering_fields  = ['due_date', 'created_at', 'priority']
    ordering         = ['-created_at']

    def get_permissions(self):
        if getattr(self.request, 'org', None):
            return [permissions.IsAuthenticated(), IsOrgMember()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Task.objects.none()
        org = getattr(self.request, 'org', None)
        if org:
            return Task.objects.filter(organisation=org)
        return Task.objects.filter(owner=self.request.user, organisation__isnull=True)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TaskWriteSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, organisation=getattr(self.request, 'org', None))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            TaskSerializer(serializer.instance, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    retrieve=extend_schema(
        tags=TASKS_TAG,
        summary='Get a task',
        description='Returns a single task. Only the task owner can access it.',
        responses={200: TaskSerializer},
    ),
    partial_update=extend_schema(
        tags=TASKS_TAG,
        summary='Update a task',
        description='Partially updates a task. Only the task owner can update it.',
        request=TaskWriteSerializer,
        responses={200: TaskSerializer},
    ),
    destroy=extend_schema(
        tags=TASKS_TAG,
        summary='Delete a task',
        description='Permanently deletes a task. Only the task owner can delete it.',
        responses={204: None},
    ),
    update=extend_schema(exclude=True),
)
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if getattr(self.request, 'org', None):
            return [permissions.IsAuthenticated(), IsOrgMember()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Task.objects.none()
        org = getattr(self.request, 'org', None)
        if org:
            return Task.objects.filter(organisation=org)
        return Task.objects.filter(owner=self.request.user, organisation__isnull=True)

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return TaskWriteSerializer
        return TaskSerializer

    def perform_update(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(TaskSerializer(serializer.instance, context=self.get_serializer_context()).data)


@extend_schema(
    tags=TASKS_TAG,
    summary='Task stats',
    description=(
        'Returns aggregate counts for the current task scope: total tasks, '
        'a breakdown by status and by priority, and the number of overdue '
        'tasks (past due date and not done). Scoped to the organisation when '
        'called via /organisations/{slug}/tasks/stats/, otherwise scoped to '
        "the authenticated user's personal tasks."
    ),
)
class TaskStatsView(APIView):
    """GET /tasks/stats/ (or /organisations/{slug}/tasks/stats/) - aggregate task counts."""

    def get_permissions(self):
        if getattr(self.request, 'org', None):
            return [permissions.IsAuthenticated(), IsOrgMember()]
        return [permissions.IsAuthenticated()]

    def get(self, request, *args, **kwargs):
        org = getattr(request, 'org', None)
        if org:
            qs = Task.objects.filter(organisation=org)
        else:
            qs = Task.objects.filter(owner=request.user, organisation__isnull=True)

        by_status = {choice: 0 for choice, _ in Task.Status.choices}
        by_priority = {choice: 0 for choice, _ in Task.Priority.choices}
        for row in qs.values('status').annotate(count=Count('id')):
            by_status[row['status']] = row['count']
        for row in qs.values('priority').annotate(count=Count('id')):
            by_priority[row['priority']] = row['count']

        overdue = qs.filter(
            due_date__lt=timezone.now().date(),
        ).exclude(status=Task.Status.DONE).count()

        return Response({
            'total': qs.count(),
            'by_status': by_status,
            'by_priority': by_priority,
            'overdue': overdue,
        })
