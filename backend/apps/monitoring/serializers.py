"""
Serializers for the monitoring app.
"""

from django_celery_results.models import TaskResult
from rest_framework import serializers


class TaskResultSerializer(serializers.ModelSerializer):
    duration_seconds = serializers.SerializerMethodField()

    class Meta:
        model = TaskResult
        fields = [
            "task_id",
            "task_name",
            "status",
            "worker",
            "date_created",
            "date_done",
            "duration_seconds",
            "result",
            "traceback",
        ]

    def get_duration_seconds(self, obj):
        if obj.date_created and obj.date_done:
            return round((obj.date_done - obj.date_created).total_seconds(), 3)
        return None


class PeriodicTaskSerializer(serializers.Serializer):
    """
    Read-only view of one entry in `celery_app.conf.beat_schedule`.

    Not model-backed (no django-celery-beat), so this just shapes the
    plain dict Celery Beat itself uses - see core/celery.py.
    """

    name = serializers.CharField()
    task = serializers.CharField()
    schedule = serializers.CharField()
