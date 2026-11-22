"""
Celery tasks for the monitoring app.

`heartbeat` is a trivial demo task, not real business logic - it exists so
Celery Beat has something to schedule and the performance-tracking page
(see apps.monitoring.views) has real task-result data to display out of
the box. Its periodic schedule is seeded by
migrations/0001_seed_heartbeat_schedule.py.
"""

import logging
import time

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(name="apps.monitoring.tasks.heartbeat")
def heartbeat():
    """Log a tick and return how long it took - proves Beat -> worker -> result end-to-end."""
    started = time.monotonic()
    logger.info("Celery heartbeat tick")
    return {"ok": True, "duration_ms": round((time.monotonic() - started) * 1000, 2)}
