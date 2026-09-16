from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("checkout", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="DeliveryZone",
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
                    "name",
                    models.CharField(
                        max_length=120,
                        verbose_name="Zone / quartier",
                    ),
                ),
                (
                    "city",
                    models.CharField(
                        default="Bamako",
                        max_length=120,
                        verbose_name="Ville",
                    ),
                ),
                (
                    "fee",
                    models.DecimalField(
                        decimal_places=2,
                        default=Decimal("0.00"),
                        max_digits=12,
                        validators=[
                            MinValueValidator(
                                Decimal("0.00")
                            )
                        ],
                        verbose_name="Frais de livraison",
                    ),
                ),
                (
                    "estimated_delivery",
                    models.CharField(
                        blank=True,
                        max_length=120,
                        verbose_name="Délai indicatif",
                    ),
                ),
                (
                    "display_order",
                    models.PositiveIntegerField(
                        default=0,
                        verbose_name="Ordre d'affichage",
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        db_index=True,
                        default=True,
                        verbose_name="Active",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True,
                        verbose_name="Créée le",
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True,
                        verbose_name="Modifiée le",
                    ),
                ),
            ],
            options={
                "verbose_name": "Zone de livraison",
                "verbose_name_plural": "Zones de livraison",
                "ordering": [
                    "display_order",
                    "city",
                    "name",
                ],
            },
        ),
        migrations.AddConstraint(
            model_name="deliveryzone",
            constraint=models.UniqueConstraint(
                fields=("city", "name"),
                name="checkout_zone_city_name_uniq",
            ),
        ),
        migrations.AddConstraint(
            model_name="deliveryzone",
            constraint=models.CheckConstraint(
                condition=models.Q(
                    fee__gte=Decimal("0.00")
                ),
                name="checkout_zone_fee_gte_zero",
            ),
        ),
    ]
