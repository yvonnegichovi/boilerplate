"""
Urls for the organisation app.
"""
from django.urls import path, include
from .views import (
    OrganisationDetailView,
    OrganisationalListCreateView,
    MemberDetailView,
    MemberListView,
    InvitationListCreateView,
    InvitationRevokeView,
    InvitePreviewView,
    InviteAcceptView,
)

org_detail_patterns = [
    path('', OrganisationDetailView.as_view(), name='org-detail'),
    path('members/', MemberListView.as_view(), name='org_members'),
    path('members/<uuid:pk>/', MemberDetailView.as_view(), name='org-member-detail'),
    path('invitations/', InvitationListCreateView.as_view(), name='org-invitations'),
    path('invitations/<uuid:pk>/', InvitationRevokeView.as_view(), name='org-invitation-revoke'),
    path('tasks/', include('apps.tasks.urls')),
]

urlpatterns = [
    path('', OrganisationalListCreateView.as_view(), name='org-list-create'),
    path('<slug:slug>/', include(org_detail_patterns)),
]

# Public, token-based invite routes - not org-scoped, so mounted separately
# under /api/invitations/ (see core/urls.py) rather than under org_detail_patterns.
invitation_patterns = [
    path('preview/<str:token>/', InvitePreviewView.as_view(), name='invite-preview'),
    path('accept/<str:token>/', InviteAcceptView.as_view(), name='invite-accept'),
]
