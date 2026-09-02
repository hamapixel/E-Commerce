from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils.text import slugify

from .image_utils import (
    optimize_uploaded_image,
    validate_catalog_image,
)


def generate_unique_slug(instance, value):
    """
    Génère un slug ASCII unique adapté au SEO.

    Exemples :

    Téléphones -> telephones
    Électricité -> electricite
    """

    base_slug = slugify(value)

    if not base_slug:
        base_slug = "element"

    slug = base_slug
    counter = 2

    queryset = instance.__class__.objects.all()

    if instance.pk:
        queryset = queryset.exclude(
            pk=instance.pk
        )

    while queryset.filter(
        slug=slug
    ).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1

    return slug


class Category(models.Model):
    """
    Catégorie ou sous-catégorie SUGU KURA.
    """

    name = models.CharField(
        max_length=150,
        db_index=True,
        verbose_name="Nom",
    )

    slug = models.SlugField(
        max_length=180,
        unique=True,
        blank=True,
        allow_unicode=False,
        verbose_name="Slug",
    )

    description = models.TextField(
        blank=True,
        verbose_name="Description",
    )

    parent = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="subcategories",
        verbose_name="Catégorie parente",
    )

    image = models.ImageField(
        upload_to="catalog/categories/",
        null=True,
        blank=True,
        verbose_name="Image",
    )

    icon = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Icône",
    )

    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        verbose_name="Ordre d'affichage",
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Active",
    )

    is_featured_home = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Mise en avant accueil",
    )

    seo_title = models.CharField(
        max_length=70,
        blank=True,
        verbose_name="Titre SEO",
    )

    seo_description = models.CharField(
        max_length=170,
        blank=True,
        verbose_name="Description SEO",
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
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"

        ordering = [
            "display_order",
            "name",
        ]

        indexes = [
            models.Index(
                fields=[
                    "is_active",
                    "display_order",
                ],
                name="cat_active_order_idx",
            ),
            models.Index(
                fields=[
                    "parent",
                    "is_active",
                ],
                name="cat_parent_active_idx",
            ),
        ]

    def __str__(self):
        if self.parent:
            return (
                f"{self.parent.name} > "
                f"{self.name}"
            )

        return self.name

    def clean(self):
        super().clean()

        if not self.parent:
            return

        if (
            self.pk
            and self.parent_id == self.pk
        ):
            raise ValidationError(
                {
                    "parent": (
                        "Une catégorie ne peut pas être "
                        "sa propre catégorie parente."
                    )
                }
            )

        current = self.parent
        visited = set()

        while current:
            if current.pk in visited:
                break

            visited.add(current.pk)

            if (
                self.pk
                and current.pk == self.pk
            ):
                raise ValidationError(
                    {
                        "parent": (
                            "Cette relation créerait une "
                            "boucle dans les catégories."
                        )
                    }
                )

            current = current.parent

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(
                self,
                self.name,
            )

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )

    @property
    def is_root(self):
        return self.parent_id is None


