import uuid
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q

from catalog.models import (
    Product,
    ProductVariant,
)

from checkout.models import (
    CheckoutSession,
)

from inventory.models import (
    InventoryItem,
)


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = (
            "PENDING",
            "En attente",
        )

        CONFIRMED = (
            "CONFIRMED",
            "Confirmée",
        )

        PREPARING = (
            "PREPARING",
            "En préparation",
        )

        READY = (
            "READY",
            "Prête",
        )

        SHIPPED = (
            "SHIPPED",
            "Expédiée",
        )

        DELIVERED = (
            "DELIVERED",
            "Livrée",
        )

        CANCELLED = (
            "CANCELLED",
            "Annulée",
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

    order_number = models.CharField(
        max_length=40,
        unique=True,
        db_index=True,
        verbose_name="Numéro de commande",
    )

    checkout_session = models.OneToOneField(
        CheckoutSession,
        on_delete=models.PROTECT,
        related_name="order",
        verbose_name="Session checkout",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
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
        verbose_name="Mode de réception",
    )

    city = models.CharField(
        max_length=120,
        blank=True,
        verbose_name="Ville",
    )

    delivery_zone = models.CharField(
        max_length=180,
        blank=True,
        verbose_name="Quartier / zone",
    )

    address = models.TextField(
        blank=True,
        verbose_name="Adresse",
    )

    notes = models.TextField(
        blank=True,
        verbose_name="Instructions client",
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
        verbose_name="Livraison",
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

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Créée le",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modifiée le",
    )

    class Meta:
        verbose_name = "Commande"

        verbose_name_plural = "Commandes"

        ordering = [
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "status",
                    "created_at",
                ],
                name="order_status_created_idx",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    subtotal__gte=0
                ),
                name="order_subtotal_gte_zero",
            ),

            models.CheckConstraint(
                condition=Q(
                    delivery_fee__gte=0
                ),
                name="order_delivery_gte_zero",
            ),

            models.CheckConstraint(
                condition=Q(
                    total__gte=0
                ),
                name="order_total_gte_zero",
            ),
        ]

    def __str__(self):
        return (
            f"{self.order_number} — "
            f"{self.customer_name}"
        )


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Commande",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items",
        verbose_name="Produit",
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="order_items",
        verbose_name="Variante",
    )

    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.PROTECT,
        related_name="order_items",
        verbose_name="Stock",
    )

    product_name = models.CharField(
        max_length=255,
        verbose_name="Produit snapshot",
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
        verbose_name="Prix vendu",
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
        verbose_name = "Article commande"

        verbose_name_plural = (
            "Articles commandes"
        )

        ordering = [
            "id",
        ]

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    quantity__gt=0
                ),
                name="order_item_qty_gt_zero",
            ),
        ]

    def __str__(self):
        return (
            f"{self.product_name} × "
            f"{self.quantity}"
        )


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH_ON_DELIVERY = (
            "CASH_ON_DELIVERY",
            "Paiement à la livraison",
        )

        PAY_AT_PICKUP = (
            "PAY_AT_PICKUP",
            "Paiement au retrait",
        )

    class Status(models.TextChoices):
        PENDING = (
            "PENDING",
            "En attente",
        )

        PAID = (
            "PAID",
            "Payé",
        )

        FAILED = (
            "FAILED",
            "Échoué",
        )

        CANCELLED = (
            "CANCELLED",
            "Annulé",
        )

        REFUNDED = (
            "REFUNDED",
            "Remboursé",
        )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    reference = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        verbose_name="Référence paiement",
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.PROTECT,
        related_name="payments",
        verbose_name="Commande",
    )

    method = models.CharField(
        max_length=30,
        choices=Method.choices,
        verbose_name="Mode de paiement",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
        verbose_name="Statut",
    )

    amount = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Montant",
    )

    currency = models.CharField(
        max_length=10,
        default="XOF",
        verbose_name="Devise",
    )

    provider = models.CharField(
        max_length=80,
        blank=True,
        verbose_name="Prestataire",
    )

    provider_reference = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
        verbose_name="Référence prestataire",
    )

    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
        verbose_name="ID transaction",
    )

    provider_payload = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Données prestataire",
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Payé le",
    )

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_payments",
        verbose_name="Enregistré par",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Créé le",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modifié le",
    )

    class Meta:
        verbose_name = "Paiement"

        verbose_name_plural = "Paiements"

        ordering = [
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "status",
                    "created_at",
                ],
                name="payment_status_date_idx",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    amount__gte=0
                ),
                name="payment_amount_gte_zero",
            ),
        ]

    def __str__(self):
        return (
            f"{self.reference} — "
            f"{self.order.order_number}"
        )