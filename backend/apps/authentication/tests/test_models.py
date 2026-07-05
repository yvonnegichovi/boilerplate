"""
Test for the User model and UserManager.
"""
import uuid
from django.test import TestCase
from django.contrib.auth import get_user_model
from .factories import make_user, make_superuser, DEFAULT_PASSWORD

User = get_user_model()


class UserManagerTests(TestCase):

    def test_create_user_succeeds(self):
        user = make_user()
        self.assertEqual(user.email, 'jane@example.com')
        self.assertEqual(user.first_name, 'Jane')
        self.assertEqual(user.last_name, 'Doe')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_user_password_is_hashed(self):
        user = make_user()
        self.assertTrue(user.check_password(DEFAULT_PASSWORD))
        self.assertEqual(user.email, 'jane@example.com')

    def test_create_user_email_is_normalised(self):
        user = make_user(email='Jane@EXAMPLE.COM')
        self.assertEqual(user.email, 'Jane@example.com')

    def test_create_user_without_email_raises(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password=DEFAULT_PASSWORD,
                                     first_name='Jane', last_name='Doe')
            
    def test_create_superuser_sets_flags(self):
        user = make_superuser()
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)

    def test_duplicate_email_raises(self):
        make_user()
        from django.db import IntegrityError
        with self.assertRaises(IntegrityError):
            make_user()


class UserModelTests(TestCase):

    def setUp(self):
        self.user = make_user()

    def test_primary_key_is_uuid(self):
        self.assertIsInstance(self.user.id, uuid.UUID)

    def test_str_returns_email(self):
        self.assertEqual(str(self.user), 'jane@example.com')

    def tests_full_name_property(self):
        self.assertEqual(self.user.full_name, 'Jane Doe')

    def test_full_name_strips_whitespace(self):
        user = make_user(email='noname@example.com', first_name='', last_name='')
        self.assertEqual(user.full_name, '')

    def test_phone_number_is_optional(self):
        user = make_user(email='nophone@example.com', phone_number=None)
        self.assertIsNone(user.phone_number)

    def test_avatar_is_optional(self):
        self.assertFalse(bool(self.user.avatar))

    def test_date_joined_is_set_on_creation(self):
        self.assertIsNotNone(self.user.date_joined)

    def test_updated_at_changes_on_save(self):
        original = self.user.updated_at
        self.user.first_name = 'Janet'
        self.user.save()
        self.user.refresh_from_db()
        self.assertGreaterEqual(self.user.updated_at, original)
