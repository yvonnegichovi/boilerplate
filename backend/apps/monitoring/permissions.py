"""
Permissions for the monitoring app.

IsStaffUser - Django staff/superusers only. This is a *global* admin
check (unrelated to organisation roles like IsOrgAdmin/IsOrgOwner in
apps.organisations.permissions) since Celery/worker health isn't scoped
to a tenant.
"""

from rest_framework.permissions import BasePermission


class IsStaffUser(BasePermission):
    """Allows access only to Django staff/superuser accounts."""

    message = "You do not have permission to view system monitoring data."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_staff)
