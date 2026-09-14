"""
Monitoring API documentation constants.
Shared values imported by views.py and applied directly as decorators.
"""

from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiResponse,
    extend_schema,
    inline_serializer,
)
from rest_framework import serializers

from .serializers import PeriodicTaskSerializer, TaskResultSerializer

MONITORING_TAG = ["Monitoring"]
_detail_message = inline_serializer(
    name="DetailMessage",
    fields={"detail": serializers.CharField()},
)

UNAUTHENTICATED_RESPONSE = OpenApiResponse(
    response=_detail_message,
    description="Authentication credentials were missing, invalid, or expired.",
    examples=[
        OpenApiExample(
            "Not authenticated",
            value={"detail": "Authentication credentials were not provided."},
            response_only=True,
        ),
    ],
)

FORBIDDEN_RESPONSE = OpenApiResponse(
    response=_detail_message,
    description="Authenticated, but not a Django staff/superuser account.",
    examples=[
        OpenApiExample(
            "Not staff",
            value={
                "detail": "You do not have permission to view system monitoring data."
            },
            response_only=True,
        ),
    ],
)

SERVER_ERROR_RESPONSE = OpenApiResponse(
    response=_detail_message,
    description=(
        "Unexpected server error (e.g. the results database or broker is "
        "unreachable in a way the view doesn't already handle)."
    ),
    examples=[
        OpenApiExample(
            "Server error",
            value={"detail": "A server error occurred."},
            response_only=True,
        ),
    ],
)

celery_stats_docs = extend_schema(
    tags=MONITORING_TAG,
    summary="Celery task stats",
    description=(
        "Aggregate counts of Celery task results by status, the average "
        "task duration, and the number of enabled periodic (Beat) tasks. "
        "Staff/superusers only."
    ),
    responses={
        200: inline_serializer(
            name="CeleryStats",
            fields={
                "total": serializers.IntegerField(),
                "by_status": serializers.DictField(child=serializers.IntegerField()),
                "avg_duration_seconds": serializers.FloatField(allow_null=True),
                "periodic_task_count": serializers.IntegerField(),
            },
        ),
        401: UNAUTHENTICATED_RESPONSE,
        403: FORBIDDEN_RESPONSE,
        500: SERVER_ERROR_RESPONSE,
    },
    examples=[
        OpenApiExample(
            "Stats",
            value={
                "total": 128,
                "by_status": {
                    "SUCCESS": 120,
                    "FAILURE": 3,
                    "STARTED": 2,
                    "PENDING": 3,
                },
                "avg_duration_seconds": 0.092,
                "periodic_task_count": 1,
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
)

celery_task_result_list_docs = extend_schema(
    tags=MONITORING_TAG,
    summary="Recent Celery task results",
    description="Returns the most recent Celery task results. Staff/superusers only.",
    responses={
        200: TaskResultSerializer(many=True),
        401: UNAUTHENTICATED_RESPONSE,
        403: FORBIDDEN_RESPONSE,
        500: SERVER_ERROR_RESPONSE,
    },
    examples=[
        OpenApiExample(
            "Succeeded task",
            value={
                "task_id": "6cb33a60-08fb-4884-8c7a-9698d7395f7c",
                "task_name": "apps.monitoring.tasks.heartbeat",
                "status": "SUCCESS",
                "worker": "celery@worker-01",
                "date_created": "2026-09-07T18:58:41.014Z",
                "date_done": "2026-09-07T18:58:41.104Z",
                "duration_seconds": 0.09,
                "result": '"ok"',
                "traceback": None,
            },
            response_only=True,
            status_codes=["200"],
        ),
        OpenApiExample(
            "Failed task",
            value={
                "task_id": "c39f8496-b117-401c-8dac-82a95dcc3396",
                "task_name": "apps.monitoring.tasks.heartbeat",
                "status": "FAILURE",
                "worker": "celery@worker-01",
                "date_created": "2026-09-07T18:59:41.014Z",
                "date_done": "2026-09-07T18:59:41.098Z",
                "duration_seconds": 0.08,
                "result": None,
                "traceback": (
                    "Traceback (most recent call last):\n  ...\n"
                    "ConnectionError: broker unreachable"
                ),
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
)

periodic_task_list_docs = extend_schema(
    tags=MONITORING_TAG,
    summary="Scheduled (Celery Beat) periodic tasks",
    description=(
        "Lists every entry in the Celery Beat schedule (core.celery.app.conf.beat_schedule) "
        "and how it's configured. Staff/superusers only."
    ),
    responses={
        200: PeriodicTaskSerializer(many=True),
        401: UNAUTHENTICATED_RESPONSE,
        403: FORBIDDEN_RESPONSE,
        500: SERVER_ERROR_RESPONSE,
    },
    examples=[
        OpenApiExample(
            "Beat schedule",
            value={
                "name": "heartbeat-every-minute",
                "task": "apps.monitoring.tasks.heartbeat",
                "schedule": "every 60s",
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
)

celery_worker_ping_docs = extend_schema(
    tags=MONITORING_TAG,
    summary="Live Celery worker status",
    description=(
        "Pings connected Celery workers via the broker (1s timeout) and "
        "returns which ones responded. An empty list means no worker is "
        "running or the broker is unreachable. Staff/superusers only."
    ),
    responses={
        200: inline_serializer(
            name="CeleryWorkerPing",
            fields={
                "workers_online": serializers.IntegerField(),
                "workers": serializers.ListField(child=serializers.CharField()),
            },
        ),
        401: UNAUTHENTICATED_RESPONSE,
        403: FORBIDDEN_RESPONSE,
        500: SERVER_ERROR_RESPONSE,
    },
    examples=[
        OpenApiExample(
            "Workers online",
            value={"workers_online": 1, "workers": ["celery@worker-01"]},
            response_only=True,
            status_codes=["200"],
        ),
        OpenApiExample(
            "No workers responding",
            value={"workers_online": 0, "workers": []},
            response_only=True,
            status_codes=["200"],
        ),
    ],
)

flower_session_docs = extend_schema(
    tags=MONITORING_TAG,
    summary="Start a Flower proxy session",
    description=(
        "Mints a short-lived (5 minute), HttpOnly cookie that authorizes "
        "subsequent requests to /flower/ (see apps.monitoring.flower_proxy) "
        "- call this right before navigating the browser there. Staff/"
        "superusers only. No response body."
    ),
    responses={
        204: OpenApiResponse(description="Session cookie set."),
        401: UNAUTHENTICATED_RESPONSE,
        403: FORBIDDEN_RESPONSE,
        500: SERVER_ERROR_RESPONSE,
    },
)
