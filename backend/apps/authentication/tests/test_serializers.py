"""
Tests for authentication serializers.
"""
from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from apps.authentication.seriliazers import (
    RegisterSerializer,
    UserSerializer,
    ChangePasswordSerializer,
    UpdateProfileSerializer,
)
from .factories import make_user, DEFAULT_PASSWORD

User = get_user_model()


class RegisterSerializersTests(TestCase):

    def _valid_data(self, **overrides):
        data =  {
            'email': 'new@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'phone_number': '+2547000000000',
            'password': DEFAULT_PASSWORD,
            'password_confirm': DEFAULT_PASSWORD,
        }
        data.update(overrides)
        return data
    
    def test_valid_data_creates_user(self):
        s = RegisterSerializer(data=self._valid_data())
        self.assertTrue(s.is_valid(), s.errors)
        user = s.save()
        self.assertEqual(user.email, 'new@example.com')
        self.assertTrue(user.check_password(DEFAULT_PASSWORD))

    def test_mismatched_passwords_invalid(self):
        s = RegisterSerializer(data=self._valid_data(password_confirm='WromgPass999!'))
        self.assertFalse(s.is_valid())
        self.assertIn('password', s.errors)

    def test_duplicate_email_invalid(self):
        make_user(email='new@example.com')
        s = RegisterSerializer(data=self._valid_data())
        self.assertFalse(s.is_valid())
        self.assertIn('email', s.errors)

    def test_phone_number_is_optional(self):
        data = self._valid_data()
        data.pop('phone_number')
        s = RegisterSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)

    def test_password_not_returned_in_output(self):
        s = RegisterSerializer(data=self._valid_data())
        s.is_valid()
        user = s.save()
        out = UserSerializer(user)
        self.assertNotIn('password', out.data)

    def test_weak_password_invalid(self):
        s = RegisterSerializer(data=self._valid_data(password='123', password_confirm='123'))
        self.assertFalse(s.is_valid())
        self.assertIn('password', s.errors)


class UserSerializerTests(TestCase):

    def setUp(self):
        self.user = make_user()

    def test_contains_expected_fields(self):
        data = UserSerializer(self.user).data
        expected = {'id', 'email', 'first_name', 'last_name', 'full_name',
                    'phone_number', 'avatar', 'date_joined'}
        self.assertEqual(set(data.keys()), expected)
 
    def test_full_name_is_computed(self):
        data = UserSerializer(self.user).data
        self.assertEqual(data['full_name'], 'Jane Doe')
 
    def test_id_is_string_uuid(self):
        data = UserSerializer(self.user).data
        import uuid
        uuid.UUID(str(data['id']))


class ChangePasswordSerializerTests(TestCase):
 
    def setUp(self):
        self.user = make_user()
        self.factory = RequestFactory()
 
    def _make_request(self):
        request = self.factory.put('/')
        request.user = self.user
        return request
 
    def test_valid_password_change(self):
        s = ChangePasswordSerializer(
            data={'old_password': DEFAULT_PASSWORD, 'new_password': 'NewSecure999!'},
            context={'request': self._make_request()},
        )
        self.assertTrue(s.is_valid(), s.errors)
        s.save()
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewSecure999!'))
 
    def test_wrong_old_password_invalid(self):
        s = ChangePasswordSerializer(
            data={'old_password': 'WrongPass!', 'new_password': 'NewSecure999!'},
            context={'request': self._make_request()},
        )
        self.assertFalse(s.is_valid())
        self.assertIn('old_password', s.errors)
 
    def test_weak_new_password_invalid(self):
        s = ChangePasswordSerializer(
            data={'old_password': DEFAULT_PASSWORD, 'new_password': '123'},
            context={'request': self._make_request()},
        )
        self.assertFalse(s.is_valid())
        self.assertIn('new_password', s.errors)
 
 
class UpdateProfileSerializerTests(TestCase):
 
    def setUp(self):
        self.user = make_user()
 
    def test_update_first_name(self):
        s = UpdateProfileSerializer(self.user, data={'first_name': 'Janet'}, partial=True)
        self.assertTrue(s.is_valid(), s.errors)
        s.save()
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Janet')
 
    def test_update_phone_number(self):
        s = UpdateProfileSerializer(self.user, data={'phone_number': '+2547000000000'}, partial=True)
        self.assertTrue(s.is_valid(), s.errors)
        s.save()
        self.user.refresh_from_db()
        self.assertEqual(self.user.phone_number, '+2547000000000')
 
    def test_email_not_updatable_via_profile(self):
        """Email should not be a field in UpdateProfileSerializer."""
        fields = UpdateProfileSerializer().fields.keys()
        self.assertNotIn('email', fields)
