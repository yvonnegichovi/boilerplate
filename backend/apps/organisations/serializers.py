"""
Serializers for the organisations app.
"""
import logging
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from .models import Organisation, Membership, Invitation

User = get_user_model()
logger = logging.getLogger(__name__)

class OrganisationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Organisation model.
    """
    member_count = serializers.SerializerMethodField()
    your_role = serializers.SerializerMethodField()

    class Meta:
        model = Organisation
        fields = ['id', 'name', 'slug', 'logo', 'member_count', 'your_role', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        """
        Get the number of members in the organisation.
        """
        return obj.memberships.count()

    def get_your_role(self, obj):
        """
        Get the role of the current user in the organisation.
        """
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                membership = obj.memberships.filter(user=request.user).first()
                logger.info(f"Membership found for user {request.user.id} in organisation {obj.id}: {membership.role if membership else 'None'}")
                return membership.role
            except Membership.DoesNotExist:
                logger.info(f"No membership found for user {request.user.id} in organisation {obj.id}")
                pass
        return None
    

class OrganisationWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Organisation instances.
    """
    class Meta:
        model = Organisation
        fields = ['name', 'logo']

    def validate_name(self, value):
        """
        Validate that the organisation name is unique.
        """
        if not value.strip():
            logger.debug("Attempted to create an organisation with an empty name.")
            raise serializers.ValidationError("Organisation name cannot be empty.")
        return value.strip()

    def create(self, validated_data):
        """
        Create a new Organisation instance with a slug generated from the name.
        """
        name = validated_data.get('name')
        base_slug = slugify(name)
        slug = base_slug
        counter = 1
        while Organisation.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        validated_data['slug'] = slug
        logger.info(f"Creating organisation with name '{name}' and slug '{slug}'")
        return super().create(validated_data)
    
class MembershipSerializer(serializers.ModelSerializer):
    """
    Serializer for the Membership model.
    """
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model = Membership
        fields = ['id', 'email', 'full_name', 'avatar', 'role', 'joined_at']
        read_only_fields = ['id', 'email', 'full_name', 'avatar', 'joined_at']

    
class UpdateMemberRoleSerializer(serializers.ModelSerializer):
    """
    Serializer for updating the role of a Membership instance.
    """
    class Meta:
        model = Membership
        fields = ['role']

    def validate_role(self, value):
        """
        Validate that the role is one of the allowed choices.
        """
        if self.instance and self.instance.role == Membership.Role.OWNER and value != Membership.Role.OWNER:
            logger.debug(f"Attempted to change role of owner membership {self.instance.id} to '{value}'.")
            raise serializers.ValidationError("The owner cannot be changed. Transfer Ownership first.")
        if value == Membership.Role.OWNER:
            logger.debug(f"Attempted to assign owner role to membership {self.instance.id}.")
            raise serializers.ValidationError("Cannot assign owner role directly. Transfer Ownership first.")
        return value
    

class InvitationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Invitation model.
    """
    invited_by_email = serializers.EmailField(source='invited_by.email', read_only=True)
    Organisation_name = serializers.CharField(source='organisation.name', read_only=True)

    class Meta:
        model = Invitation
        fields = ['id', 'email', 'role', 'status', 'invited_by_email', 'Organisation_name', 'expires_at', 'created_at']
        read_only_fields = ['id', 'status', 'invited_by_email', 'Organisation_name', 'expires_at', 'created_at']

    def validate_email(self, value):
        """
        Validate that the email is not already a member of the organisation.
        """
        org = self.context['request'].org
        if Membership.objects.filter(user__email=value, organisation=org).exists():
            logger.debug(f"Attempted to invite existing member with email '{value}' to organisation {org.id}.")
            raise serializers.ValidationError("This user is already a member of the organisation.")
        return value
    

class CreateInvitationSerializer(serializers.ModelSerializer):
    """
    Serializer for creating Invitation instances.
    """
    class Meta:
        model = Invitation
        fields = ['email', 'role']

    def validate_email(self, value):
        """
        Validate that the email is not already a member of the organisation.
        """
        org = self.context['request'].org
        if Membership.objects.filter(
            user__email__isexact=value,
            organisation=org,
        ).exists():
            logger.debug(f"Attempted to invite existing member with email '{value}' to organisation {org.id}.")
            raise serializers.ValidationError("This user is already a member of the organisation.")
        return value.lower()
    

class AcceptInvitationSerializer(serializers.Serializer):
    """
    Serializer for accepting an invitation.
    If the user has no account, first_name, last_name, and password are required.
    If the user is already authenticated, those fields are ignored.
    """
    token = serializers.CharField()
    # We need fields for new users registering through invites
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    password = serializers.CharField(required=False, write_only=True)

    def validate_token(self, value):
        """
        Validate that the token corresponds to a valid and non-expired invitation.
        """
        try:
            invitation = Invitation.objects.select_related('organisation').get(token=value)
            if not invitation._is_valid:
                logger.debug(f"Attempted to accept an invalid or expired invitation with token '{value}'.")
                raise serializers.ValidationError("This invitation is no longer valid.")
        except Invitation.DoesNotExist:
            logger.debug(f"Attempted to accept a non-existent invitation with token '{value}'.")
            raise serializers.ValidationError("Invalid invitation token.")
        self.context['invitation'] = invitation
        return value
    

class InviteDetailsSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying details of an invitation.
    """
    invited_by_name = serializers.CharField(source='invited_by.full_name', read_only=True)
    organisation_name = serializers.CharField(source='organisation.name', read_only=True)
    organisation_slug = serializers.CharField(source='organisation.slug', read_only=True)

    class Meta:
        model = Invitation
        fields = ['id', 'email', 'role', 'invited_by_name', 'organisation_name', 'organisation_slug', 'expires_at', 'created_at']
        read_only_fields = ['id', 'invited_by_name', 'organisation_name', 'organisation_slug', 'expires_at', 'created_at']
