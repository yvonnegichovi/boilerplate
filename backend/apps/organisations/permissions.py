"""
Organisation-level permissions

IsOrgMember - any member role
IsOrgAdmin - admin or owner role
IsOrgOwner - owner role only
"""
import logging
from rest_framework.permissions import BasePermission
from .models import Membership

logger = logging.getLogger(__name__)


def _get_membership(request):
    org = getattr(request, 'org', None)
    if not org or not request.user.is_authenticated:
        logger.debug("No organisation found or user not authenticated")
        return None
    try:
        return Membership.objects.filter(user=request.user, organisation=org).first()
    except Membership.DoesNotExist:
        logger.debug("Membership not found")
        return None
    

class IsOrgMember(BasePermission):
    """
    Allows access only to members of the organisation.
    """
    message = "You are not a member of this organisation."
    def has_permission(self, request, view):
        membership = _get_membership(request)
        return membership is not None
    

class IsOrgAdmin(BasePermission):
    """
    Allows access only to admins or owners of the organisation.
    """
    message = "You are not an admin of this organisation."
    def has_permission(self, request, view):
        membership = _get_membership(request)
        return membership is not None and membership.is_admin


class IsOrgOwner(BasePermission):
    """
    Allows access only to owners of the organisation.
    """
    message = "You are not the owner of this organisation."
    def has_permission(self, request, view):
        membership = _get_membership(request)
        return membership is not None and membership.is_owner
