"""
Organisations API documentation constants.
"""
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

ORG_TAG = ['Organisations']
INVITE_TAG = ['Invitations']

org_list_docs = extend_schema(
    tags=ORG_TAG,
    summary='List my organisations',
    description='Returns all organisations the authenticated user is a member of.',
    responses={200: OpenApiResponse(description='List of organisations.'),}
)

org_create_docs = extend_schema(
    tags=ORG_TAG,
    summary='Create an organisation',
    description=(
        'Creates a new organisation. The authenticated user automatically '
        'becomes the owner. A unique slug is generated from the name.'
    ),
    responses={
        201: OpenApiResponse(description='Organisation created.'),
        400: OpenApiResponse(description='Validation error.'),
    },
)

org_retrieve_docs = extend_schema(
    tags=ORG_TAG,
    summary='Get organisation',
    description='Returns organisation details. Requires membership.',
    responses={
        200: OpenApiResponse(description='Organisation detail.'),
        404: OpenApiResponse(description='Organisation not found.'),
    },
)

org_update_docs = extend_schema(
    tags=ORG_TAG,
    summary='Update organisation',
    description='Updates organisation name or logo. Requires admin or owner role.',
    responses={
        200: OpenApiResponse(description='Organisation updated.'),
        403: OpenApiResponse(description='Insufficient permissions.'),
    },
)

org_delete_docs = extend_schema(
    tags=ORG_TAG,
    summary='Delete organisation',
    description='Permanently deletes the organisation and all its data. Owner only.',
    responses={
        204: OpenApiResponse(description='Organisation deleted.'),
        403: OpenApiResponse(description='Owner role required.'),
    },
)

member_list_docs = extend_schema(
    tags=ORG_TAG,
    summary='List members',
    description='Return all members of the organisation.',
    responses={200: OpenApiResponse(description='Member list.')},
)

member_update_docs = extend_schema(
    tags=ORG_TAG,
    summary='Update member role',
    description='Updates a member\'s role. admin or owner only. Cannot change the owner\'s role.',
    responses={
        200: OpenApiResponse(description='Role updated.'),
        400: OpenApiResponse(description='Cannot change owner role.'),
        403: OpenApiResponse(description='Insufficient permissions.'),
    },
)

member_delete_docs = extend_schema(
    tags=ORG_TAG,
    summary='Remove member',
    description='Removes a member from the organisation. Admin or owner only. Cannot remove the owner.',
    responses={
        204: OpenApiResponse(description='Mmember removed.'),
        400: OpenApiResponse(description='Cannot remove owner.'),
        403: OpenApiResponse(description='Insufficient permissions.'),
    },
)

invitation_list_docs = extend_schema(
    tags=INVITE_TAG,
    summary='List invitations',
    description='Returns all invitations for the organisation. Admin or owner only.',
    responses={200: OpenApiResponse(description='Invitation list.')},
)

invitation_create_docs = extend_schema(
    tags=INVITE_TAG,
    summary='Send invitation',
    description=(
        'Sends an invitation to an email address. Admin or owner only. '
        'The invite link is valid for 7 days. '
        'If the email already has a pending invite or is already a member, a 400 is returned.'
    ),
    responses={
        201: OpenApiResponse(description='Invitation created.'),
        400: OpenApiResponse(description='Already a member or invite already sent.'),
    },
)

invitation_delete_docs = extend_schema(
    tags=INVITE_TAG,
    summary='Revoke invitation',
    description='Revokes a pending invitation. Admin or owner only.',
    responses={
        204: OpenApiResponse(description='Invitation revoked.'),
        400: OpenApiResponse(description='Invitation is not pending.'),
    },
)

invite_preview_docs = extend_schema(
    tags=INVITE_TAG,
    summary='Preview invitation',
    description='Returns invitation details for a given token. Public endpoint - no authentication required.',
    responses={
        200: OpenApiResponse(description='Invitation detail.'),
        404: OpenApiResponse(description='Invalid token.'),
    },
)

invite_accept_docs = extend_schema(
    tags=INVITE_TAG,
    summary='Accept invitation',
    description=(
        'Accepts an invitation. Two flows:\n\n'
        '**Existing user (authenticated):** Send the request with a valid JWT. '
        'No additional fields needed.\n\n'
        '**New user (not authenticated):** Provide `first_name`, `last_name`, '
        'and `password`. An account will be created using the invited email address, '
        'then the invitation is accepted automatically.'
    ),
    responses={
        200: OpenApiResponse(description='Invitation accepted, membership created.'),
        400: OpenApiResponse(description='Invalid token, expired invite, or missing fields.'),
    },
)
