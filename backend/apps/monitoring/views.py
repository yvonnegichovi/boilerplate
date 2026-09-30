"""
Views for the monitoring app.

Celery task/worker performance tracking for the frontend's monitoring
page. Every endpoint here is gated to Django staff/superusers only (see
permissions.IsStaffUser) - this is global system-health data, not scoped
to an organisation.
"""

from core.celery import app as celery_app
from django.db.models import Avg, Count, DurationField, ExpressionWrapper, F
from django_celery_results.models import TaskResult
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .docs import (
    celery_stats_docs,
    celery_task_result_list_docs,
    celery_worker_ping_docs,
    periodic_task_list_docs,
)
from .permissions import IsStaffUser
from .serializers import PeriodicTaskSerializer, TaskResultSerializer


def _format_schedule(schedule):
    """
    Render a celery.conf.beat_schedule entry's `schedule` value for display.

    It's a plain number of seconds for interval-based tasks (all we use
    today), or a celery.schedules.crontab/solar instance whose __str__ is
    already human-readable.
    """
    if isinstance(schedule, (int, float)):
        return f"every {schedule:g}s"
    return str(schedule)


def _periodic_tasks():
    """Shape celery_app.conf.beat_schedule (a plain dict) into a list of dicts."""
    return [
        {
            "name": name,
            "task": entry["task"],
            "schedule": _format_schedule(entry["schedule"]),
        }
        for name, entry in celery_app.conf.beat_schedule.items()
    ]


@celery_stats_docs
class CeleryStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStaffUser]

    def get(self, request, *args, **kwargs):
        qs = TaskResult.objects.all()

        by_status = {}
        for row in qs.values("status").annotate(count=Count("task_id")):
            by_status[row["status"]] = row["count"]

        duration = ExpressionWrapper(
            F("date_done") - F("date_created"), output_field=DurationField()
        )
        avg_duration = (
            qs.exclude(date_done__isnull=True)
            .annotate(duration=duration)
            .aggregate(avg=Avg("duration"))["avg"]
        )

        return Response(
            {
                "total": qs.count(),
                "by_status": by_status,
                "avg_duration_seconds": (
                    round(avg_duration.total_seconds(), 3) if avg_duration else None
                ),
                "periodic_task_count": len(celery_app.conf.beat_schedule),
            }
        )


@celery_task_result_list_docs
class CeleryTaskResultListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsStaffUser]
    serializer_class = TaskResultSerializer
    queryset = TaskResult.objects.order_by("-date_created")


@periodic_task_list_docs
class PeriodicTaskListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, IsStaffUser]
    serializer_class = PeriodicTaskSerializer
    pagination_class = None

    def get_queryset(self):
        return _periodic_tasks()


@celery_worker_ping_docs
class CeleryWorkerPingView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStaffUser]

    def get(self, request, *args, **kwargs):
        try:
            pings = celery_app.control.inspect(timeout=1.0).ping() or {}
        except Exception:
            pings = {}

        return Response({"workers_online": len(pings), "workers": list(pings.keys())})