class Brand(models.Model):
    """
    Marque commerciale.
    """

    name = models.CharField(
        max_length=150,
        unique=True,
        db_index=True,
        verbose_name="Nom",
    )

    slug = models.SlugField(
        max_length=180,
        unique=True,
        blank=True,
        allow_unicode=False,
        verbose_name="Slug",
    )

    logo = models.ImageField(
        upload_to="catalog/brands/",
        null=True,
        blank=True,
        verbose_name="Logo",
    )

    description = models.TextField(
        blank=True,
        verbose_name="Description",
    )

    website = models.URLField(
        blank=True,
        verbose_name="Site web",
    )

    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        verbose_name="Ordre d'affichage",
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Active",
    )

    is_featured = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Mise en avant",
    )

    seo_title = models.CharField(
        max_length=70,
        blank=True,
        verbose_name="Titre SEO",
    )

    seo_description = models.CharField(
        max_length=170,
        blank=True,
        verbose_name="Description SEO",
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
        verbose_name = "Marque"
        verbose_name_plural = "Marques"

        ordering = [
            "display_order",
            "name",
        ]

        indexes = [
            models.Index(
                fields=[
                    "is_active",
                    "display_order",
                ],
                name="brand_active_order_idx",
            ),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(
                self,
                self.name,
            )

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )


class Product(models.Model):
    """
    Produit générique SUGU KURA.

    Ce modèle doit pouvoir représenter aussi bien :

    - smartphone ;
    - ampoule ;
    - ventilateur ;
    - climatiseur ;
    - casque ;
    - humidificateur ;
    - équipement solaire ;
    - article sanitaire ;
    - quincaillerie.
    """

    class Status(models.TextChoices):
        DRAFT = (
            "DRAFT",
            "Brouillon",
        )

        ACTIVE = (
            "ACTIVE",
            "Actif",
        )

        INACTIVE = (
            "INACTIVE",
            "Inactif",
        )

        ARCHIVED = (
            "ARCHIVED",
            "Archivé",
        )

    name = models.CharField(
        max_length=220,
        db_index=True,
        verbose_name="Nom",
    )

    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True,
        allow_unicode=False,
        verbose_name="Slug",
    )

    sku = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        verbose_name="SKU",
    )

    barcode = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        verbose_name="Code-barres",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
        verbose_name="Catégorie",
    )

    brand = models.ForeignKey(
        Brand,
        on_delete=models.PROTECT,
        related_name="products",
        null=True,
        blank=True,
        verbose_name="Marque",
    )

    short_description = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Description courte",
    )

    description = models.TextField(
        blank=True,
        verbose_name="Description complète",
    )

    base_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Prix de vente",
    )

    purchase_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Prix d'achat",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
        verbose_name="Statut",
    )

    is_featured = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Mis en avant",
    )

    seo_title = models.CharField(
        max_length=70,
        blank=True,
        verbose_name="Titre SEO",
    )

    seo_description = models.CharField(
        max_length=170,
        blank=True,
        verbose_name="Description SEO",
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
        verbose_name = "Produit"
        verbose_name_plural = "Produits"

        ordering = [
            "-created_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "status",
                    "category",
                ],
                name="product_status_cat_idx",
            ),

            models.Index(
                fields=[
                    "brand",
                    "status",
                ],
                name="product_brand_status_idx",
            ),

            models.Index(
                fields=[
                    "is_featured",
                    "status",
                ],
                name="product_featured_idx",
            ),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.sku = self.sku.strip().upper()

        if self.barcode == "":
            self.barcode = None

        if not self.slug:
            self.slug = generate_unique_slug(
                self,
                self.name,
            )

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )

    @property
    def is_public(self):
        return (
            self.status
            == self.Status.ACTIVE
        )

    @property
    def primary_image(self):
        return self.images.filter(
            is_primary=True
        ).first()


