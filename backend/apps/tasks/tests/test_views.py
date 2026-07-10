"""
Views tests for the tasks app.
"""

from datetime import date, timedelta
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from apps.authentication.tests.factories import make_user
from ..models import Task
from .factories import make_task

LIST_URL = "/api/tasks/"


def detail_url(pk):
    return f"/api/tasks/{pk}/"


class TaskListCreateViewTests(APITestCase):
    def setUp(self):
        self.user = make_user()
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_unauthenticated_returns_401(self):
        self.client.credentials()
        res = self.client.get(LIST_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_returns_only_own_tasks(self):
        make_task(owner=self.user, title="My Task")
        other = make_user(email="other@example.com")
        make_task(owner=other, title="Other Task")
        res = self.client.get(LIST_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        titles = [t["title"] for t in res.data["results"]]
        self.assertIn("My Task", titles)
        self.assertNotIn("Other Task", titles)

    def test_list_empty_for_new_user(self):
        res = self.client.get(LIST_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["count"], 0)

    def test_create_task_returns_201(self):
        res = self.client.post(
            LIST_URL,
            {
                "title": "New Task",
                "status": "todo",
                "priority": "high",
                "due_date": str(date.today() + timedelta(days=5)),
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_task_sets_owner(self):
        self.client.post(
            LIST_URL,
            {"title": "Owned Task", "status": "todo", "priority": "low"},
            format="json",
        )
        task = Task.objects.get(title="Owned Task")
        self.assertEqual(task.owner, self.user)

    def test_create_task_without_title_returns_400(self):
        res = self.client.post(
            LIST_URL, {"status": "todo", "priority": "low"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", res.data)

    def test_create_task_with_past_due_date_returns_400(self):
        res = self.client.post(
            LIST_URL,
            {
                "title": "Late Task",
                "status": "todo",
                "priority": "low",
                "due_date": str(date.today() - timedelta(days=1)),
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("due_date", res.data)

    def test_filter_by_status(self):
        make_task(owner=self.user, title="Todo Task", status="todo")
        make_task(owner=self.user, title="Done Task", status="done")
        res = self.client.get(LIST_URL, {"status": "todo"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        titles = [t["title"] for t in res.data["results"]]
        self.assertIn("Todo Task", titles)
        self.assertNotIn("Done Task", titles)

    def test_filter_by_priority(self):
        make_task(owner=self.user, title="High Priority Task", priority="high")
        make_task(owner=self.user, title="Low Priority Task", priority="low")
        res = self.client.get(LIST_URL, {"priority": "high"})
        titles = [t["title"] for t in res.data["results"]]
        self.assertIn("High Priority Task", titles)
        self.assertNotIn("Low Priority Task", titles)

    def test_ordering_by_due_date(self):
        make_task(
            owner=self.user,
            title="Far Task",
            due_date=date.today() + timedelta(days=10),
        )
        make_task(
            owner=self.user,
            title="Near Task",
            due_date=date.today() + timedelta(days=2),
        )
        res = self.client.get(LIST_URL, {"ordering": "due_date"})
        titles = [t["title"] for t in res.data["results"]]
        self.assertEqual(titles[0], "Near Task")
        self.assertEqual(titles[1], "Far Task")


class TaskDetailViewTests(APITestCase):
    def setUp(self):
        self.user = make_user()
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        self.task = make_task(owner=self.user)

    def test_retrieve_own_task_returns_200(self):
        res = self.client.get(detail_url(self.task.id))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["title"], self.task.title)

    def test_retrieve_other_user_task_returns_404(self):
        other = make_user(email="other@example.com")
        other_task = make_task(owner=other)
        res = self.client.get(detail_url(other_task.id))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_updates_task(self):
        res = self.client.patch(
            detail_url(self.task.id), {"status": "done"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, "done")

    def test_patch_other_user_task_returns_404(self):
        other = make_user(email="other@example.com")
        other_task = make_task(owner=other)
        res = self.client.patch(
            detail_url(other_task.id), {"status": "done"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_own_task_returns_204(self):
        res = self.client.delete(detail_url(self.task.id))
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())

    def test_delete_other_user_task_returns_404(self):
        other = make_user(email="other@example.com")
        other_task = make_task(owner=other)
        res = self.client.delete(detail_url(other_task.id))
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Task.objects.filter(id=other_task.id).exists())

    def test_unauthenticated_returns_401(self):
        self.client.credentials()
        res = self.client.get(detail_url(self.task.id))
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
