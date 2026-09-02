from django.contrib.auth import (
    get_user_model,
)

from django.test import TestCase

from rest_framework.authtoken.models import (
    Token,
)

from rest_framework.test import (
    APIClient,
)


User = get_user_model()


class OwnerConsoleAPITests(
    TestCase
):
    def setUp(self):
        self.client = APIClient()

        self.owner = (
            User.objects.create_user(
                username="OWNER_TEST",
                email="owner-test@sugukura.test",
                password="StrongPass123!",
                role=(
                    User.Role.OWNER
                ),
            )
        )

        self.normal_user = (
            User.objects.create_user(
                username="CLIENT_TEST",
                email="client-test@sugukura.test",
                password="StrongPass123!",
                role=(
                    User.Role.CLIENT
                ),
            )
        )

    def test_owner_login(
        self
    ):
        response = self.client.post(
            (
                "/api/v1/owner/"
                "auth/login/"
            ),
            {
                "username": (
                    "OWNER_TEST"
                ),
                "password": (
                    "StrongPass123!"
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertIn(
            "token",
            response.data,
        )

        self.assertIn(
            "user",
            response.data,
        )

        self.assertEqual(
            response.data[
                "user"
            ][
                "username"
            ],
            "OWNER_TEST",
        )

        self.assertEqual(
            response.data[
                "user"
            ][
                "role"
            ],
            User.Role.OWNER,
        )

    def test_client_cannot_login_owner_console(
        self
    ):
        response = self.client.post(
            (
                "/api/v1/owner/"
                "auth/login/"
            ),
            {
                "username": (
                    "CLIENT_TEST"
                ),
                "password": (
                    "StrongPass123!"
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

    def test_owner_dashboard(
        self
    ):
        token = Token.objects.create(
            user=self.owner
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {token.key}"
            )
        )

        response = self.client.get(
            (
                "/api/v1/owner/"
                "dashboard/"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertIn(
            "orders",
            response.data,
        )

        self.assertIn(
            "money",
            response.data,
        )

        self.assertIn(
            "catalog",
            response.data,
        )

        self.assertIn(
            "inventory",
            response.data,
        )

        self.assertIn(
            "checkout",
            response.data,
        )

        self.assertIn(
            "marketing",
            response.data,
        )

    def test_client_cannot_access_dashboard(
        self
    ):
        token = Token.objects.create(
            user=self.normal_user
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {token.key}"
            )
        )

        response = self.client.get(
            (
                "/api/v1/owner/"
                "dashboard/"
            )
        )

        self.assertEqual(
            response.status_code,
            403,
        )

    def test_anonymous_cannot_access_dashboard(
        self
    ):
        response = self.client.get(
            (
                "/api/v1/owner/"
                "dashboard/"
            )
        )

        self.assertEqual(
            response.status_code,
            401,
        )

    def test_owner_me(
        self
    ):
        token = Token.objects.create(
            user=self.owner
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {token.key}"
            )
        )

        response = self.client.get(
            (
                "/api/v1/owner/"
                "auth/me/"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data[
                "username"
            ],
            "OWNER_TEST",
        )

        self.assertEqual(
            response.data[
                "email"
            ],
            "owner-test@sugukura.test",
        )

        self.assertEqual(
            response.data[
                "role"
            ],
            User.Role.OWNER,
        )

    def test_owner_logout(
        self
    ):
        token = Token.objects.create(
            user=self.owner
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {token.key}"
            )
        )

        response = self.client.post(
            (
                "/api/v1/owner/"
                "auth/logout/"
            ),
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertFalse(
            Token.objects.filter(
                user=self.owner
            ).exists()
        )
