"""
Integration tests for authentication API endpoints.
Tests the full request/response cycle for every endpoint.
"""

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .factories import make_user, DEFAULT_PASSWORD

User = get_user_model()


class RegisterViewTests(APITestCase):
    url = "/api/auth/register/"

    def _payload(self, **overrides):
        data = {
            "email": "new@example.com",
            "first_name": "New",
            "last_name": "User",
            "phone_number": "+254700000000",
            "password": DEFAULT_PASSWORD,
            "password_confirm": DEFAULT_PASSWORD,
        }
        data.update(overrides)
        return data

    def test_register_returns_201(self):
        res = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_register_returns_tokens_and_user(self):
        res = self.client.post(self.url, self._payload(), format="json")
        self.assertIn("tokens", res.data)
        self.assertIn("access", res.data["tokens"])
        self.assertIn("refresh", res.data["tokens"])
        self.assertIn("user", res.data)
        self.assertEqual(res.data["user"]["email"], "new@example.com")

    def test_register_creates_user_in_db(self):
        self.client.post(self.url, self._payload(), format="json")
        self.assertTrue(User.objects.filter(email="new@example.com").exists())

    def test_register_mismatched_passwords_returns_400(self):
        res = self.client.post(
            self.url, self._payload(password_confirm="Wrong!"), format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email_returns_400(self):
        make_user(email="new@example.com")
        res = self.client.post(self.url, self._payload(), format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_required_fields_returns_400(self):
        res = self.client.post(self.url, {"email": "x@x.com"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_without_phone_number_succeeds(self):
        data = self._payload()
        data.pop("phone_number")
        res = self.client.post(self.url, data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_register_weak_password_returns_400(self):
        res = self.client.post(
            self.url,
            self._payload(password="123", password_confirm="123"),
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LoginViewTests(APITestCase):
    url = "/api/auth/login/"

    def setUp(self):
        self.user = make_user()

    def test_login_returns_200(self):
        res = self.client.post(
            self.url,
            {"email": self.user.email, "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_login_returns_access_and_refresh_tokens(self):
        res = self.client.post(
            self.url,
            {"email": self.user.email, "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    def test_login_returns_user_object(self):
        res = self.client.post(
            self.url,
            {"email": self.user.email, "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertIn("user", res.data)
        self.assertEqual(res.data["user"]["email"], self.user.email)

    def test_login_wrong_password_returns_401(self):
        res = self.client.post(
            self.url,
            {"email": self.user.email, "password": "WrongPass!"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_email_returns_401(self):
        res = self.client.post(
            self.url,
            {"email": "ghost@example.com", "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_inactive_user_returns_401(self):
        self.user.is_active = False
        self.user.save()
        res = self.client.post(
            self.url,
            {"email": self.user.email, "password": DEFAULT_PASSWORD},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class LogoutViewTests(APITestCase):
    url = "/api/auth/logout/"

    def setUp(self):
        self.user = make_user()
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.refresh.access_token}"
        )

    def test_logout_returns_200(self):
        res = self.client.post(self.url, {"refresh": str(self.refresh)}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_logout_blacklists_refresh_token(self):
        self.client.post(self.url, {"refresh": str(self.refresh)}, format="json")
        # Using blacklisted token to refresh should fail
        res = self.client.post(
            "/api/auth/token/refresh/", {"refresh": str(self.refresh)}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_without_refresh_token_returns_400(self):
        res = self.client.post(self.url, {}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_with_invalid_token_returns_400(self):
        res = self.client.post(self.url, {"refresh": "not-a-real-token"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class TokenRefreshViewTests(APITestCase):
    url = "/api/auth/token/refresh/"

    def setUp(self):
        self.user = make_user()
        self.refresh = RefreshToken.for_user(self.user)

    def test_refresh_returns_new_access_token(self):
        res = self.client.post(self.url, {"refresh": str(self.refresh)}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)

    def test_refresh_rotates_refresh_token(self):
        res = self.client.post(self.url, {"refresh": str(self.refresh)}, format="json")
        self.assertIn("refresh", res.data)
        self.assertNotEqual(res.data["refresh"], str(self.refresh))

    def test_invalid_refresh_token_returns_401(self):
        res = self.client.post(
            self.url, {"refresh": "invalid.token.here"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class MeViewTests(APITestCase):
    url = "/api/auth/me/"

    def setUp(self):
        self.user = make_user()
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_get_me_returns_200(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_get_me_returns_correct_user(self):
        res = self.client.get(self.url)
        self.assertEqual(res.data["email"], self.user.email)
        self.assertEqual(res.data["full_name"], self.user.full_name)

    def test_get_me_unauthenticated_returns_401(self):
        self.client.credentials()
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_me_updates_profile(self):
        res = self.client.patch(
            self.url,
            {"first_name": "Janet", "phone_number": "+254711000000"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Janet")
        self.assertEqual(self.user.phone_number, "+2547000000000")

    def test_patch_me_partial_update_leaves_other_fields(self):
        res = self.client.patch(self.url, {"first_name": "Janet"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.last_name, "Doe")  # unchanged

    def test_patch_me_cannot_change_email(self):
        self.client.patch(self.url, {"email": "hacked@example.com"}, format="json")
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, "jane@example.com")

    def test_patch_me_unauthenticated_returns_401(self):
        self.client.credentials()
        res = self.client.patch(self.url, {"first_name": "Janet"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class ChangePasswordViewTests(APITestCase):
    url = "/api/auth/change-password/"

    def setUp(self):
        self.user = make_user()
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    def test_change_password_returns_200(self):
        res = self.client.put(
            self.url,
            {"old_password": DEFAULT_PASSWORD, "new_password": "NewSecure999!"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_password_is_actually_changed(self):
        self.client.put(
            self.url,
            {"old_password": DEFAULT_PASSWORD, "new_password": "NewSecure999!"},
            format="json",
        )
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("NewSecure999!"))
        self.assertFalse(self.user.check_password(DEFAULT_PASSWORD))

    def test_wrong_old_password_returns_400(self):
        res = self.client.put(
            self.url,
            {"old_password": "WrongPassword!", "new_password": "NewSecure999!"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_weak_new_password_returns_400(self):
        res = self.client.put(
            self.url,
            {"old_password": DEFAULT_PASSWORD, "new_password": "123"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_returns_401(self):
        self.client.credentials()
        res = self.client.put(
            self.url,
            {"old_password": DEFAULT_PASSWORD, "new_password": "NewSecure999!"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
