"""
Urls for tasks APIs
"""
from django.urls import path
from .views import TaskListCreateView, TaskDetailView, TaskStatsView

urlpatterns = [
    path('', TaskListCreateView.as_view(), name='task-list-create'),
    path('stats/', TaskStatsView.as_view(), name='task-stats'),
    path('<uuid:pk>/', TaskDetailView.as_view(), name='task-detail'),
]