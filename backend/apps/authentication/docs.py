"""
Authentication API documentation.

All @extend_schema decorators live here to keep views.py clean.
"""

from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiExample,
    OpenApiResponse,
    OpenApiParameter,
)
from drf_spectacular.types import OpenApiTypes
from .seriliazers import (
    RegisterSerializer,
    UserSerializer,
    LogoutSerializer,
    ChangePasswordSerializer,
    UpdateProfileSerializer,
)

AUTH_TAG = ['Authentication']

register_docs = extend_schema(
    tags=AUTH_TAG,
    summary='Register a new user',
    description=(
        'Creates a new user account and returns JWT access and refresh tokens '
        'alongside the created user object. The client is instantly authenticated '
        'after registration - no separate login step required.'
    ),
    request=RegisterSerializer,
    responses={
        201: OpenApiResponse(
            response=UserSerializer,
            description='User created successfully. Returns tokens and user object.',
        ),
        400: OpenApiResponse(description='Validation error - check field-level errors in the response body.'),
    },
    examples=[
        OpenApiExample(
            'Registration payload',
            value={
                'email': 'jane@example.com',
                'first_name': 'Jane',
                'last_name': 'Doe',
                'phone_number': '+2547000000000',
                'password': 'securepassword123',
                'password_confirm': 'securepassword123',
            },
            request_only=True
        ),
        OpenApiExample(
            'Successful registration',
            value={
                'user': {
                    'id': '550e8400-e29b-41d4-a716-446655440000',
                    'email': 'jane@example.com',
                    'first_name': 'Jane',
                    'last_name': 'Doe',
                    'full_name': 'Jane Doe',
                    'phone_number': '+254700000000',
                    'avatar': None,
                    'date_joined': '2024-01-01T00:00:00Z',
                },
                'tokens': {
                    'access': 'eyJ0eXAiOiJKV1QiLCJhbGci...',
                    'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGci...',
                },
            },
            response_only=True,
        ),
    ],
)

login_docs = extend_schema(
    tags=AUTH_TAG,
    summary='Login',
    description=(
        'authenticates a user with email and password. '
        'Returns a JWT access token (60-minute lifetime), a refresh token '
        '(7-day lifetime), and the authentiiicated user object.'
    ),
    responses={
        200: OpenApiResponse(description='Login successful.'),
        401: OpenApiResponse(description='Invalid credentials.'),
    },
    examples=[
        OpenApiExample(
            'Login payload',
            value={'email': 'jane@example.com', 'password': 'securepassword123'},
            request_only=True,
        ),
        OpenApiExample(
            'Successful login',
            value={
                'access': 'eyJ0eXAiOiJKV1QiLCJhbGci...',
                'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGci...',
                'user': {
                    'id': '550e8400-e29b-41d4-a716-446655440000',
                    'email': 'jane@example.com',
                    'first_name': 'Jane',
                    'last_name': 'Doe',
                    'full_name': 'Jane Doe',
                    'phone_number': '+25470000000000',
                    'avatar': None,
                    'date_joined': '2026-07-05T00:00:00Z',
                },
            },
            response_only=True,
        ),
    ],
)

logout_docs = extend_schema(
    tags=AUTH_TAG,
    summary='Logout',
    description=(
        'Blacklists the provided refresh token. '
        'The access token will remain valid until its 60-minutes expiry, '
        'but the refresh token can no loger be used to obtain new tokens.'
    ),
    request=LogoutSerializer,
    responses={
        200: OpenApiResponse(description='Successfully logged out.'),
        400: OpenApiResponse(description='Refresh token missing or already logged out.'),
    },
    examples=[
        OpenApiExample(
            'Logout payload',
            value={'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGci...'},
            request_only=True,
        ),
        OpenApiExample(
            'Success',
            value={'detail': 'Successfully logged out.'},
            response_only=True,
        ),
    ],
)


token_refresh_docs = extend_schema(
    tags=AUTH_TAG,
    summary='Refresh access token',
    description=(
        'Issues a new access token using a valid refresh token. '
        'The refresh token is rotated on each use - a new refresh token is returned '
        'and the oold one is blacklisted.'
    ),
    responses={
        200: OpenApiResponse(description='New tokens issued.'),
        401: OpenApiResponse(description='Refresh token is invalid or expired.'),
    },
    examples=[
        OpenApiExample(
            'Token refreshed',
            value={
                'access': 'eyJ0eXAiOiJKV1QiLCJhbGci...',
                'refresh': 'eyJ0eXAiOiJKV1QiLCJhbGci...',
            },
            response_only=True,
        ),
    ],
)


me_retrieve_docs = extend_schema(
    tags=AUTH_TAG,
    summary='Get current user',
    description='Returns the profile of the currently authenticated user.',
    responses={200: UserSerializer},
)
 
me_update_docs = extend_schema(
    tags=AUTH_TAG,
    summary='Update profile',
    description=(
        'Partially updates the authenticated user\'s profile. '
        'All fields are optional. To update avatar, send multipart/form-data.'
    ),
    request=UpdateProfileSerializer,
    responses={200: UpdateProfileSerializer},
    examples=[
        OpenApiExample(
            'Update name and phone',
            value={'first_name': 'Jane', 'phone_number': '+254711000000'},
            request_only=True,
        ),
    ],
)
 
me_put_docs = extend_schema(exclude=True)
 

change_password_docs = extend_schema(
    tags=AUTH_TAG,
    summary='Change password',
    description='Changes the authenticated user\'s password. Requires the current password.',
    request=ChangePasswordSerializer,
    responses={
        200: OpenApiResponse(description='Password changed successfully.'),
        400: OpenApiResponse(description='Old password incorrect or validation failed.'),
    },
    examples=[
        OpenApiExample(
            'Change password payload',
            value={
                'old_password': 'currentpassword123',
                'new_password': 'newsecurepassword456',
            },
            request_only=True,
        ),
        OpenApiExample(
            'Success',
            value={'detail': 'Password updated successfully.'},
            response_only=True,
        ),
    ],
)
 
change_password_patch_docs = extend_schema(exclude=True)
 