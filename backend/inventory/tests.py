import threading
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import (
    close_old_connections,
    connections,
)
from django.test import (
    TestCase,
    TransactionTestCase,
)

from catalog.models import (
    Brand,
    Category,
    Product,
    ProductVariant,
)

from .models import (
    InventoryItem,
    StockMovement,
)

from .services import (
    InsufficientReservedStockError,
    InsufficientStockError,
    add_stock,
    adjust_stock,
    consume_reserved_stock,
    release_stock,
    remove_stock,
    reserve_stock,
)


class InventoryBaseMixin:
    def create_catalog(self):
        self.category = (
            Category.objects.create(
                name="Smartphones",
            )
        )

        self.brand = (
            Brand.objects.create(
                name="Samsung",
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


class InventoryItemTests(
    InventoryBaseMixin,
    TestCase,
):
    def setUp(self):
        self.create_catalog()

    def test_available_quantity(self):
        item = InventoryItem.objects.create(
            product=self.product,
            quantity_on_hand=10,
            quantity_reserved=3,
            low_stock_threshold=2,
        )

        self.assertEqual(
            item.quantity_available,
            7,
        )

    def test_in_stock_status(self):
        item = InventoryItem.objects.create(
            product=self.product,
            quantity_on_hand=10,
            quantity_reserved=0,
            low_stock_threshold=5,
        )

        self.assertEqual(
            item.stock_status,
            InventoryItem
            .StockStatus
            .IN_STOCK,
        )

    def test_low_stock_status(self):
        item = InventoryItem.objects.create(
            product=self.product,
            quantity_on_hand=5,
            quantity_reserved=1,
            low_stock_threshold=5,
        )

        self.assertEqual(
            item.quantity_available,
            4,
        )

        self.assertEqual(
            item.stock_status,
            InventoryItem
            .StockStatus
            .LOW_STOCK,
        )

    def test_out_of_stock_status(self):
        item = InventoryItem.objects.create(
            product=self.product,
            quantity_on_hand=5,
            quantity_reserved=5,
            low_stock_threshold=5,
        )

        self.assertEqual(
            item.quantity_available,
            0,
        )

        self.assertEqual(
            item.stock_status,
            InventoryItem
            .StockStatus
            .OUT_OF_STOCK,
        )

    def test_variant_must_belong_to_product(
        self
    ):
        other_product = (
            Product.objects.create(
                name="Tecno Spark",
                sku="TEC-SPARK",
                category=self.category,
                base_price=Decimal(
                    "100000.00"
                ),
            )
        )

        variant = (
            ProductVariant.objects.create(
                product=other_product,
                sku="TEC-SPARK-BLK",
            )
        )

        item = InventoryItem(
            product=self.product,
            variant=variant,
        )

        with self.assertRaises(
            ValidationError
        ):
            item.full_clean()


class InventoryServiceTests(
    InventoryBaseMixin,
    TestCase,
):
    def setUp(self):
        self.create_catalog()

        self.item = (
            InventoryItem.objects.create(
                product=self.product,
                quantity_on_hand=10,
                quantity_reserved=0,
                low_stock_threshold=3,
            )
        )

    def test_add_stock(self):
        add_stock(
            self.item.pk,
            5,
            reference="RECEPTION-001",
        )

        self.item.refresh_from_db()

        self.assertEqual(
            self.item.quantity_on_hand,
            15,
        )

        self.assertEqual(
            StockMovement.objects.count(),
            1,
        )

    def test_remove_stock(self):
        remove_stock(
            self.item.pk,
            3,
        )

        self.item.refresh_from_db()

        self.assertEqual(
            self.item.quantity_on_hand,
            7,
        )

    def test_reserve_stock(self):
        reserve_stock(
            self.item.pk,
            4,
            reference="CMD-001",
        )

        self.item.refresh_from_db()

        self.assertEqual(
            self.item.quantity_on_hand,
            10,
        )

        self.assertEqual(
            self.item.quantity_reserved,
            4,
        )

        self.assertEqual(
            self.item.quantity_available,
            6,
        )

    def test_cannot_reserve_more_than_available(
        self
    ):
        with self.assertRaises(
            InsufficientStockError
        ):
            reserve_stock(
                self.item.pk,
                11,
            )

    def test_release_stock(self):
        reserve_stock(
            self.item.pk,
            4,
        )

        release_stock(
            self.item.pk,
            2,
        )

        self.item.refresh_from_db()

        self.assertEqual(
            self.item.quantity_reserved,
            2,
        )

        self.assertEqual(
            self.item.quantity_available,
            8,
        )

    def test_cannot_release_more_than_reserved(
        self
    ):
        reserve_stock(
            self.item.pk,
            2,
        )

        with self.assertRaises(
            InsufficientReservedStockError
        ):
            release_stock(
                self.item.pk,
                3,
            )

    def test_consume_reserved_stock(self):
        reserve_stock(
            self.item.pk,
            4,
        )

        consume_reserved_stock(
            self.item.pk,
            4,
            reference="CMD-001",
        )

        self.item.refresh_from_db()

        self.assertEqual(
            self.item.quantity_on_hand,
            6,
        )

        self.assertEqual(
            self.item.quantity_reserved,
            0,
        )

        self.assertEqual(
            self.item.quantity_available,
            6,
        )

    def test_adjust_stock(self):
        adjust_stock(
            self.item.pk,
            25,
            reference="INVENTAIRE-001",
        )

        self.item.refresh_from_db()

        self.assertEqual(
            self.item.quantity_on_hand,
            25,
        )

    def test_remove_cannot_touch_reserved_stock(
        self
    ):
        reserve_stock(
            self.item.pk,
            8,
        )

        with self.assertRaises(
            InsufficientStockError
        ):
            remove_stock(
                self.item.pk,
                3,
            )

    def test_movements_keep_snapshots(self):
        reserve_stock(
            self.item.pk,
            3,
            reference="CMD-100",
        )

        movement = (
            StockMovement.objects.get()
        )

        self.assertEqual(
            movement.quantity_after,
            10,
        )

        self.assertEqual(
            movement.reserved_after,
            3,
        )

        self.assertEqual(
            movement.reference,
            "CMD-100",
        )


class InventoryConcurrencyTests(
    InventoryBaseMixin,
    TransactionTestCase,
):
    """
    Tests réels de concurrence PostgreSQL.

    TransactionTestCase est nécessaire ici afin que
    select_for_update() fonctionne dans de vraies
    transactions indépendantes.

    Chaque thread possède sa propre connexion Django.
    Ces connexions sont explicitement fermées après
    le test afin de permettre à Django de supprimer
    proprement la base test_sugu_kura_db.
    """

    reset_sequences = True

    def setUp(self):
        self.create_catalog()

        self.item = (
            InventoryItem.objects.create(
                product=self.product,
                quantity_on_hand=1,
                quantity_reserved=0,
                low_stock_threshold=1,
            )
        )

    def test_last_unit_cannot_be_reserved_twice(
        self
    ):
        barrier = threading.Barrier(2)

        results = []

        result_lock = threading.Lock()

        def worker():
            """
            Chaque thread obtient une connexion
            PostgreSQL indépendante.
            """

            close_old_connections()

            try:
                barrier.wait()

                reserve_stock(
                    self.item.pk,
                    1,
                )

                result = "reserved"

            except InsufficientStockError:
                result = "insufficient"

            finally:
                # IMPORTANT :
                # close_old_connections() seul ne garantit
                # pas la fermeture immédiate d'une connexion
                # encore saine.
                #
                # On ferme explicitement toutes les
                # connexions appartenant à CE thread.
                connections.close_all()

            with result_lock:
                results.append(
                    result
                )

        first = threading.Thread(
            target=worker,
            name="stock-reservation-test-1",
        )

        second = threading.Thread(
            target=worker,
            name="stock-reservation-test-2",
        )

        first.start()
        second.start()

        first.join(
            timeout=15
        )

        second.join(
            timeout=15
        )

        self.assertFalse(
            first.is_alive(),
            "Le premier thread ne s'est pas terminé.",
        )

        self.assertFalse(
            second.is_alive(),
            "Le second thread ne s'est pas terminé.",
        )

        self.assertCountEqual(
            results,
            [
                "reserved",
                "insufficient",
            ],
        )

        self.item.refresh_from_db()

        self.assertEqual(
            self.item.quantity_reserved,
            1,
        )

        self.assertEqual(
            self.item.quantity_available,
            0,
        )