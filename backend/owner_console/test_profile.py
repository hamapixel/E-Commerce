from django.contrib.auth import get_user_model
from django.test import TestCase

from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient


User = get_user_model()


class OwnerProfileTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = "StrongPass123!"
        self.owner = User.objects.create_user(
            username="OWNER_PROFILE",
            email="owner-profile@sugukura.test",
            password=self.password,
            role=User.Role.OWNER,
        )
        self.token = Token.objects.create(
            user=self.owner
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {self.token.key}"
            )
        )

    def test_owner_can_read_profile(self):
        response = self.client.get(
            "/api/v1/owner/auth/profile/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )
        self.assertEqual(
            response.data["username"],
            "OWNER_PROFILE",
        )
        self.assertIsNone(
            response.data[
                "profile_photo_url"
            ]
        )
        self.assertIsNone(
            response.data[
                "store_logo_url"
            ]
        )

    def test_owner_can_update_profile_information(self):
        response = self.client.patch(
            "/api/v1/owner/auth/profile/",
            {
                "first_name": "Hama",
                "last_name": "Traoré",
                "email": "hama@sugukura.test",
                "phone": "+22370000000",
                "whatsapp": "+22370000000",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.owner.refresh_from_db()

        self.assertEqual(
            self.owner.first_name,
            "Hama",
        )
        self.assertEqual(
            self.owner.last_name,
            "Traoré",
        )
        self.assertEqual(
            self.owner.email,
            "hama@sugukura.test",
        )
        self.assertEqual(
            self.owner.phone,
            "+22370000000",
        )

    def test_password_change_rejects_wrong_current_password(self):
        response = self.client.post(
            "/api/v1/owner/auth/change-password/",
            {
                "current_password": "WrongPass123!",
                "new_password": "AnotherStrongPass123!",
                "confirm_password": "AnotherStrongPass123!",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

    def test_password_change_rotates_token(self):
        old_token_key = self.token.key
        new_password = "AnotherStrongPass123!"

        response = self.client.post(
            "/api/v1/owner/auth/change-password/",
            {
                "current_password": self.password,
                "new_password": new_password,
                "confirm_password": new_password,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )
        self.assertTrue(
            response.data["token"]
        )
        self.assertNotEqual(
            response.data["token"],
            old_token_key,
        )
        self.assertFalse(
            Token.objects.filter(
                key=old_token_key
            ).exists()
        )

        self.owner.refresh_from_db()
        self.assertTrue(
            self.owner.check_password(
                new_password
            )
        )

    def test_profile_requires_owner_authentication(self):
        self.client.credentials()

        response = self.client.get(
            "/api/v1/owner/auth/profile/"
        )

        self.assertEqual(
            response.status_code,
            401,
        )
