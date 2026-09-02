import uuid
from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone

from catalog.models import (
    Product,
    ProductVariant,
)

from inventory.models import InventoryItem


class CheckoutSession(models.Model):
    """
    Session temporaire avant la création
    définitive d'une commande.

    Le stock est réservé pendant la durée
    de validité de cette session.
    """

    class Status(models.TextChoices):
        ACTIVE = (
            "ACTIVE",
            "Active",
        )

        EXPIRED = (
            "EXPIRED",
            "Expirée",
        )

        CANCELLED = (
            "CANCELLED",
            "Annulée",
        )

        CONVERTED = (
            "CONVERTED",
            "Convertie en commande",
        )

    class DeliveryMethod(models.TextChoices):
        DELIVERY = (
            "DELIVERY",
            "Livraison",
        )

        PICKUP = (
            "PICKUP",
            "Retrait",
        )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
        verbose_name="Statut",
    )

    customer_name = models.CharField(
        max_length=180,
        verbose_name="Nom du client",
    )

    customer_phone = models.CharField(
        max_length=30,
        verbose_name="Téléphone",
    )

    customer_whatsapp = models.CharField(
        max_length=30,
        blank=True,
        verbose_name="WhatsApp",
    )

    customer_email = models.EmailField(
        blank=True,
        verbose_name="E-mail",
    )

    delivery_method = models.CharField(
        max_length=20,
        choices=DeliveryMethod.choices,
        default=DeliveryMethod.DELIVERY,
        verbose_name="Mode de livraison",
    )

    city = models.CharField(
        max_length=120,
        default="Bamako",
        verbose_name="Ville",
    )

    delivery_zone = models.CharField(
        max_length=180,
        blank=True,
        verbose_name="Zone / quartier",
    )

    address = models.TextField(
        blank=True,
        verbose_name="Adresse",
    )

    notes = models.TextField(
        blank=True,
        verbose_name="Instructions",
    )

    subtotal = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Sous-total",
    )

    delivery_fee = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Frais de livraison",
    )

    total = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Total",
    )

    expires_at = models.DateTimeField(
        db_index=True,
        verbose_name="Expire le",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Créée le",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modifiée le",
    )

    class Meta:
        verbose_name = "Session checkout"

        verbose_name_plural = (
            "Sessions checkout"
        )

        ordering = [
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "status",
                    "expires_at",
                ],
                name="checkout_status_exp_idx",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    subtotal__gte=0
                ),
                name="checkout_subtotal_gte_zero",
            ),

            models.CheckConstraint(
                condition=Q(
                    delivery_fee__gte=0
                ),
                name="checkout_delivery_gte_zero",
            ),

            models.CheckConstraint(
                condition=Q(
                    total__gte=0
                ),
                name="checkout_total_gte_zero",
            ),
        ]

    def __str__(self):
        return (
            f"Checkout {self.pk} — "
            f"{self.customer_name}"
        )

    @property
    def is_expired(self):
        return (
            timezone.now()
            >= self.expires_at
        )

    @property
    def remaining_seconds(self):
        if (
            self.status
            != self.Status.ACTIVE
        ):
            return 0

        remaining = (
            self.expires_at
            - timezone.now()
        ).total_seconds()

        return max(
            0,
            int(remaining),
        )


class CheckoutItem(models.Model):
    """
    Snapshot d'un article au moment du checkout.

    Le prix vient du serveur, jamais du frontend.
    """

    session = models.ForeignKey(
        CheckoutSession,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Session",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="checkout_items",
        verbose_name="Produit",
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="checkout_items",
        verbose_name="Variante",
    )

    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name="checkout_items",
        verbose_name="Stock",
    )

    product_name = models.CharField(
        max_length=255,
        verbose_name="Nom snapshot",
    )

    sku = models.CharField(
        max_length=120,
        verbose_name="SKU snapshot",
    )

    variant_label = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Variante snapshot",
    )

    normal_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Prix normal",
    )

    unit_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Prix appliqué",
    )

    quantity = models.PositiveIntegerField(
        verbose_name="Quantité",
    )

    line_total = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Total ligne",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        verbose_name = "Article checkout"

        verbose_name_plural = (
            "Articles checkout"
        )

        ordering = [
            "id",
        ]

        indexes = [
            models.Index(
                fields=[
                    "session",
                    "product",
                ],
                name="checkout_item_session_idx",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    quantity__gt=0
                ),
                name="checkout_item_qty_gt_zero",
            ),
        ]

    def __str__(self):
        return (
            f"{self.product_name} × "
            f"{self.quantity}"
        )