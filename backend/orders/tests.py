from datetime import timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from rest_framework.test import (
    APIClient,
)

from catalog.models import (
    Brand,
    Category,
    Product,
)

from checkout.models import (
    CheckoutSession,
)

from checkout.services import (
    create_checkout_session,
)

from inventory.models import (
    InventoryItem,
)

from .models import (
    Order,
    Payment,
)

from .services import (
    InvalidPaymentMethodError,
    OrderCheckoutExpiredError,
    create_order_from_checkout,
    mark_payment_paid,
)


class OrderBaseMixin:
    def create_data(self):
        self.category = (
            Category.objects.create(
                name="Smartphones"
            )
        )

        self.brand = (
            Brand.objects.create(
                name="Samsung"
            )
        )

        self.product = (
            Product.objects.create(
                name="Samsung Galaxy A26",
                sku="SAM-A26-ORDER",
                category=self.category,
                brand=self.brand,
                base_price=Decimal(
                    "150000.00"
                ),
                status=(
                    Product.Status.ACTIVE
                ),
            )
        )

        self.inventory = (
            InventoryItem.objects.create(
                product=self.product,
                quantity_on_hand=9,
                quantity_reserved=0,
                low_stock_threshold=2,
            )
        )

    def create_checkout(
        self,
        *,
        quantity=2,
        delivery_method="DELIVERY",
    ):
        return (
            create_checkout_session(
                customer_name=(
                    "Hama TraorÃ©"
                ),
                customer_phone=(
                    "70000000"
                ),
                customer_whatsapp=(
                    "70000000"
                ),
                customer_email="",
                delivery_method=(
                    delivery_method
                ),
                city="Bamako",
                delivery_zone="Bozola",
                address=(
                    "Bozola, Bamako"
                    if delivery_method
                    == "DELIVERY"
                    else ""
                ),
                notes="",
                lines=[
                    {
                        "product_id": (
                            self.product.pk
                        ),
                        "variant_id": None,
                        "quantity": quantity,
                    }
                ],
            )
        )


