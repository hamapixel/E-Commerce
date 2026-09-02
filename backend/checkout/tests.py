from datetime import timedelta
from decimal import Decimal

from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone

from rest_framework.test import (
    APIClient,
)

from catalog.models import (
    Brand,
    Category,
    Product,
    ProductVariant,
)

from inventory.models import (
    InventoryItem,
)

from .models import (
    CheckoutSession,
)

from .services import (
    CheckoutStockError,
    VariantRequiredError,
    cancel_checkout_session,
    create_checkout_session,
    expire_checkout_session_if_needed,
)


class CheckoutBaseMixin:
    def create_catalog(self):
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
                sku="SAM-A26",
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
                quantity_on_hand=10,
                quantity_reserved=0,
                low_stock_threshold=2,
            )
        )

    def checkout_data(
        self,
        *,
        quantity=1,
    ):
        return {
            "customer_name": (
                "Hama TraorÃ©"
            ),
            "customer_phone": (
                "70000000"
            ),
            "customer_whatsapp": (
                "70000000"
            ),
            "delivery_method": (
                CheckoutSession
                .DeliveryMethod
                .DELIVERY
            ),
            "city": "Bamako",
            "delivery_zone": (
                "Bozola"
            ),
            "address": (
                "Bozola, Bamako"
            ),
            "notes": "",
            "lines": [
                {
                    "product_id": (
                        self.product.pk
                    ),
                    "variant_id": None,
                    "quantity": quantity,
                }
            ],
        }


class CheckoutServiceTests(
    CheckoutBaseMixin,
    TestCase,
):
    def setUp(self):
        self.create_catalog()

    def test_create_checkout_reserves_stock(
        self
    ):
        session = (
            create_checkout_session(
                **self.checkout_data(
                    quantity=2
                )
            )
        )

        self.inventory.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity_reserved,
            2,
        )

        self.assertEqual(
            self.inventory.quantity_available,
            8,
        )

        self.assertEqual(
            session.subtotal,
            Decimal("300000.00"),
        )

        self.assertEqual(
            session.total,
            Decimal("300000.00"),
        )

    def test_checkout_creates_snapshot_item(
        self
    ):
        session = (
            create_checkout_session(
                **self.checkout_data()
            )
        )

        item = session.items.get()

        self.assertEqual(
            item.product_name,
            "Samsung Galaxy A26",
        )

        self.assertEqual(
            item.sku,
            "SAM-A26",
        )

        self.assertEqual(
            item.unit_price,
            Decimal("150000.00"),
        )

    def test_duplicate_lines_are_aggregated(
        self
    ):
        data = self.checkout_data()

        data["lines"] = [
            {
                "product_id": (
                    self.product.pk
                ),
                "variant_id": None,
                "quantity": 2,
            },
            {
                "product_id": (
                    self.product.pk
                ),
                "variant_id": None,
                "quantity": 3,
            },
        ]

        session = (
            create_checkout_session(
                **data
            )
        )

        self.assertEqual(
            session.items.count(),
            1,
        )

        self.assertEqual(
            session.items.get().quantity,
            5,
        )

        self.inventory.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity_reserved,
            5,
        )

    def test_insufficient_stock_rolls_back(
        self
    ):
        with self.assertRaises(
            CheckoutStockError
        ):
            create_checkout_session(
                **self.checkout_data(
                    quantity=11
                )
            )

        self.inventory.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity_reserved,
            0,
        )

        self.assertEqual(
            CheckoutSession.objects.count(),
            0,
        )

    def test_variant_is_required(
        self
    ):
        ProductVariant.objects.create(
            product=self.product,
            sku="SAM-A26-BLUE",
        )

        with self.assertRaises(
            VariantRequiredError
        ):
            create_checkout_session(
                **self.checkout_data()
            )

    def test_variant_checkout(
        self
    ):
        variant = (
            ProductVariant.objects.create(
                product=self.product,
                sku="SAM-A26-BLUE",
            )
        )

        variant_inventory = (
            InventoryItem.objects.create(
                product=self.product,
                variant=variant,
                quantity_on_hand=5,
                quantity_reserved=0,
            )
        )

        data = self.checkout_data()

        data["lines"] = [
            {
                "product_id": (
                    self.product.pk
                ),
                "variant_id": (
                    variant.pk
                ),
                "quantity": 2,
            }
        ]

        session = (
            create_checkout_session(
                **data
            )
        )

        variant_inventory.refresh_from_db()

        self.assertEqual(
            variant_inventory.quantity_reserved,
            2,
        )

        self.assertEqual(
            session.items.get().variant,
            variant,
        )

    def test_cancel_releases_stock(
        self
    ):
        session = (
            create_checkout_session(
                **self.checkout_data(
                    quantity=3
                )
            )
        )

        cancel_checkout_session(
            session.pk
        )

        self.inventory.refresh_from_db()

        session.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity_reserved,
            0,
        )

        self.assertEqual(
            session.status,
            CheckoutSession
            .Status
            .CANCELLED,
        )

    def test_expired_checkout_releases_stock(
        self
    ):
        session = (
            create_checkout_session(
                **self.checkout_data(
                    quantity=2
                )
            )
        )

        CheckoutSession.objects.filter(
            pk=session.pk
        ).update(
            expires_at=(
                timezone.now()
                - timedelta(
                    minutes=1
                )
            )
        )

        expire_checkout_session_if_needed(
            session.pk
        )

        self.inventory.refresh_from_db()

        session.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity_reserved,
            0,
        )

        self.assertEqual(
            session.status,
            CheckoutSession
            .Status
            .EXPIRED,
        )


