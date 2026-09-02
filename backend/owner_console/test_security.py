from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import (
    get_user_model,
)
from django.core.cache import cache
from django.test import (
    TestCase,
    override_settings,
)
from django.utils import timezone

from rest_framework.authtoken.models import (
    Token,
)
from rest_framework.test import (
    APIClient,
)

from catalog.models import (
    Category,
    Product,
    ProductVariant,
)
from inventory.models import (
    InventoryItem,
    StockMovement,
)


User = get_user_model()


class OwnerSecurityTests(TestCase):
    def setUp(self):
        cache.clear()

        self.client = APIClient()

        self.owner = (
            User.objects.create_user(
                username="SECURITY_OWNER",
                email=(
                    "security-owner@sugukura.test"
                ),
                password="StrongPass123!",
                role=User.Role.OWNER,
            )
        )

    def tearDown(self):
        cache.clear()

    def _authenticate_owner(self):
        token = Token.objects.create(
            user=self.owner
        )

        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {token.key}"
            )
        )

        return token

    def _create_product(
        self,
        *,
        sku,
    ):
        category = (
            Category.objects.create(
                name=f"Cat {sku}"
            )
        )

        return Product.objects.create(
            name=f"Produit {sku}",
            sku=sku,
            category=category,
            base_price=Decimal(
                "10000.00"
            ),
            status=(
                Product.Status.ACTIVE
            ),
        )

    @override_settings(
        OWNER_LOGIN_THROTTLE_RATE=(
            "3/minute"
        )
    )
    def test_owner_login_is_throttled(
        self
    ):
        url = (
            "/api/v1/owner/"
            "auth/login/"
        )

        payload = {
            "username":
                "SECURITY_OWNER",

            "password":
                "wrong-password",
        }

        for _ in range(3):
            response = (
                self.client.post(
                    url,
                    payload,
                    format="json",
                )
            )

            self.assertEqual(
                response.status_code,
                400,
            )

        response = self.client.post(
            url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            429,
        )

    @override_settings(
        OWNER_TOKEN_MAX_AGE_SECONDS=1
    )
    def test_expired_owner_token_is_rejected(
        self
    ):
        token = (
            self._authenticate_owner()
        )

        Token.objects.filter(
            pk=token.pk
        ).update(
            created=(
                timezone.now()
                - timedelta(
                    seconds=5
                )
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
            401,
        )

        self.assertFalse(
            Token.objects.filter(
                pk=token.pk
            ).exists()
        )

    def test_first_variant_rejects_reserved_base_stock(
        self
    ):
        self._authenticate_owner()

        product = self._create_product(
            sku="SEC-RESERVED"
        )

        InventoryItem.objects.create(
            product=product,
            quantity_on_hand=5,
            quantity_reserved=1,
        )

        response = self.client.post(
            (
                "/api/v1/owner/"
                "catalog/variants/"
            ),
            {
                "product":
                    product.pk,

                "sku":
                    "SEC-RESERVED-V1",

                "price":
                    "10000.00",

                "attributes":
                    [],
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertFalse(
            ProductVariant.objects.filter(
                product=product
            ).exists()
        )

        base = InventoryItem.objects.get(
            product=product,
            variant__isnull=True,
        )

        self.assertEqual(
            base.quantity_reserved,
            1,
        )

    def test_variant_with_history_cannot_be_deleted(
        self
    ):
        self._authenticate_owner()

        product = self._create_product(
            sku="SEC-HISTORY"
        )

        variant = (
            ProductVariant.objects.create(
                product=product,
                sku="SEC-HISTORY-V1",
            )
        )

        item = (
            InventoryItem.objects.create(
                product=product,
                variant=variant,
                quantity_on_hand=0,
                quantity_reserved=0,
            )
        )

        StockMovement.objects.create(
            inventory_item=item,
            movement_type=(
                StockMovement
                .MovementType
                .ADJUSTMENT
            ),
            quantity_delta=0,
            reserved_delta=0,
            quantity_after=0,
            reserved_after=0,
            reference="SECURITY-TEST",
            note="Historique de test",
        )

        response = self.client.delete(
            (
                "/api/v1/owner/"
                "catalog/variants/"
                f"{variant.pk}/"
            )
        )

        self.assertEqual(
            response.status_code,
            409,
        )

        self.assertTrue(
            ProductVariant.objects.filter(
                pk=variant.pk
            ).exists()
        )

        self.assertTrue(
            InventoryItem.objects.filter(
                pk=item.pk
            ).exists()
        )

    def test_deleting_last_safe_variant_recreates_base_stock(
        self
    ):
        self._authenticate_owner()

        product = self._create_product(
            sku="SEC-LAST"
        )

        variant = (
            ProductVariant.objects.create(
                product=product,
                sku="SEC-LAST-V1",
            )
        )

        InventoryItem.objects.create(
            product=product,
            variant=variant,
            quantity_on_hand=0,
            quantity_reserved=0,
        )

        response = self.client.delete(
            (
                "/api/v1/owner/"
                "catalog/variants/"
                f"{variant.pk}/"
            )
        )

        self.assertEqual(
            response.status_code,
            204,
        )

        self.assertFalse(
            ProductVariant.objects.filter(
                product=product
            ).exists()
        )

        self.assertTrue(
            InventoryItem.objects.filter(
                product=product,
                variant__isnull=True,
            ).exists()
        )
