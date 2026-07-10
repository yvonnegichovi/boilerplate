"""
Models for organisations app.

Architecture:
- Organisation: the tenant. Every resource belongs to an organisation.
- Membership: the link between a User and an Organisation. It defines the role of the user in the organisation.
- Invitationn : a token-based invite that allows anyone (with or without an account) to join an organisation.
"""
import logging
import uuid
import secrets
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class Organisation(models.Model):
    """
    An organisation is a tenant. Every resource belongs to an organisation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='org_logos/', null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_organisations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organisations'
        ordering = ['name']

    def __str__(self):
        return self.name
    

class Membership(models.Model):
    """
    A membership is the link between a User and an Organisation.
    It defines the role of the user in the organisation.
    """
    class Role(models.TextChoices):
        MEMBER = 'member', 'Member'
        ADMIN = 'admin', 'Admin'
        OWNER = 'owner', 'Owner'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    organisation = models.ForeignKey(
        Organisation,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    role = models.CharField(max_length=10, choices=Role.choices, default='Role.MEMBER')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'memberships'
        ordering = ['joined_at']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'organisation'],
                name='unique_user_organisation_membership',
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.organisation.name} ({self.role})"
    
    @property
    def is_owner(self):
        return self.role == self.Role.OWNER
    
    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN


def _invitation_expiry():
    return timezone.now() + timedelta(days=7)

def _invitation_token():
    return secrets.token_urlsafe(32)


class Invitation(models.Model):
    """
    An invitation is a token-based invite that allows anyone (with or without an account) to join an organisation.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        EXPIRED = 'expired', 'Expired'
        REVOKED = 'revoked', 'Revoked'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organisation = models.ForeignKey(
        Organisation,
        on_delete=models.CASCADE,
        related_name='invitations'
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_invitations'
    )
    email = models.EmailField()
    token = models.CharField(max_length=64, default=_invitation_token, unique=True)
    role = models.CharField(max_length=10, choices=Membership.Role.choices, default='Role.MEMBER')
    status = models.CharField(max_length=10, choices=Status.choices, default='Status.PENDING')
    expires_at = models.DateTimeField(default=_invitation_expiry)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invitations'
        ordering = ['created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['organisation', 'email'],
                name='unique_organisation_email_invitation',
            )
        ]

    def __str__(self):
        return f"Invitation for {self.email} to join {self.organisation.name} as {self.role}"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def _is_valid(self):
        return self.status == self.Status.PENDING and not self.is_expired
    
    @property
    def accepted(self, user):
        """
        Accept the invitation. This method should be called when a user accepts the invitation.
        It will create a membership for the user and mark the invitation as accepted.
        """
        if not self._is_valid:
            logger.warning(f"Attempt to accept an invalid invitation: {self.id}")
            raise ValueError("This invitation is no longer valid.")
        Membership.objects.get_or_create(
            user=user,
            organisation=self.organisation,
            defaults={'role': self.role},
        )
        self.status = self.Status.ACCEPTED
        self.save(updated_fields=['status'])

    def revoke(self):
        """
        Revoke the invitation. This method should be called when an admin wants to revoke an invitation.
        It will mark the invitation as revoked.
        """
        if self.status != self.Status.PENDING:
            logger.warning(f"Attempt to revoke a non-pending invitation: {self.id}")
            raise ValueError("Only pending invitations can be revoked.")
        self.status = self.Status.REVOKED
        self.save(updated_fields=['status'])    
