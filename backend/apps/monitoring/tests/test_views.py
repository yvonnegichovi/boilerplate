"""
View tests for the monitoring app.
"""

from apps.authentication.tests.factories import make_superuser, make_user
from django_celery_results.models import TaskResult
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

STATS_URL = "/api/monitoring/stats/"
TASKS_URL = "/api/monitoring/tasks/"
PERIODIC_TASKS_URL = "/api/monitoring/periodic-tasks/"
WORKERS_URL = "/api/monitoring/workers/"


class MonitoringAccessTests(APITestCase):
    """All monitoring endpoints are staff-only, regardless of payload."""

    def setUp(self):
        self.user = make_user()
        self.staff = make_superuser()

    def _auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_unauthenticated_returns_401(self):
        for url in (STATS_URL, TASKS_URL, PERIODIC_TASKS_URL, WORKERS_URL):
            res = self.client.get(url)
            self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_user_returns_403(self):
        self._auth_as(self.user)
        for url in (STATS_URL, TASKS_URL, PERIODIC_TASKS_URL, WORKERS_URL):
            res = self.client.get(url)
            self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_user_can_access(self):
        self._auth_as(self.staff)
        for url in (STATS_URL, TASKS_URL, PERIODIC_TASKS_URL, WORKERS_URL):
            res = self.client.get(url)
            self.assertEqual(res.status_code, status.HTTP_200_OK)


class CeleryStatsViewTests(APITestCase):
    def setUp(self):
        self.staff = make_superuser()
        self._auth_as(self.staff)

    def _auth_as(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_stats_reflect_task_results(self):
        TaskResult.objects.create(
            task_id="11111111-1111-1111-1111-111111111111",
            task_name="apps.monitoring.tasks.heartbeat",
            status="SUCCESS",
        )
        TaskResult.objects.create(
            task_id="22222222-2222-2222-2222-222222222222",
            task_name="apps.monitoring.tasks.heartbeat",
            status="FAILURE",
        )

        res = self.client.get(STATS_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["total"], 2)
        self.assertEqual(res.data["by_status"]["SUCCESS"], 1)
        self.assertEqual(res.data["by_status"]["FAILURE"], 1)

    def test_periodic_task_count_matches_beat_schedule(self):
        from core.celery import app as celery_app

        res = self.client.get(STATS_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(
            res.data["periodic_task_count"], len(celery_app.conf.beat_schedule)
        )


class PeriodicTaskListViewTests(APITestCase):
    def setUp(self):
        self.staff = make_superuser()
        refresh = RefreshToken.for_user(self.staff)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_heartbeat_schedule_is_listed(self):
        res = self.client.get(PERIODIC_TASKS_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        names = [task["name"] for task in res.data]
        self.assertIn("heartbeat-every-minute", names)


class CeleryWorkerPingViewTests(APITestCase):
    def setUp(self):
        self.staff = make_superuser()
        refresh = RefreshToken.for_user(self.staff)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_no_workers_online_in_test_env(self):
        # No live worker/broker is running under `manage.py test`, so this
        # should degrade gracefully rather than error or hang.
        res = self.client.get(WORKERS_URL)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["workers_online"], 0)
        self.assertEqual(res.data["workers"], [])
