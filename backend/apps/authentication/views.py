"""
Views for authentication app.
"""
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .seriliazers import (
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    LogoutSerializer,
    UpdateProfileSerializer,
)

from .docs import (
    register_docs,
    login_docs,
    logout_docs,
    token_refresh_docs,
    me_retrieve_docs,
    me_put_docs,
    me_update_docs,
    change_password_docs,
    change_password_patch_docs,
)


@register_docs
class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ - create a new user account."""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


@login_docs
class LoginView(TokenObtainPairView):
    """POST /api/auth/login/ - retuens access + refresh tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(email=request.data['email'])
            response.data['user'] = UserSerializer(user).data
        return response
    

@logout_docs
class LogoutView(APIView):
    """POST /api/auth/logout/ - blacklists the refresh token."""
    
    @extend_schema(
        request=LogoutSerializer,
        responses={
            200: OpenApiResponse(description='Successfully logged out.'),
            400: OpenApiResponse(description='Refresh token missing or invalid.'),
        },
        summary='Logout',
        description='Blacklists the provided refresh token, effectively logging the user out.',
    )
    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'detail': 'Successfully logged out.'},
                status=status.HTTP_200_OK,
            )
        except KeyError:
            return Response(
                {'detail': 'Refresh token required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except TokenError:
            return Response(
                {'detail': 'Token is invalid or expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ - retrieve or update the authenticated user."""

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UpdateProfileSerializer
        return UserSerializer
    
    def get_object(self):
        return self.request.user
    
    @me_retrieve_docs
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @me_update_docs
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
    
    @me_put_docs
    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
    

class ChangePasswordView(generics.UpdateAPIView):
    """PUT /api/auth/change-password/ - change authenticated user's password."""
    serializer_class = ChangePasswordSerializer

    def get_object(self):
        return self.request.user
    
    @change_password_docs
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password updated successfully.'})
    
    @change_password_patch_docs
    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
