from decimal import Decimal

from django.test import TestCase

from rest_framework.test import APIClient

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
from orders.models import (
    Order,
    Payment,
)
from orders.services import (
    create_order_from_checkout,
)


class FrequentlyBoughtTogetherAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.category = Category.objects.create(
            name="Smartphones",
            is_active=True,
        )

        self.product = Product.objects.create(
            name="Iphone 12 Pro Max",
            sku="IPHONE-12-PRO-MAX-TEST",
            category=self.category,
            base_price=Decimal("250000.00"),
            status=Product.Status.ACTIVE,
        )

        self.related_product = Product.objects.create(
            name="Samsung Galaxy A26 Test",
            sku="SAMSUNG-A26-RECO-TEST",
            category=self.category,
            base_price=Decimal("150000.00"),
            status=Product.Status.ACTIVE,
        )

        self.product_inventory = InventoryItem.objects.create(
            product=self.product,
            quantity_on_hand=20,
            quantity_reserved=0,
            low_stock_threshold=2,
        )

        self.related_inventory = InventoryItem.objects.create(
            product=self.related_product,
            quantity_on_hand=20,
            quantity_reserved=0,
            low_stock_threshold=2,
        )

    def create_order(self, *, status=Order.Status.PENDING):
        checkout = create_checkout_session(
            customer_name="Client test",
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
                    "product_id": self.product.pk,
                    "variant_id": None,
                    "quantity": 1,
                },
                {
                    "product_id": self.related_product.pk,
                    "variant_id": None,
                    "quantity": 1,
                },
            ],
        )

        order, created = create_order_from_checkout(
            checkout_id=checkout.pk,
            payment_method=Payment.Method.PAY_AT_PICKUP,
        )

        self.assertTrue(created)

        if order.status != status:
            order.status = status
            order.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

        return order

    def recommendation_url(self, product):
        return (
            "/api/v1/catalog/products/"
            f"{product.slug}/"
            "frequently-bought-together/"
        )

    def test_confirmed_order_returns_copurchased_product(self):
        self.create_order(
            status=Order.Status.CONFIRMED,
        )

        response = self.client.get(
            self.recommendation_url(self.product),
            {
                "limit": 4,
            },
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["id"],
            self.related_product.pk,
        )

        self.assertEqual(
            response.data[0]["slug"],
            self.related_product.slug,
        )

        self.assertGreater(
            response.data[0]["available_quantity"],
            0,
        )

    def test_pending_order_is_not_used_for_recommendations(self):
        self.create_order(
            status=Order.Status.PENDING,
        )

        response = self.client.get(
            self.recommendation_url(self.product)
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data,
            [],
        )

    def test_cancelled_order_is_not_used_for_recommendations(self):
        self.create_order(
            status=Order.Status.CANCELLED,
        )

        response = self.client.get(
            self.recommendation_url(self.product)
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data,
            [],
        )

    def test_out_of_stock_copurchased_product_is_hidden(self):
        self.create_order(
            status=Order.Status.CONFIRMED,
        )

        self.related_inventory.refresh_from_db()
        self.related_inventory.quantity_on_hand = 0
        self.related_inventory.quantity_reserved = 0
        self.related_inventory.save(
            update_fields=[
                "quantity_on_hand",
                "quantity_reserved",
                "updated_at",
            ]
        )

        response = self.client.get(
            self.recommendation_url(self.product)
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data,
            [],
        )

    def test_recommendation_is_symmetric_for_same_order(self):
        self.create_order(
            status=Order.Status.DELIVERED,
        )

        response = self.client.get(
            self.recommendation_url(
                self.related_product
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["id"],
            self.product.pk,
        )
