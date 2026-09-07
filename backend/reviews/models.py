from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models

from catalog.models import Product


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