class OrderServiceTests(
    OrderBaseMixin,
    TestCase,
):
    def setUp(self):
        self.create_data()

    def test_order_consumes_reserved_stock(
        self
    ):
        checkout = (
            self.create_checkout(
                quantity=2
            )
        )

        self.inventory.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity_reserved,
            2,
        )

        order, created = (
            create_order_from_checkout(
                checkout_id=checkout.pk,
                payment_method=(
                    Payment.Method
                    .CASH_ON_DELIVERY
                ),
            )
        )

        self.assertTrue(created)

        self.inventory.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity_on_hand,
            7,
        )

        self.assertEqual(
            self.inventory.quantity_reserved,
            0,
        )

        self.assertEqual(
            self.inventory.quantity_available,
            7,
        )

        self.assertEqual(
            order.total,
            Decimal("300000.00"),
        )

    def test_order_creates_snapshot(
        self
    ):
        checkout = (
            self.create_checkout()
        )

        order, _ = (
            create_order_from_checkout(
                checkout_id=checkout.pk,
                payment_method=(
                    Payment.Method
                    .CASH_ON_DELIVERY
                ),
            )
        )

        item = order.items.get()

        self.assertEqual(
            item.product_name,
            "Samsung Galaxy A26",
        )

        self.assertEqual(
            item.quantity,
            2,
        )

        self.assertEqual(
            item.unit_price,
            Decimal("150000.00"),
        )

    def test_payment_is_created(
        self
    ):
        checkout = (
            self.create_checkout()
        )

        order, _ = (
            create_order_from_checkout(
                checkout_id=checkout.pk,
                payment_method=(
                    Payment.Method
                    .CASH_ON_DELIVERY
                ),
            )
        )

        payment = order.payments.get()

        self.assertEqual(
            payment.amount,
            order.total,
        )

        self.assertEqual(
            payment.status,
            Payment.Status.PENDING,
        )

    def test_conversion_is_idempotent(
        self
    ):
        checkout = (
            self.create_checkout()
        )

        order1, created1 = (
            create_order_from_checkout(
                checkout_id=checkout.pk,
                payment_method=(
                    Payment.Method
                    .CASH_ON_DELIVERY
                ),
            )
        )

        order2, created2 = (
            create_order_from_checkout(
                checkout_id=checkout.pk,
                payment_method=(
                    Payment.Method
                    .CASH_ON_DELIVERY
                ),
            )
        )

        self.assertTrue(created1)

        self.assertFalse(created2)

        self.assertEqual(
            order1.pk,
            order2.pk,
        )

        self.assertEqual(
            Order.objects.count(),
            1,
        )

        self.assertEqual(
            Payment.objects.count(),
            1,
        )

    def test_expired_checkout_releases_stock_even_when_order_fails(
        self
    ):
        checkout = (
            self.create_checkout(
                quantity=2
            )
        )

        CheckoutSession.objects.filter(
            pk=checkout.pk
        ).update(
            expires_at=(
                timezone.now()
                - timedelta(
                    minutes=1
                )
            )
        )

        with self.assertRaises(
            OrderCheckoutExpiredError
        ):
            create_order_from_checkout(
                checkout_id=checkout.pk,
                payment_method=(
                    Payment.Method
                    .CASH_ON_DELIVERY
                ),
            )

        self.inventory.refresh_from_db()
        checkout.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity_reserved,
            0,
        )

        self.assertEqual(
            checkout.status,
            CheckoutSession
            .Status
            .EXPIRED,
        )

    def test_wrong_payment_method(
        self
    ):
        checkout = (
            self.create_checkout(
                delivery_method="DELIVERY"
            )
        )

        with self.assertRaises(
            InvalidPaymentMethodError
        ):
            create_order_from_checkout(
                checkout_id=checkout.pk,
                payment_method=(
                    Payment.Method
                    .PAY_AT_PICKUP
                ),
            )

    def test_mark_payment_paid(
        self
    ):
        checkout = (
            self.create_checkout()
        )

        order, _ = (
            create_order_from_checkout(
                checkout_id=checkout.pk,
                payment_method=(
                    Payment.Method
                    .CASH_ON_DELIVERY
                ),
            )
        )

        payment = order.payments.get()

        mark_payment_paid(
            payment.pk
        )

        payment.refresh_from_db()

        order.refresh_from_db()

        self.assertEqual(
            payment.status,
            Payment.Status.PAID,
        )

        self.assertIsNotNone(
            payment.paid_at
        )

        self.assertEqual(
            order.status,
            Order.Status.CONFIRMED,
        )


class OrderAPITests(
    OrderBaseMixin,
    TestCase,
):
    def setUp(self):
        self.create_data()

        self.client = APIClient()

    def test_create_order_api(
        self
    ):
        checkout = (
            self.create_checkout()
        )

        response = self.client.post(
            "/api/v1/orders/",
            {
                "checkout_id": str(
                    checkout.pk
                ),
                "payment_method": (
                    "CASH_ON_DELIVERY"
                ),
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            201,
        )

        self.assertTrue(
            response.data[
                "order_number"
            ].startswith(
                "SK-"
            )
        )

        self.assertEqual(
            response.data[
                "status"
            ],
            "PENDING",
        )

        self.assertEqual(
            len(
                response.data[
                    "items"
                ]
            ),
            1,
        )

        self.assertEqual(
            len(
                response.data[
                    "payments"
                ]
            ),
            1,
        )

    def test_order_detail_api(
        self
    ):
        checkout = (
            self.create_checkout()
        )

        create_response = (
            self.client.post(
                "/api/v1/orders/",
                {
                    "checkout_id": str(
                        checkout.pk
                    ),
                    "payment_method": (
                        "CASH_ON_DELIVERY"
                    ),
                },
                format="json",
            )
        )

        order_id = (
            create_response.data[
                "id"
            ]
        )

        response = (
            self.client.get(
                (
                    "/api/v1/orders/"
                    f"{order_id}/"
                )
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data[
                "customer_name"
            ],
            "Hama TraorÃ©",
        )

    def test_checkout_becomes_converted(
        self
    ):
        checkout = (
            self.create_checkout()
        )

        self.client.post(
            "/api/v1/orders/",
            {
                "checkout_id": str(
                    checkout.pk
                ),
                "payment_method": (
                    "CASH_ON_DELIVERY"
                ),
            },
            format="json",
        )

        checkout.refresh_from_db()

        self.assertEqual(
            checkout.status,
            CheckoutSession
            .Status
            .CONVERTED,
        )
