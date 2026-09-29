from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
)
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("orders", "0001_initial"),
        ("reviews", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="OrderSatisfaction",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "rating",
                    models.PositiveSmallIntegerField(
                        db_index=True,
                        validators=[
                            MinValueValidator(1),
                            MaxValueValidator(5),
                        ],
                        verbose_name="Note globale",
                    ),
                ),
                (
                    "experience",
                    models.CharField(
                        choices=[
                            ("VERY_SATISFIED", "Très satisfait"),
                            ("SATISFIED", "Satisfait"),
                            ("OK", "Correct"),
                            ("PROBLEM", "J'ai rencontré un problème"),
                        ],
                        db_index=True,
                        default="OK",
                        max_length=24,
                        verbose_name="Expérience",
                    ),
                ),
                (
                    "tags",
                    models.JSONField(
                        blank=True,
                        default=list,
                        verbose_name="Points appréciés",
                    ),
                ),
                (
                    "comment",
                    models.TextField(
                        blank=True,
                        max_length=1200,
                        verbose_name="Commentaire",
                    ),
                ),
                (
                    "problem_reason",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("LATE", "Livraison en retard"),
                            ("DAMAGED", "Produit endommagé"),
                            ("WRONG_ITEM", "Mauvais produit"),
                            ("MISSING_ITEM", "Article manquant"),
                            ("SERVICE", "Service client"),
                            ("OTHER", "Autre"),
                        ],
                        max_length=24,
                        verbose_name="Motif du problème",
                    ),
                ),
                (
                    "wants_contact",
                    models.BooleanField(
                        db_index=True,
                        default=False,
                        verbose_name="Souhaite être recontacté",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True,
                        db_index=True,
                        verbose_name="Créé le",
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True,
                        verbose_name="Modifié le",
                    ),
                ),
                (
                    "order",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="satisfaction",
                        to="orders.order",
                        verbose_name="Commande",
                    ),
                ),
            ],
            options={
                "verbose_name": "Satisfaction commande",
                "verbose_name_plural": "Satisfactions commandes",
                "ordering": ["-created_at", "-id"],
            },
        ),
        migrations.AddIndex(
            model_name="ordersatisfaction",
            index=models.Index(
                fields=["rating", "created_at"],
                name="satisfaction_rating_date_idx",
            ),
        ),
    ]
