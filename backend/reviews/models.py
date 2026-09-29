from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models

from catalog.models import Product
from orders.models import Order


class ProductReview(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="customer_reviews",
        verbose_name="Produit",
    )

    customer_name = models.CharField(
        max_length=100,
        verbose_name="Nom du client",
    )

    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5),
        ],
        db_index=True,
        verbose_name="Note",
    )

    comment = models.TextField(
        max_length=1200,
        verbose_name="Commentaire",
    )

    is_approved = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Publié",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Créé le",
    )

    class Meta:
        verbose_name = "Avis produit"
        verbose_name_plural = "Avis produits"
        ordering = [
            "-created_at",
            "-id",
        ]
        indexes = [
            models.Index(
                fields=[
                    "product",
                    "is_approved",
                    "-created_at",
                ],
                name="review_product_public_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.customer_name} — "
            f"{self.product.name} — "
            f"{self.rating}/5"
        )


class OrderSatisfaction(models.Model):
    class Experience(models.TextChoices):
        VERY_SATISFIED = (
            "VERY_SATISFIED",
            "Très satisfait",
        )
        SATISFIED = (
            "SATISFIED",
            "Satisfait",
        )
        OK = (
            "OK",
            "Correct",
        )
        PROBLEM = (
            "PROBLEM",
            "J'ai rencontré un problème",
        )

    class ProblemReason(models.TextChoices):
        LATE = (
            "LATE",
            "Livraison en retard",
        )
        DAMAGED = (
            "DAMAGED",
            "Produit endommagé",
        )
        WRONG_ITEM = (
            "WRONG_ITEM",
            "Mauvais produit",
        )
        MISSING_ITEM = (
            "MISSING_ITEM",
            "Article manquant",
        )
        SERVICE = (
            "SERVICE",
            "Service client",
        )
        OTHER = (
            "OTHER",
            "Autre",
        )

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="satisfaction",
        verbose_name="Commande",
    )

    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5),
        ],
        db_index=True,
        verbose_name="Note globale",
    )

    experience = models.CharField(
        max_length=24,
        choices=Experience.choices,
        default=Experience.OK,
        db_index=True,
        verbose_name="Expérience",
    )

    tags = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Points appréciés",
    )

    comment = models.TextField(
        max_length=1200,
        blank=True,
        verbose_name="Commentaire",
    )

    problem_reason = models.CharField(
        max_length=24,
        choices=ProblemReason.choices,
        blank=True,
        verbose_name="Motif du problème",
    )

    wants_contact = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Souhaite être recontacté",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Créé le",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modifié le",
    )

    class Meta:
        verbose_name = "Satisfaction commande"
        verbose_name_plural = "Satisfactions commandes"
        ordering = [
            "-created_at",
            "-id",
        ]
        indexes = [
            models.Index(
                fields=[
                    "rating",
                    "created_at",
                ],
                name="satisfaction_rating_date_idx",
            ),
        ]

    def __str__(self):
        return (
            f"{self.order.order_number} — "
            f"{self.rating}/5"
        )
