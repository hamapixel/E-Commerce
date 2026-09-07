import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        (
            "catalog",
            "0003_attribute_alter_category_icon_attributevalue_product_and_more",
        ),
    ]

    operations = [
        migrations.CreateModel(
            name="ProductReview",
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
                    "customer_name",
                    models.CharField(
                        max_length=100,
                        verbose_name="Nom du client",
                    ),
                ),
                (
                    "rating",
                    models.PositiveSmallIntegerField(
                        db_index=True,
                        validators=[
                            django.core.validators.MinValueValidator(1),
                            django.core.validators.MaxValueValidator(5),
                        ],
                        verbose_name="Note",
                    ),
                ),
                (
                    "comment",
                    models.TextField(
                        max_length=1200,
                        verbose_name="Commentaire",
                    ),
                ),
                (
                    "is_approved",
                    models.BooleanField(
                        db_index=True,
                        default=True,
                        verbose_name="Publié",
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
                    "product",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="customer_reviews",
                        to="catalog.product",
                        verbose_name="Produit",
                    ),
                ),
            ],
            options={
                "verbose_name": "Avis produit",
                "verbose_name_plural": "Avis produits",
                "ordering": [
                    "-created_at",
                    "-id",
                ],
            },
        ),
        migrations.AddIndex(
            model_name="productreview",
            index=models.Index(
                fields=[
                    "product",
                    "is_approved",
                    "-created_at",
                ],
                name="review_product_public_idx",
            ),
        ),
    ]
