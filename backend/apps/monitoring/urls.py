"""
Urls for the monitoring (Celery performance tracking) API.
"""

from django.urls import path

from .flower_proxy import FlowerSessionView
from .views import (
    CeleryStatsView,
    CeleryTaskResultListView,
    CeleryWorkerPingView,
    PeriodicTaskListView,
)

urlpatterns = [
    path("stats/", CeleryStatsView.as_view(), name="celery-stats"),
    path("tasks/", CeleryTaskResultListView.as_view(), name="celery-task-results"),
    path(
        "periodic-tasks/",
        PeriodicTaskListView.as_view(),
        name="celery-periodic-tasks",
    ),
    path("workers/", CeleryWorkerPingView.as_view(), name="celery-workers"),
    # Not itself a proxy endpoint - see apps.monitoring.flower_proxy for the
    # actual /flower/... reverse proxy, mounted at the site root in core/urls.py.
    path("flower/session/", FlowerSessionView.as_view(), name="flower-session"),
]
