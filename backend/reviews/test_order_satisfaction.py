from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from catalog.models import Category, Product
from checkout.services import create_checkout_session
from inventory.models import InventoryItem
from orders.access import issue_order_access_token
from orders.models import Order, Payment
from orders.services import create_order_from_checkout
from reviews.models import OrderSatisfaction


class OrderSatisfactionAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

        category = Category.objects.create(
            name="Satisfaction",
        )

        product = Product.objects.create(
            name="Produit satisfaction",
            sku="SAT-001",
            category=category,
            base_price=Decimal("15000.00"),
            status=Product.Status.ACTIVE,
        )

        InventoryItem.objects.create(
            product=product,
            quantity_on_hand=10,
            quantity_reserved=0,
            low_stock_threshold=1,
        )

        checkout = create_checkout_session(
            customer_name="Client satisfaction",
            customer_phone="70000000",
            customer_whatsapp="70000000",
            customer_email="",
            delivery_method="DELIVERY",
            city="Bamako",
            delivery_zone="Bozola",
            address="Bamako",
            notes="",
            lines=[
                {
                    "product_id": product.pk,
                    "variant_id": None,
                    "quantity": 1,
                }
            ],
        )

        self.order, _ = create_order_from_checkout(
            checkout_id=checkout.pk,
            payment_method=Payment.Method.CASH_ON_DELIVERY,
        )

        self.url = (
            f"/api/v1/orders/{self.order.pk}/satisfaction/"
        )

    def access_headers(self):
        return {
            "HTTP_X_ORDER_ACCESS_TOKEN": (
                issue_order_access_token(self.order)
            )
        }

    def test_satisfaction_is_only_available_after_delivery(self):
        response = self.client.post(
            self.url,
            {
                "rating": 5,
                "experience": "VERY_SATISFIED",
                "tags": ["PRODUCT_AS_EXPECTED"],
                "comment": "Très bonne expérience.",
                "problem_reason": "",
                "wants_contact": False,
            },
            format="json",
            **self.access_headers(),
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            OrderSatisfaction.objects.filter(
                order=self.order,
            ).exists()
        )

    def test_delivered_order_can_submit_satisfaction(self):
        Order.objects.filter(pk=self.order.pk).update(
            status=Order.Status.DELIVERED,
        )
        self.order.refresh_from_db()

        response = self.client.post(
            self.url,
            {
                "rating": 5,
                "experience": "VERY_SATISFIED",
                "tags": [
                    "DELIVERY_FAST",
                    "PRODUCT_AS_EXPECTED",
                ],
                "comment": "Commande reçue en bon état.",
                "problem_reason": "",
                "wants_contact": False,
            },
            format="json",
            **self.access_headers(),
        )

        self.assertEqual(response.status_code, 201)

        satisfaction = OrderSatisfaction.objects.get(
            order=self.order,
        )
        self.assertEqual(satisfaction.rating, 5)
        self.assertEqual(
            satisfaction.experience,
            OrderSatisfaction.Experience.VERY_SATISFIED,
        )

    def test_invalid_order_access_token_is_hidden(self):
        Order.objects.filter(pk=self.order.pk).update(
            status=Order.Status.DELIVERED,
        )

        response = self.client.get(
            self.url,
            HTTP_X_ORDER_ACCESS_TOKEN="invalid-token",
        )

        self.assertEqual(response.status_code, 404)
