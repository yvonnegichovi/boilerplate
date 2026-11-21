"""
Lightweight, unauthenticated health check for uptime monitoring.
Deliberately outside the DRF permission/auth stack — this needs to respond
correctly even if JWT config or a user table is broken, since that's exactly
the kind of failure an uptime check exists to catch.
"""

import time

from django.db import connection
from django.http import JsonResponse


def health(request):
    start = time.monotonic()
    db_status = "ok"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:
        db_status = "unreachable"

    response_time_ms = round((time.monotonic() - start) * 1000, 1)
    overall_ok = db_status == "ok"

    return JsonResponse(
        {
            "status": "ok" if overall_ok else "degraded",
            "db": db_status,
            "response_time_ms": response_time_ms,
        },
        status=200 if overall_ok else 503,
    )
