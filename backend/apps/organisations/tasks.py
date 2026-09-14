"""
Celery tasks for the organisations app.
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


@shared_task(name="apps.organisations.tasks.send_invitation_email")
def send_invitation_email(invitation_id):
    """Email an organisation invite link to the invited address."""
    from .models import Invitation

    try:
        invitation = Invitation.objects.select_related(
            "organisation", "invited_by"
        ).get(id=invitation_id)
    except Invitation.DoesNotExist:
        logger.warning(
            "send_invitation_email: invitation %s no longer exists", invitation_id
        )
        return {"sent": False, "reason": "invitation_not_found"}

    if invitation.invited_by:
        inviter_name = invitation.invited_by.full_name or invitation.invited_by.email
    else:
        inviter_name = "Someone"
    accept_url = f"{settings.FRONTEND_URL}/invitations/accept/{invitation.token}"

    send_mail(
        subject=f"You've been invited to join {invitation.organisation.name}",
        message=(
            f"{inviter_name} invited you to join {invitation.organisation.name} "
            f"as a {invitation.get_role_display()}.\n\n"
            f"Accept the invitation: {accept_url}\n\n"
            "This invitation expires in 7 days."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[invitation.email],
        fail_silently=False,
    )
    logger.info("Invitation email sent to %s", invitation.email)
    return {"sent": True, "invitation_id": str(invitation.id)}
