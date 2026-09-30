"""
Celery application instance for the core project.

Import `app` from this module (never instantiate Celery elsewhere) so
Django's management commands, the ASGI/WSGI entrypoints, and every
`@shared_task` in the apps below all share one app instance.
"""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

app = Celery("core")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.autodiscover_tasks()

app.conf.beat_schedule = {
    "heartbeat-every-minute": {
        "task": "apps.monitoring.tasks.heartbeat",
        "schedule": 60.0,
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
