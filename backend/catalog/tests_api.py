from decimal import Decimal

from django.test import TestCase

from rest_framework.test import APIClient

from inventory.models import InventoryItem

from catalog.models import (
    Brand,
    Category,
    Product,
    ProductVariant,
)


class PublicCatalogAPITests(
    TestCase
):
    def setUp(self):
        self.client = APIClient()

        self.category = (
            Category.objects.create(
                name="Smartphones",
                is_active=True,
            )
        )

        self.other_category = (
            Category.objects.create(
                name="Électricité",
                is_active=True,
            )
        )

        self.brand = (
            Brand.objects.create(
                name="Samsung",
                is_active=True,
            )
        )

        self.other_brand = (
            Brand.objects.create(
                name="Tecno",
                is_active=True,
            )
        )

        self.product = (
            Product.objects.create(
                name="Samsung Galaxy A26",
                sku="SAM-A26",
                barcode="1111111111111",
                category=self.category,
                brand=self.brand,
                short_description=(
                    "Smartphone Samsung moderne"
                ),
                base_price=Decimal(
                    "150000.00"
                ),
                status=(
                    Product.Status.ACTIVE
                ),
            )
        )

        InventoryItem.objects.create(
            product=self.product,
            quantity_on_hand=10,
            quantity_reserved=2,
            low_stock_threshold=3,
        )

        self.tecno = (
            Product.objects.create(
                name="Tecno Spark",
                sku="TEC-SPARK",
                category=self.category,
                brand=self.other_brand,
                base_price=Decimal(
                    "100000.00"
                ),
                status=(
                    Product.Status.ACTIVE
                ),
            )
        )

        InventoryItem.objects.create(
            product=self.tecno,
            quantity_on_hand=0,
            quantity_reserved=0,
        )

        self.bulb = (
            Product.objects.create(
                name="Ampoule LED 30W",
                sku="LED-30W",
                category=(
                    self.other_category
                ),
                base_price=Decimal(
                    "5000.00"
                ),
                status=(
                    Product.Status.ACTIVE
                ),
            )
        )

        InventoryItem.objects.create(
            product=self.bulb,
            quantity_on_hand=25,
            quantity_reserved=0,
        )

        self.hidden_product = (
            Product.objects.create(
                name="Produit caché",
                sku="HIDDEN-001",
                category=self.category,
                base_price=Decimal(
                    "1000.00"
                ),
                status=(
                    Product.Status.DRAFT
                ),
            )
        )

    def test_product_list_is_public(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertIn(
            "results",
            response.data,
        )

        self.assertEqual(
            response.data["count"],
            3,
        )

    def test_draft_product_is_hidden(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/"
        )

        names = [
            item["name"]
            for item
            in response.data["results"]
        ]

        self.assertNotIn(
            "Produit caché",
            names,
        )

    def test_product_detail_by_slug(
        self
    ):
        response = self.client.get(
            (
                "/api/v1/catalog/"
                "products/"
                "samsung-galaxy-a26/"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["sku"],
            "SAM-A26",
        )

    def test_available_quantity(
        self
    ):
        response = self.client.get(
            (
                "/api/v1/catalog/"
                "products/"
                "samsung-galaxy-a26/"
            )
        )

        self.assertEqual(
            response.data[
                "available_quantity"
            ],
            8,
        )

    def test_filter_by_category(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "category": (
                    self.category.slug
                )
            },
        )

        self.assertEqual(
            response.data["count"],
            2,
        )

    def test_filter_by_brand(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "brand": (
                    self.brand.slug
                )
            },
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            response.data[
                "results"
            ][0]["name"],
            "Samsung Galaxy A26",
        )

    def test_search_by_name(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "search": "Galaxy",
            },
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

    def test_search_by_sku(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "search": "SAM-A26",
            },
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

    def test_search_by_barcode(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "search": "1111111111111",
            },
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

    def test_filter_by_minimum_price(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "min_price": "120000",
            },
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            response.data[
                "results"
            ][0]["name"],
            "Samsung Galaxy A26",
        )

    def test_filter_by_maximum_price(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "max_price": "10000",
            },
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            response.data[
                "results"
            ][0]["name"],
            "Ampoule LED 30W",
        )

    def test_filter_in_stock(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "in_stock": "true",
            },
        )

        names = {
            item["name"]
            for item
            in response.data["results"]
        }

        self.assertEqual(
            names,
            {
                "Samsung Galaxy A26",
                "Ampoule LED 30W",
            },
        )

    def test_filter_out_of_stock(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "in_stock": "false",
            },
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            response.data[
                "results"
            ][0]["name"],
            "Tecno Spark",
        )

    def test_filter_has_variants(
        self
    ):
        ProductVariant.objects.create(
            product=self.product,
            sku="SAM-A26-BLUE",
            is_active=True,
        )

        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "has_variants": "true",
            },
        )

        self.assertEqual(
            response.data["count"],
            1,
        )

        self.assertEqual(
            response.data[
                "results"
            ][0]["name"],
            "Samsung Galaxy A26",
        )

    def test_order_by_price_ascending(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "ordering": "base_price",
            },
        )

        names = [
            item["name"]
            for item
            in response.data["results"]
        ]

        self.assertEqual(
            names[0],
            "Ampoule LED 30W",
        )

        self.assertEqual(
            names[-1],
            "Samsung Galaxy A26",
        )

    def test_order_by_price_descending(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/products/",
            {
                "ordering": "-base_price",
            },
        )

        names = [
            item["name"]
            for item
            in response.data["results"]
        ]

        self.assertEqual(
            names[0],
            "Samsung Galaxy A26",
        )

    def test_categories_api(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/categories/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

    def test_brands_api(
        self
    ):
        response = self.client.get(
            "/api/v1/catalog/brands/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )