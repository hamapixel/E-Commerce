from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q

from catalog.models import (
    Product,
    ProductVariant,
)


class InventoryItem(models.Model):
    """
    État de stock d'un produit ou d'une variante.

    Un produit sans variante peut avoir un stock directement
    au niveau produit.

    Lorsqu'une variante est utilisée, le stock est associé
    à la variante concernée.

    Exemple :

    Samsung Galaxy A26
        128 Go / Noir -> 5
        256 Go / Bleu -> 3
    """

    class StockStatus(models.TextChoices):
        IN_STOCK = (
            "IN_STOCK",
            "En stock",
        )

        LOW_STOCK = (
            "LOW_STOCK",
            "Stock faible",
        )

        OUT_OF_STOCK = (
            "OUT_OF_STOCK",
            "Rupture",
        )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="inventory_items",
        verbose_name="Produit",
    )

    variant = models.OneToOneField(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="inventory",
        null=True,
        blank=True,
        verbose_name="Variante",
    )

    quantity_on_hand = models.PositiveIntegerField(
        default=0,
        verbose_name="Stock physique",
    )

    quantity_reserved = models.PositiveIntegerField(
        default=0,
        verbose_name="Stock réservé",
    )

    low_stock_threshold = models.PositiveIntegerField(
        default=5,
        verbose_name="Seuil d'alerte",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Créé le",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        db_index=True,
        verbose_name="Modifié le",
    )

    class Meta:
        verbose_name = "Stock"
        verbose_name_plural = "Stocks"

        ordering = [
            "product__name",
            "variant__sku",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product",
                ],
                condition=Q(
                    variant__isnull=True
                ),
                name=(
                    "unique_base_inventory_item"
                ),
            ),

            models.CheckConstraint(
                condition=Q(
                    quantity_on_hand__gte=0
                ),
                name=(
                    "inventory_on_hand_gte_0"
                ),
            ),

            models.CheckConstraint(
                condition=Q(
                    quantity_reserved__gte=0
                ),
                name=(
                    "inventory_reserved_gte_0"
                ),
            ),

            models.CheckConstraint(
                condition=Q(
                    quantity_reserved__lte=(
                        F("quantity_on_hand")
                    )
                ),
                name=(
                    "inventory_reserved_lte_on_hand"
                ),
            ),
        ]

        indexes = [
            models.Index(
                fields=[
                    "product",
                    "updated_at",
                ],
                name="inventory_product_idx",
            ),
        ]

    def __str__(self):
        if self.variant:
            return (
                f"{self.product.name} — "
                f"{self.variant.display_name}"
            )

        return self.product.name

    def clean(self):
        super().clean()

        if (
            self.variant
            and self.variant.product_id
            != self.product_id
        ):
            raise ValidationError(
                {
                    "variant": (
                        "Cette variante n'appartient "
                        "pas au produit sélectionné."
                    )
                }
            )

        if self.quantity_reserved > self.quantity_on_hand:
            raise ValidationError(
                {
                    "quantity_reserved": (
                        "Le stock réservé ne peut pas "
                        "dépasser le stock physique."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )

    @property
    def quantity_available(self):
        """
        Quantité réellement disponible à la vente.
        """

        return (
            self.quantity_on_hand
            - self.quantity_reserved
        )

    @property
    def stock_status(self):
        """
        Retourne le statut calculé du stock.
        """

        available = self.quantity_available

        if available <= 0:
            return self.StockStatus.OUT_OF_STOCK

        if available <= self.low_stock_threshold:
            return self.StockStatus.LOW_STOCK

        return self.StockStatus.IN_STOCK

    @property
    def is_out_of_stock(self):
        return (
            self.stock_status
            == self.StockStatus.OUT_OF_STOCK
        )

    @property
    def is_low_stock(self):
        return (
            self.stock_status
            == self.StockStatus.LOW_STOCK
        )


class StockMovement(models.Model):
    """
    Historique immuable des mouvements de stock.

    Chaque opération importante crée une ligne permettant
    de savoir :

    - ce qui s'est passé ;
    - combien d'unités ont bougé ;
    - le stock après l'opération ;
    - le stock réservé après l'opération ;
    - la référence métier éventuelle.
    """

    class MovementType(models.TextChoices):
        RECEIVE = (
            "RECEIVE",
            "Entrée",
        )

        REMOVE = (
            "REMOVE",
            "Sortie",
        )

        RESERVE = (
            "RESERVE",
            "Réservation",
        )

        RELEASE = (
            "RELEASE",
            "Libération réservation",
        )

        SALE = (
            "SALE",
            "Vente",
        )

        RETURN = (
            "RETURN",
            "Retour",
        )

        ADJUSTMENT = (
            "ADJUSTMENT",
            "Ajustement",
        )

    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name="movements",
        verbose_name="Stock",
    )

    movement_type = models.CharField(
        max_length=20,
        choices=MovementType.choices,
        db_index=True,
        verbose_name="Type",
    )

    quantity_delta = models.IntegerField(
        default=0,
        verbose_name="Variation stock physique",
    )

    reserved_delta = models.IntegerField(
        default=0,
        verbose_name="Variation stock réservé",
    )

    quantity_after = models.PositiveIntegerField(
        verbose_name="Stock physique après",
    )

    reserved_after = models.PositiveIntegerField(
        verbose_name="Stock réservé après",
    )

    reference = models.CharField(
        max_length=150,
        blank=True,
        db_index=True,
        verbose_name="Référence",
    )

    note = models.TextField(
        blank=True,
        verbose_name="Note",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_movements",
        verbose_name="Effectué par",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Date",
    )

    class Meta:
        verbose_name = "Mouvement de stock"
        verbose_name_plural = "Mouvements de stock"

        ordering = [
            "-created_at",
            "-id",
        ]

        indexes = [
            models.Index(
                fields=[
                    "inventory_item",
                    "created_at",
                ],
                name="stock_move_item_date_idx",
            ),

            models.Index(
                fields=[
                    "movement_type",
                    "created_at",
                ],
                name="stock_move_type_date_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.get_movement_type_display()} — "
            f"{self.inventory_item}"
        )