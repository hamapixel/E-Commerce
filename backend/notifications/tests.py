from decimal import Decimal
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

from catalog.models import (
    Category,
    Product,
)

from checkout.services import (
    create_checkout_session,
)

from inventory.models import (
    InventoryItem,
)

from notifications.models import (
    NotificationLog,
    PushSubscription,
)

from notifications.services import (
    send_owner_notification,
)

from orders.models import (
    Payment,
)

from orders.services import (
    create_order_from_checkout,
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
    def test_notifications_are_sent_only_to_owner_subscriptions(
        self,
        mocked_webpush,
    ):
        PushSubscription.objects.create(
            user=self.owner,
            endpoint=(
                "https://push.example.com/"
                "owner-only"
            ),
            p256dh="OWNER_P256DH",
            auth="OWNER_AUTH",
        )

        PushSubscription.objects.create(
            user=self.client_user,
            endpoint=(
                "https://push.example.com/"
                "client-must-not-receive"
            ),
            p256dh="CLIENT_P256DH",
            auth="CLIENT_AUTH",
        )

        log = send_owner_notification(
            title="Notification OWNER",
            body="Réservée au propriétaire",
            kind=(
                NotificationLog
                .Kind
                .TEST
            ),
        )

        self.assertEqual(
            log.subscribers_count,
            1,
        )

        self.assertEqual(
            log.sent_count,
            1,
        )

        self.assertEqual(
            mocked_webpush.call_count,
            1,
        )


class OwnerBusinessNotificationSignalTests(
    TestCase
):
    def setUp(self):
        self.category = (
            Category.objects.create(
                name="Téléphones"
            )
        )

        self.product = (
            Product.objects.create(
                name="Téléphone notification",
                sku="NOTIF-PHONE-001",
                category=self.category,
                base_price=Decimal(
                    "100000.00"
                ),
                status=(
                    Product.Status.ACTIVE
                ),
            )
        )

        self.inventory = (
            InventoryItem.objects.create(
                product=self.product,
                quantity_on_hand=10,
                quantity_reserved=0,
                low_stock_threshold=1,
            )
        )

    @patch(
        "notifications.signals.send_owner_notification"
    )
    def test_every_new_order_triggers_owner_notification(
        self,
        mocked_send,
    ):
        checkout = create_checkout_session(
            customer_name="Client notification",
            customer_phone="70000000",
            customer_whatsapp="70000000",
            customer_email="",
            delivery_method="PICKUP",
            city="Bamako",
            delivery_zone="",
            address="",
            notes="",
            lines=[
                {
                    "product_id": (
                        self.product.pk
                    ),
                    "variant_id": None,
                    "quantity": 1,
                }
            ],
        )

        with self.captureOnCommitCallbacks(
            execute=True
        ):
            create_order_from_checkout(
                checkout_id=checkout.pk,
                payment_method=(
                    Payment.Method
                    .PAY_AT_PICKUP
                ),
            )

        order_calls = [
            call
            for call
            in mocked_send.call_args_list
            if call.kwargs.get(
                "kind"
            )
            == NotificationLog.Kind.ORDER
        ]

        self.assertEqual(
            len(order_calls),
            1,
        )

    @patch(
        "notifications.signals.send_owner_notification"
    )
    def test_stockout_triggers_owner_notification(
        self,
        mocked_send,
    ):
        with self.captureOnCommitCallbacks(
            execute=True
        ):
            self.inventory.quantity_on_hand = 0
            self.inventory.quantity_reserved = 0
            self.inventory.save(
                update_fields=[
                    "quantity_on_hand",
                    "quantity_reserved",
                    "updated_at",
                ]
            )

        stock_calls = [
            call
            for call
            in mocked_send.call_args_list
            if call.kwargs.get(
                "kind"
            )
            == NotificationLog.Kind.STOCK
        ]

        self.assertEqual(
            len(stock_calls),
            1,
        )

        self.assertIn(
            "Rupture de stock",
            stock_calls[0].kwargs[
                "title"
            ],
        )