class CheckoutAPITests(
    CheckoutBaseMixin,
    TestCase,
):
    def setUp(self):
        self.create_catalog()

        self.client = APIClient()

    def api_payload(self):
        return {
            "customer_name": (
                "Hama TraorÃ©"
            ),
            "customer_phone": (
                "70000000"
            ),
            "customer_whatsapp": (
                "70000000"
            ),
            "customer_email": "",
            "delivery_method": (
                "DELIVERY"
            ),
            "city": "Bamako",
            "delivery_zone": (
                "Bozola"
            ),
            "address": (
                "Bozola, Bamako"
            ),
            "notes": "",
            "items": [
                {
                    "product_id": (
                        self.product.pk
                    ),
                    "variant_id": None,
                    "quantity": 2,
                }
            ],
        }

    def test_create_checkout_api(
        self
    ):
        response = self.client.post(
            (
                "/api/v1/checkout/"
                "sessions/"
            ),
            self.api_payload(),
            format="json",
        )

        self.assertEqual(
            response.status_code,
            201,
        )

        self.assertEqual(
            response.data["status"],
            "ACTIVE",
        )

        self.assertEqual(
            len(
                response.data[
                    "items"
                ]
            ),
            1,
        )

        self.inventory.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity_reserved,
            2,
        )

    def test_checkout_detail_api(
        self
    ):
        create_response = (
            self.client.post(
                (
                    "/api/v1/checkout/"
                    "sessions/"
                ),
                self.api_payload(),
                format="json",
            )
        )

        checkout_id = (
            create_response.data[
                "id"
            ]
        )

        response = self.client.get(
            (
                "/api/v1/checkout/"
                f"sessions/{checkout_id}/"
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

    def test_cancel_checkout_api(
        self
    ):
        create_response = (
            self.client.post(
                (
                    "/api/v1/checkout/"
                    "sessions/"
                ),
                self.api_payload(),
                format="json",
            )
        )

        checkout_id = (
            create_response.data[
                "id"
            ]
        )

        response = self.client.delete(
            (
                "/api/v1/checkout/"
                f"sessions/{checkout_id}/"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.inventory.refresh_from_db()

        self.assertEqual(
            self.inventory.quantity_reserved,
            0,
        )

class CheckoutSecurityThrottleTests(
    TestCase
):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def tearDown(self):
        cache.clear()

    def test_checkout_create_is_rate_limited(
        self
    ):
        url = (
            "/api/v1/checkout/"
            "sessions/"
        )

        for _ in range(30):
            response = (
                self.client.post(
                    url,
                    {},
                    format="json",
                )
            )

            self.assertNotEqual(
                response.status_code,
                429,
            )

        response = self.client.post(
            url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            429,
        )
