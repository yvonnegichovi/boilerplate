"""
Test factories for the organisations app.
"""
from apps.authentication.tests.factories import make_user
from ..models import Organisation, Invitation, Membership
from rest_framework_simplejwt.tokens import RefreshToken


def make_organisation(created_by=None, **kwargs):
    """Create and return an Organisation."""
    if created_by is None:
        created_by = make_user()
    defaults = {'name': 'Test Org', 'slug': 'test-org'}
    defaults.update(kwargs)
    return Organisation.objects.create(created_by=created_by, **defaults)


def make_membership(user=None, organisation=None, role=Membership.Role.MEMBER, **kwargs):
    """Create and return a Membership."""
    if user is None:
        user = make_user()
    if organisation is None:
        organisation = make_organisation()
    return Membership.objects.create(user=user, organisation=organisation, role=role, **kwargs)


def make_invitation(organisation=None, invited_by=None, **kwargs):
    """Create and return an invitation."""
    if organisation is None:
        organisation = make_organisation()
    if invited_by is None:
        invited_by = organisation.created_by
    defaults = {'email': 'invitee@example.com', 'role': Membership.Role.MEMBER}
    defaults.update(kwargs)
    return Invitation.objects.create(organisation=organisation, invited_by=invited_by, **defaults)


def auth_client(client, user):
    """Attach a valid JWT for `user` to `client` and return it."""
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client