class ProductImage(models.Model):
    """
    Galerie d'images d'un produit.

    Les images sont automatiquement converties en WebP
    sans découper le produit.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
        verbose_name="Produit",
    )

    image = models.ImageField(
        upload_to="catalog/products/",
        validators=[
            validate_catalog_image
        ],
        verbose_name="Image",
    )

    alt_text = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Texte alternatif",
    )

    is_primary = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Image principale",
    )

    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        verbose_name="Ordre",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        verbose_name = "Image produit"
        verbose_name_plural = "Images produits"

        ordering = [
            "display_order",
            "id",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product",
                ],
                condition=Q(
                    is_primary=True
                ),
                name=(
                    "unique_primary_product_image"
                ),
            ),
        ]

    def __str__(self):
        return (
            f"Image — {self.product.name}"
        )

    def save(self, *args, **kwargs):
        if (
            self.image
            and not getattr(
                self.image,
                "_committed",
                True,
            )
        ):
            self.image = (
                optimize_uploaded_image(
                    self.image
                )
            )

        if not self.alt_text:
            self.alt_text = (
                self.product.name
            )

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )


class Attribute(models.Model):
    """
    Attribut générique.

    Exemples :

    - Couleur
    - RAM
    - Stockage
    - Taille
    - Puissance
    - Capacité
    - Voltage
    """

    class DataType(models.TextChoices):
        TEXT = (
            "TEXT",
            "Texte",
        )

        NUMBER = (
            "NUMBER",
            "Nombre",
        )

        COLOR = (
            "COLOR",
            "Couleur",
        )

        BOOLEAN = (
            "BOOLEAN",
            "Oui / Non",
        )

    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Nom",
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True,
        allow_unicode=False,
        verbose_name="Slug",
    )

    data_type = models.CharField(
        max_length=20,
        choices=DataType.choices,
        default=DataType.TEXT,
        verbose_name="Type",
    )

    display_order = models.PositiveIntegerField(
        default=0,
        verbose_name="Ordre",
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Actif",
    )

    class Meta:
        verbose_name = "Attribut"
        verbose_name_plural = "Attributs"

        ordering = [
            "display_order",
            "name",
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(
                self,
                self.name,
            )

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )


class AttributeValue(models.Model):
    """
    Valeur possible pour un attribut.

    Exemples :

    Couleur :
        Noir
        Bleu
        Blanc

    Stockage :
        128 Go
        256 Go
    """

    attribute = models.ForeignKey(
        Attribute,
        on_delete=models.CASCADE,
        related_name="values",
        verbose_name="Attribut",
    )

    value = models.CharField(
        max_length=150,
        verbose_name="Valeur",
    )

    display_value = models.CharField(
        max_length=150,
        blank=True,
        verbose_name="Valeur affichée",
    )

    color_hex = models.CharField(
        max_length=9,
        blank=True,
        verbose_name="Couleur HEX",
        help_text="#000000",
    )

    display_order = models.PositiveIntegerField(
        default=0,
        verbose_name="Ordre",
    )

    is_active = models.BooleanField(
        default=True,
        verbose_name="Active",
    )

    class Meta:
        verbose_name = "Valeur d'attribut"
        verbose_name_plural = (
            "Valeurs d'attributs"
        )

        ordering = [
            "attribute__display_order",
            "display_order",
            "value",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "attribute",
                    "value",
                ],
                name=(
                    "unique_attribute_value"
                ),
            ),
        ]

    def __str__(self):
        return (
            f"{self.attribute.name}: "
            f"{self.display_value or self.value}"
        )

    def save(self, *args, **kwargs):
        if not self.display_value:
            self.display_value = self.value

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )


class ProductAttribute(models.Model):
    """
    Attribut autorisé sur un produit.

    Exemple :

    iPhone 13 :
        Couleur
        Stockage
        RAM
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="product_attributes",
        verbose_name="Produit",
    )

    attribute = models.ForeignKey(
        Attribute,
        on_delete=models.PROTECT,
        related_name="product_attributes",
        verbose_name="Attribut",
    )

    is_required = models.BooleanField(
        default=False,
        verbose_name="Obligatoire",
    )

    is_variant_axis = models.BooleanField(
        default=True,
        verbose_name=(
            "Utilisé pour les variantes"
        ),
    )

    display_order = models.PositiveIntegerField(
        default=0,
        verbose_name="Ordre",
    )

    class Meta:
        verbose_name = "Attribut produit"
        verbose_name_plural = (
            "Attributs produits"
        )

        ordering = [
            "display_order",
            "attribute__name",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "product",
                    "attribute",
                ],
                name=(
                    "unique_product_attribute"
                ),
            ),
        ]

    def __str__(self):
        return (
            f"{self.product.name} — "
            f"{self.attribute.name}"
        )


