"""
Celery tasks for the tasks app.
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


@shared_task(name="apps.tasks.tasks.send_task_created_email")
def send_task_created_email(task_id):
    """Email a task's owner confirming it was created."""
    from .models import Task

    try:
        task = Task.objects.select_related("owner", "organisation").get(id=task_id)
    except Task.DoesNotExist:
        logger.warning("send_task_created_email: task %s no longer exists", task_id)
        return {"sent": False, "reason": "task_not_found"}

    where = f" in {task.organisation.name}" if task.organisation else ""
    due = f", due {task.due_date}" if task.due_date else ""

    send_mail(
        subject=f"Task created: {task.title}",
        message=(
            f'Your task "{task.title}"{where} was created with '
            f"{task.get_priority_display().lower()} priority{due}."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[task.owner.email],
        fail_silently=False,
    )
    logger.info("Task-created email sent to %s for task %s", task.owner.email, task.id)
    return {"sent": True, "task_id": str(task.id)}
