from django.test import TestCase
from rest_framework.test import APIClient

from catalog.models import Category, Product
from reviews.models import ProductReview


class ProductReviewsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.category = Category.objects.create(
            name="Smartphones",
            slug="smartphones-reviews",
        )

        self.product = Product.objects.create(
            name="Galaxy Review Test",
            slug="galaxy-review-test",
            sku="REV-001",
            category=self.category,
            base_price="100000.00",
            status=Product.Status.ACTIVE,
        )

        self.url = (
            "/api/v1/reviews/products/"
            f"{self.product.slug}/"
        )

    def test_customer_can_publish_review(self):
        response = self.client.post(
            self.url,
            {
                "customer_name": "Moussa",
                "rating": 5,
                "comment": "Très bon produit.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            201,
        )

        self.assertEqual(
            ProductReview.objects.count(),
            1,
        )

        self.assertEqual(
            response.data["summary"]["count"],
            1,
        )

    def test_public_list_returns_average(self):
        ProductReview.objects.create(
            product=self.product,
            customer_name="Awa",
            rating=4,
            comment="Produit satisfaisant.",
        )

        ProductReview.objects.create(
            product=self.product,
            customer_name="Boubacar",
            rating=5,
            comment="Excellent achat.",
        )

        response = self.client.get(
            self.url
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["count"],
            2,
        )

        self.assertEqual(
            response.data["average_rating"],
            4.5,
        )

    def test_invalid_rating_is_rejected(self):
        response = self.client.post(
            self.url,
            {
                "customer_name": "Moussa",
                "rating": 6,
                "comment": "Note invalide.",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertEqual(
            ProductReview.objects.count(),
            0,
        )
