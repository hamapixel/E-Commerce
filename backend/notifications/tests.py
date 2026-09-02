from unittest.mock import patch

from django.contrib.auth import (
    get_user_model,
)

from django.test import (
    TestCase,
    override_settings,
)

from rest_framework.authtoken.models import (
    Token,
)

from rest_framework.test import (
    APIClient,
)

from notifications.models import (
    NotificationLog,
    PushSubscription,
)

from notifications.services import (
    send_owner_notification,
)


User = get_user_model()


class NotificationAPITests(
    TestCase
):
    def setUp(self):
        self.client = APIClient()

        self.owner = (
            User.objects.create_user(
                username=(
                    "PUSH_OWNER"
                ),
                email=(
                    "push-owner@sugukura.test"
                ),
                password=(
                    "StrongPass123!"
                ),
                role=(
                    User.Role.OWNER
                ),
            )
        )

        self.client_user = (
            User.objects.create_user(
                username=(
                    "PUSH_CLIENT"
                ),
                email=(
                    "push-client@sugukura.test"
                ),
                password=(
                    "StrongPass123!"
                ),
                role=(
                    User.Role.CLIENT
                ),
            )
        )

    def authenticate_owner(
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

    @override_settings(
        WEBPUSH_VAPID_PUBLIC_KEY=(
            "PUBLIC_TEST_KEY"
        )
    )
    def test_owner_can_get_public_key(
        self
    ):
        self.authenticate_owner()

        response = self.client.get(
            (
                "/api/v1/owner/"
                "notifications/"
                "public-key/"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data[
                "public_key"
            ],
            "PUBLIC_TEST_KEY",
        )

    def test_owner_can_subscribe(
        self
    ):
        self.authenticate_owner()

        response = self.client.post(
            (
                "/api/v1/owner/"
                "notifications/"
                "subscribe/"
            ),
            {
                "endpoint": (
                    "https://push.example.com/"
                    "subscription/123"
                ),

                "p256dh": (
                    "TEST_P256DH"
                ),

                "auth": (
                    "TEST_AUTH"
                ),

                "user_agent": (
                    "Test browser"
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            201,
        )

        self.assertTrue(
            PushSubscription
            .objects
            .filter(
                user=self.owner,
                is_active=True,
            )
            .exists()
        )

    def test_owner_can_unsubscribe(
        self
    ):
        self.authenticate_owner()

        subscription = (
            PushSubscription
            .objects
            .create(
                user=self.owner,

                endpoint=(
                    "https://push.example.com/"
                    "subscription/456"
                ),

                p256dh=(
                    "TEST_P256DH"
                ),

                auth=(
                    "TEST_AUTH"
                ),
            )
        )

        response = self.client.post(
            (
                "/api/v1/owner/"
                "notifications/"
                "unsubscribe/"
            ),
            {
                "endpoint": (
                    subscription.endpoint
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        subscription.refresh_from_db()

        self.assertFalse(
            subscription.is_active
        )

    def test_client_cannot_subscribe(
        self
    ):
        token = Token.objects.create(
            user=self.client_user
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {token.key}"
            )
        )

        response = self.client.post(
            (
                "/api/v1/owner/"
                "notifications/"
                "subscribe/"
            ),
            {
                "endpoint": (
                    "https://push.example.com/"
                    "subscription/789"
                ),

                "p256dh": (
                    "TEST_P256DH"
                ),

                "auth": (
                    "TEST_AUTH"
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            403,
        )

    @override_settings(
        WEBPUSH_VAPID_PUBLIC_KEY=(
            "PUBLIC_TEST_KEY"
        ),

        WEBPUSH_VAPID_PRIVATE_KEY=(
            "PRIVATE_TEST_KEY"
        ),

        WEBPUSH_VAPID_SUBJECT=(
            "mailto:test@example.com"
        ),
    )
    @patch(
        "notifications.services.webpush"
    )
    def test_send_owner_notification(
        self,
        mocked_webpush,
    ):
        PushSubscription.objects.create(
            user=self.owner,

            endpoint=(
                "https://push.example.com/"
                "subscription/999"
            ),

            p256dh=(
                "TEST_P256DH"
            ),

            auth=(
                "TEST_AUTH"
            ),
        )

        log = send_owner_notification(
            title=(
                "Test SUGU KURA"
            ),

            body=(
                "Notification test"
            ),

            url="/",

            kind=(
                NotificationLog
                .Kind
                .TEST
            ),
        )

        self.assertEqual(
            log.status,
            (
                NotificationLog
                .Status
                .SENT
            ),
        )

        self.assertEqual(
            log.sent_count,
            1,
        )

        mocked_webpush.assert_called_once()