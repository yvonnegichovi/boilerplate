"""
Organisation views.
"""
import logging
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import Organisation, Membership, Invitation
from .permissions import IsOrgOwner, IsOrgMember, IsOrgAdmin
from .serializers import (
    OrganisationSerializer,
    MembershipSerializer,
    InvitationSerializer,
    OrganisationWriteSerializer,
    MembershipSerializer,
    UpdateMemberRoleSerializer,
    InvitationSerializer,
    CreateInvitationSerializer,
    AcceptInvitationSerializer,
    InviteDetailsSerializer,
)
from .docs import (
    org_create_docs,
    org_delete_docs,
    org_list_docs,
    org_retrieve_docs,
    org_update_docs,
    member_delete_docs,
    member_list_docs,
    member_update_docs,
    invitation_create_docs,
    invitation_delete_docs,
    invitation_list_docs,
    invite_accept_docs,
    invite_preview_docs,
)
from drf_spectacular.utils import extend_schema, extend_schema_view

User = get_user_model()


@extend_schema_view(list=org_list_docs, create=org_create_docs)
class OrganisationalListCreateView(generics.ListCreateAPIView):
    """GET /api/organisations/ - list all organisations the user is a member of."""

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Organisation.objects.none()
        return Organisation.objects.filter(memberships__user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrganisationWriteSerializer
        return OrganisationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        org = serializer.save(created_by=request.user)
        Membership.objects.create(
            user=request.user,
            organisation=org,
            role=Membership.Role.ADMIN,
        )
        return Response(
            OrganisationSerializer(org, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )
    

@extend_schema_view(
    retrieve=org_retrieve_docs,
    partial_update=org_update_docs,
    destroy=org_delete_docs,
    update=extend_schema(exclude=True)
)
class OrganisationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET /api/organisations/{id}/ - retrieve, update or delete an organisation."""
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.request.method in ['DELETE']:
            return [permissions.IsAuthenticated(), IsOrgOwner()]
        if self.request.method in ['PATCH', 'PUT']:
            return [permissions.IsAuthenticated(), IsOrgAdmin()]
        return [permissions.IsAuthenticated(), IsOrgMember()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Organisation.objects.none()
        return Organisation.objects.filter(memberships__user=self.request.user)
    
    def get_object(self):
        return self.request.org
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return OrganisationWriteSerializer
        return OrganisationSerializer
    
    def perform_update(self, serializer):
        serializer.save()


@extend_schema_view(list=member_list_docs)
class MemberListView(generics.ListAPIView):
    """GET /api/organisations/{org_id}/memberships/ - list all memberships of an organisation."""

    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgMember]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Membership.objects.none()
        return Membership.objects.filter(
            organisation=self.request.org
        ).select_related('user')
    

@extend_schema_view(
    partial_update=member_update_docs,
    destroy=member_delete_docs,
    update=extend_schema(exclude=True),
)
class MemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET /api/organisations/{org_id}/memberships/{user_id}/ - retrieve, update or delete a membership."""
    http_method_names = ['patch', 'delete', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated, IsOrgAdmin]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Membership.objects.none()
        return Membership.objects.filter(organisation=self.request.org)
    
    def get_serializer_class(self):
        return UpdateMemberRoleSerializer
    
    def destroy(self, request, *args, **kwargs):
        membership = self.get_object()
        if membership.user == request.user:
            return Response(
                {"detail": "You cannot remove yourself from the organisation."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if membership.role == Membership.Role.OWNER:
            return Response(
                {"detail": "You cannot remove the owner of the organisation."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

@extend_schema_view(list=invitation_list_docs, create=invitation_create_docs)
class InvitationListCreateView(generics.ListCreateAPIView):
    """
    GET /api/organisations/{org_id}/invitations/ - list all invitations of an organisation.
    POST /api/organisations/{org_id}/invitations/ - create a new invitation for an organisation.
    """
    permission_classes = [permissions.IsAuthenticated, IsOrgAdmin]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Invitation.objects.none()
        return Invitation.objects.filter(organisation=self.request.org)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateInvitationSerializer
        return InvitationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invitation = serializer.save(
            organisation=self.request.org, invited_by=self.request.user
        )
        return Response(
            InvitationSerializer(invitation).data,
            status=status.HTTP_201_CREATED,
        )
    

@extend_schema_view(destroy=invitation_delete_docs)
class InvitationRevokeView(generics.DestroyAPIView):
    """
    DELETE /api/organisations/{org_id}/invitations/{invitation_id}/ - revoke an invitation.
    """
    permission_classes = [permissions.IsAuthenticated, IsOrgAdmin]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Invitation.objects.none()
        return Invitation.objects.filter(organisation=self.request.org)
    
    def destroy(self, request, *args, **kwargs):
        invitation = self.get_object()
        if invitation.status != Invitation.Status.PENDING:
            return Response(
                {"detail": "Only pending invitations can be revoked."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        invitation.revoke()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

@invite_preview_docs
class InvitePreviewView(APIView):
    """
    GET /api/invitations/preview/?token={token} - preview an invitation.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            invitation = Invitation.objects.select_related(
                'organisation', 'invited_by'
            ).get(token=token)
        except Invitation.DoesNotExist:
            return Response(
                {"detail": "Invalid token."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            InviteDetailsSerializer(invitation).data)
    

@invite_accept_docs
class InviteAcceptView(APIView):
    """
    POST /api/invitations/accept/ - accept an invitation.

    Two cases:
    1. User is already authenticated → accept immediately.
    2. User has no account → register with first_name, last_name, password,
       then accept the invitation.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, token):
        serializer = AcceptInvitationSerializer(
            data={**request.data, 'token': token},
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        invite = serializer.context['invitation']
        if request.user.is_authenticated:
            user = request.user
        else:
            first_name = serializer.validated_data.get('first_name', '')
            last_name = serializer.validated_data.get('last_name', '')
            password = serializer.validated_data.get('password')

            if not all([first_name, last_name, password]):
                return Response(
                    {'detail': 'first_name, last_name, and password are required for new users.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                validate_password(password)
            except ValidationError as e:
                return Response({'password': e.message}, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=invite.email).exists():
                return Response(
                    {'detail': 'An account with this email already exists. Please log in first, then accept the invitation.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user = User.objects.create_user(
                email=invite.email,
                first_name=first_name,
                last_name=last_name,
                password=password,
            )
        try:
            invite.accept(user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(
            {
                'detail': f'You have joined {invite.organisation.name}.',
                'organisation': {
                    'name': invite.organisation.name,
                    'slug': invite.organisation.slug,
                },
            },
            status=status.HTTP_200_OK,
        )