class ProductVariant(models.Model):
    """
    Variante commerciale.

    Exemple :

    iPhone 13
        128 Go / Noir
        128 Go / Bleu
        256 Go / Noir

    Le stock sera ajouté à l'ÉTAPE 6.
    """

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants",
        verbose_name="Produit",
    )

    sku = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        verbose_name="SKU variante",
    )

    barcode = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        verbose_name="Code-barres",
    )

    price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Prix spécifique",
        help_text=(
            "Laisser vide pour utiliser "
            "le prix du produit."
        ),
    )

    image = models.ImageField(
        upload_to="catalog/variants/",
        validators=[
            validate_catalog_image
        ],
        null=True,
        blank=True,
        verbose_name="Image",
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Active",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    attribute_values = models.ManyToManyField(
        AttributeValue,
        through="VariantAttributeSelection",
        related_name="variants",
        blank=True,
    )

    class Meta:
        verbose_name = "Variante"
        verbose_name_plural = "Variantes"

        ordering = [
            "product__name",
            "sku",
        ]

        indexes = [
            models.Index(
                fields=[
                    "product",
                    "is_active",
                ],
                name="variant_product_active_idx",
            ),
        ]

    def __str__(self):
        return self.display_name

    def save(self, *args, **kwargs):
        self.sku = self.sku.strip().upper()

        if self.barcode == "":
            self.barcode = None

        if (
            self.image
            and not getattr(
                self.image,
                "_committed",
                True,
            )
        ):
            self.image = (
                optimize_uploaded_image(
                    self.image
                )
            )

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )

    @property
    def effective_price(self):
        if self.price is not None:
            return self.price

        return self.product.base_price

    @property
    def display_name(self):
        if not self.pk:
            return (
                f"{self.product.name} — "
                f"{self.sku}"
            )

        selections = (
            self.selections
            .select_related(
                "attribute_value__attribute"
            )
            .order_by(
                "attribute_value"
                "__attribute"
                "__display_order",
                "attribute_value"
                "__display_order",
            )
        )

        values = [
            selection.attribute_value
            .display_value
            for selection in selections
        ]

        if not values:
            return (
                f"{self.product.name} — "
                f"{self.sku}"
            )

        return (
            f"{self.product.name} — "
            f"{' / '.join(values)}"
        )


class VariantAttributeSelection(models.Model):
    """
    Valeur d'attribut sélectionnée pour une variante.
    """

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="selections",
        verbose_name="Variante",
    )

    attribute_value = models.ForeignKey(
        AttributeValue,
        on_delete=models.PROTECT,
        related_name="variant_selections",
        verbose_name="Valeur",
    )

    class Meta:
        verbose_name = (
            "Sélection d'attribut variante"
        )

        verbose_name_plural = (
            "Sélections d'attributs variantes"
        )

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "variant",
                    "attribute_value",
                ],
                name=(
                    "unique_variant_attribute_value"
                ),
            ),
        ]

    def __str__(self):
        return (
            f"{self.variant.sku} — "
            f"{self.attribute_value}"
        )

    def clean(self):
        super().clean()

        if not self.variant_id:
            return

        attribute = (
            self.attribute_value.attribute
        )

        allowed = (
            ProductAttribute.objects
            .filter(
                product=self.variant.product,
                attribute=attribute,
                is_variant_axis=True,
            )
            .exists()
        )

        if not allowed:
            raise ValidationError(
                {
                    "attribute_value": (
                        "Cet attribut n'est pas "
                        "configuré comme variante "
                        "pour ce produit."
                    )
                }
            )

        duplicate_attribute = (
            VariantAttributeSelection.objects
            .filter(
                variant=self.variant,
                attribute_value__attribute=(
                    attribute
                ),
            )
            .exclude(
                pk=self.pk
            )
            .exists()
        )

        if duplicate_attribute:
            raise ValidationError(
                {
                    "attribute_value": (
                        "Cette variante possède déjà "
                        "une valeur pour cet attribut."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )