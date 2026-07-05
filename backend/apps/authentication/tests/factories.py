"""
Test factories for authentication app.
Centralises user creation do every test starts from the same baseline.
"""
from django.contrib.auth import get_user_model

User = get_user_model()

DEFAULT_PASSWORD = 'TestPassword123!'


def make_user(**kwargs) -> User:
    """Create and return a regulaer user."""
    defaults = {
        'email': 'jane@example.com',
        'first_name': 'Jane',
        'last_name': 'Doe',
        'phone_number': '+2547000000000',
        'password': DEFAULT_PASSWORD,
    }
    defaults.update(kwargs)
    return User.objects.create_user(**defaults)


def make_superuser(**kwargs) -> User:
    """Create and return a superuser."""
    defaults = {
        'email': 'admin@example.com',
        'first_name': 'Admin',
        'last_name': 'User',
        'password': DEFAULT_PASSWORD,
    }
    defaults.update(kwargs)
    return User.objects.create_superuser(**defaults)
