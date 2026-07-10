"""
Views of the tasks app.
"""

from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import Task
from .serializers import TaskSerializer, TaskWriteSerializer
from .docs import (
    TASKS_TAG,
    TASK_FILTERS,
)


@extend_schema_view(
    list=extend_schema(
        tags=TASKS_TAG,
        summary="List tasks",
        description=(
            "Returns all tasks owned by the authenticated user. "
            "Supports filtering by `status` and `priority`, "
            "and ordering by `due_date`, `created_at`, or `priority`."
        ),
        parameters=TASK_FILTERS,
        responses={200: TaskSerializer(many=True)},
    ),
    create=extend_schema(
        tags=TASKS_TAG,
        summary="Create a task",
        description="Creates a new task owned by the authenticated user.",
        request=TaskWriteSerializer,
        responses={201: TaskSerializer},
    ),
)
class TaskListCreateView(generics.ListCreateAPIView):
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["status", "priority"]
    ordering_fields = ["due_date", "created_at", "priority"]
    ordering = ["-created_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Task.objects.none()
        return Task.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TaskWriteSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


@extend_schema_view(
    retrieve=extend_schema(
        tags=TASKS_TAG,
        summary="Get a task",
        description="Returns a single task. Only the task owner can access it.",
        responses={200: TaskSerializer},
    ),
    partial_update=extend_schema(
        tags=TASKS_TAG,
        summary="Update a task",
        description="Partially updates a task. Only the task owner can update it.",
        request=TaskWriteSerializer,
        responses={200: TaskSerializer},
    ),
    destroy=extend_schema(
        tags=TASKS_TAG,
        summary="Delete a task",
        description="Permanently deletes a task. Only the task owner can delete it.",
        responses={204: None},
    ),
    update=extend_schema(exclude=True),
)
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Task.objects.none()
        return Task.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return TaskWriteSerializer
        return TaskSerializer

    def perform_update(self, serializer):
        serializer.save(owner=self.request.user)
