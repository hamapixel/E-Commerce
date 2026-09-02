from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models
from django.db.models import Q
from django.utils import timezone
from django.utils.text import slugify

from catalog.models import (
    Brand,
    Category,
    Product,
)

from .image_utils import (
    optimize_ad_image,
    validate_ad_image,
)


def generate_unique_slug(
    instance,
    value,
):
    base_slug = slugify(
        value
    )

    if not base_slug:
        base_slug = "campagne"

    slug = base_slug
    counter = 2

    queryset = (
        instance
        .__class__
        .objects
        .all()
    )

    if instance.pk:
        queryset = queryset.exclude(
            pk=instance.pk
        )

    while queryset.filter(
        slug=slug
    ).exists():
        slug = (
            f"{base_slug}-{counter}"
        )

        counter += 1

    return slug


class PromotionQuerySet(models.QuerySet):
    def active_now(
        self,
        at=None,
    ):
        """
        Promotions réellement actives à l'instant donné.
        """

        at = at or timezone.now()

        return self.filter(
            is_active=True,
            start_at__lte=at,
            end_at__gt=at,
        )


class Promotion(models.Model):
    """
    Promotion ou campagne SOLDES SUGU KURA.

    Le prix normal du produit n'est jamais écrasé.

    Le moteur calcule dynamiquement le prix actif.

    À expiration :
    le prix normal redevient automatiquement effectif.
    """

    class CampaignType(models.TextChoices):
        STANDARD = (
            "STANDARD",
            "Promotion",
        )

        SALE = (
            "SALE",
            "Soldes",
        )

    class DiscountType(models.TextChoices):
        PERCENTAGE = (
            "PERCENTAGE",
            "Pourcentage",
        )

        FIXED_AMOUNT = (
            "FIXED_AMOUNT",
            "Montant fixe",
        )

        FIXED_PRICE = (
            "FIXED_PRICE",
            "Prix promotionnel fixe",
        )

    class TargetMode(models.TextChoices):
        ALL = (
            "ALL",
            "Tous les produits",
        )

        CATEGORY = (
            "CATEGORY",
            "Une catégorie",
        )

        BRAND = (
            "BRAND",
            "Une marque",
        )

        PRODUCTS = (
            "PRODUCTS",
            "Produits sélectionnés",
        )

    name = models.CharField(
        max_length=200,
        verbose_name="Nom",
    )

    slug = models.SlugField(
        max_length=230,
        unique=True,
        blank=True,
        verbose_name="Slug",
    )

    campaign_type = models.CharField(
        max_length=20,
        choices=CampaignType.choices,
        default=CampaignType.STANDARD,
        db_index=True,
        verbose_name="Type de campagne",
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        verbose_name="Type de réduction",
    )

    discount_value = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.01")
            )
        ],
        verbose_name="Valeur de la réduction",
    )

    target_mode = models.CharField(
        max_length=20,
        choices=TargetMode.choices,
        db_index=True,
        verbose_name="Cible",
    )

    target_category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="promotions",
        verbose_name="Catégorie ciblée",
    )

    target_brand = models.ForeignKey(
        Brand,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="promotions",
        verbose_name="Marque ciblée",
    )

    products = models.ManyToManyField(
        Product,
        blank=True,
        related_name="promotions",
        verbose_name="Produits concernés",
    )

    badge_text = models.CharField(
        max_length=60,
        default="🔥 PROMO",
        blank=True,
        verbose_name="Badge",
    )

    start_at = models.DateTimeField(
        db_index=True,
        verbose_name="Début",
    )

    end_at = models.DateTimeField(
        db_index=True,
        verbose_name="Fin",
    )

    priority = models.PositiveSmallIntegerField(
        default=0,
        db_index=True,
        verbose_name="Priorité",
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Active",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Créée le",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modifiée le",
    )

    objects = PromotionQuerySet.as_manager()

    class Meta:
        verbose_name = "Promotion"
        verbose_name_plural = "Promotions"

        ordering = [
            "-priority",
            "-start_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "is_active",
                    "start_at",
                    "end_at",
                ],
                name="promo_active_period_idx",
            ),

            models.Index(
                fields=[
                    "campaign_type",
                    "is_active",
                ],
                name="promo_type_active_idx",
            ),

            models.Index(
                fields=[
                    "target_mode",
                    "is_active",
                ],
                name="promo_target_active_idx",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    end_at__gt=models.F(
                        "start_at"
                    )
                ),
                name="promo_end_after_start",
            ),
        ]

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()

        if (
            self.start_at
            and self.end_at
            and self.end_at
            <= self.start_at
        ):
            raise ValidationError(
                {
                    "end_at": (
                        "La date de fin doit être "
                        "postérieure au début."
                    )
                }
            )

        if (
            self.discount_type
            == self.DiscountType.PERCENTAGE
            and self.discount_value
            > Decimal("100.00")
        ):
            raise ValidationError(
                {
                    "discount_value": (
                        "Une réduction en pourcentage "
                        "ne peut pas dépasser 100 %."
                    )
                }
            )

        if (
            self.target_mode
            == self.TargetMode.CATEGORY
            and not self.target_category
        ):
            raise ValidationError(
                {
                    "target_category": (
                        "Choisissez la catégorie "
                        "concernée."
                    )
                }
            )

        if (
            self.target_mode
            == self.TargetMode.BRAND
            and not self.target_brand
        ):
            raise ValidationError(
                {
                    "target_brand": (
                        "Choisissez la marque "
                        "concernée."
                    )
                }
            )

        if (
            self.target_mode
            != self.TargetMode.CATEGORY
            and self.target_category
        ):
            raise ValidationError(
                {
                    "target_category": (
                        "Cette catégorie ne doit être "
                        "définie qu'en ciblage catégorie."
                    )
                }
            )

        if (
            self.target_mode
            != self.TargetMode.BRAND
            and self.target_brand
        ):
            raise ValidationError(
                {
                    "target_brand": (
                        "Cette marque ne doit être "
                        "définie qu'en ciblage marque."
                    )
                }
            )

    def save(
        self,
        *args,
        **kwargs,
    ):
        if not self.slug:
            self.slug = (
                generate_unique_slug(
                    self,
                    self.name,
                )
            )

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )

    @property
    def is_current(self):
        now = timezone.now()

        return (
            self.is_active
            and self.start_at
            <= now
            < self.end_at
        )

    @property
    def remaining_seconds(self):
        if not self.is_current:
            return 0

        seconds = (
            self.end_at
            - timezone.now()
        ).total_seconds()

        return max(
            0,
            int(seconds),
        )


class AdvertisementQuerySet(
    models.QuerySet
):
    def active_now(
        self,
        *,
        placement=None,
        category=None,
        at=None,
    ):
        at = at or timezone.now()

        queryset = self.filter(
            is_active=True,
            start_at__lte=at,
            end_at__gt=at,
        )

        if placement:
            queryset = queryset.filter(
                placement=placement
            )

        if category:
            queryset = queryset.filter(
                Q(
                    target_categories__isnull=True
                )
                |
                Q(
                    target_categories=category
                )
            )

        return (
            queryset
            .distinct()
            .order_by(
                "-priority_level",
                "-display_priority",
                "id",
            )
        )


class Advertisement(models.Model):
    """
    Publicité sponsorisée SUGU KURA.
    """

    class Placement(models.TextChoices):
        HOME_HERO = (
            "HOME_HERO",
            "A — Grande bannière accueil",
        )

        HOME_MIDDLE = (
            "HOME_MIDDLE",
            "B — Entre catégories et produits",
        )

        CATEGORY = (
            "CATEGORY",
            "C — Page catégorie",
        )

        PRODUCT = (
            "PRODUCT",
            "D — Page détail produit",
        )

        CART = (
            "CART",
            "E — Panier",
        )

        MOBILE_BANNER = (
            "MOBILE_BANNER",
            "F — Petite bannière mobile",
        )

    class Priority(models.IntegerChoices):
        NORMAL = (
            10,
            "Normale",
        )

        IMPORTANT = (
            20,
            "Importante",
        )

        PREMIUM = (
            30,
            "Premium",
        )

    class DestinationType(
        models.TextChoices
    ):
        PRODUCT = (
            "PRODUCT",
            "Produit",
        )

        CATEGORY = (
            "CATEGORY",
            "Catégorie",
        )

        BRAND = (
            "BRAND",
            "Marque",
        )

        PAGE = (
            "PAGE",
            "Page spéciale",
        )

        WHATSAPP = (
            "WHATSAPP",
            "WhatsApp",
        )

        WEBSITE = (
            "WEBSITE",
            "Site partenaire",
        )

        CUSTOM = (
            "CUSTOM",
            "Lien personnalisé",
        )

    company_name = models.CharField(
        max_length=180,
        verbose_name="Entreprise",
    )

    company_logo = models.ImageField(
        upload_to="advertising/logos/",
        validators=[
            validate_ad_image
        ],
        null=True,
        blank=True,
        verbose_name="Logo entreprise",
    )

    title = models.CharField(
        max_length=220,
        verbose_name="Titre",
    )

    text = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Petit texte",
    )

    desktop_image = models.ImageField(
        upload_to="advertising/desktop/",
        validators=[
            validate_ad_image
        ],
        verbose_name="Image desktop",
    )

    mobile_image = models.ImageField(
        upload_to="advertising/mobile/",
        validators=[
            validate_ad_image
        ],
        null=True,
        blank=True,
        verbose_name="Image mobile",
    )

    button_text = models.CharField(
        max_length=80,
        default="Voir l'offre",
        blank=True,
        verbose_name="Texte bouton",
    )

    button_url = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Lien personnalisé",
    )

    whatsapp = models.CharField(
        max_length=30,
        blank=True,
        verbose_name="WhatsApp",
    )

    website = models.URLField(
        blank=True,
        verbose_name="Site web",
    )

    placement = models.CharField(
        max_length=30,
        choices=Placement.choices,
        db_index=True,
        verbose_name="Emplacement",
    )

    target_categories = (
        models.ManyToManyField(
            Category,
            blank=True,
            related_name=(
                "targeted_advertisements"
            ),
            verbose_name=(
                "Catégories contextuelles"
            ),
        )
    )

    priority_level = (
        models.PositiveSmallIntegerField(
            choices=Priority.choices,
            default=Priority.NORMAL,
            db_index=True,
            verbose_name="Niveau de priorité",
        )
    )

    display_priority = (
        models.PositiveIntegerField(
            default=0,
            db_index=True,
            verbose_name=(
                "Priorité d'affichage"
            ),
        )
    )

    promotion = models.ForeignKey(
        Promotion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="advertisements",
        verbose_name="Promotion associée",
    )

    display_old_price = (
        models.DecimalField(
            max_digits=14,
            decimal_places=2,
            null=True,
            blank=True,
            validators=[
                MinValueValidator(
                    Decimal("0.00")
                )
            ],
            verbose_name="Ancien prix affiché",
        )
    )

    display_price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="Prix affiché",
    )

    destination_type = (
        models.CharField(
            max_length=20,
            choices=(
                DestinationType.choices
            ),
            default=(
                DestinationType.CUSTOM
            ),
            verbose_name=(
                "Type de destination"
            ),
        )
    )

    destination_product = (
        models.ForeignKey(
            Product,
            on_delete=models.SET_NULL,
            null=True,
            blank=True,
            related_name=(
                "destination_advertisements"
            ),
            verbose_name=(
                "Produit destination"
            ),
        )
    )

    destination_category = (
        models.ForeignKey(
            Category,
            on_delete=models.SET_NULL,
            null=True,
            blank=True,
            related_name=(
                "destination_advertisements"
            ),
            verbose_name=(
                "Catégorie destination"
            ),
        )
    )

    destination_brand = (
        models.ForeignKey(
            Brand,
            on_delete=models.SET_NULL,
            null=True,
            blank=True,
            related_name=(
                "destination_advertisements"
            ),
            verbose_name=(
                "Marque destination"
            ),
        )
    )

    start_at = models.DateTimeField(
        db_index=True,
        verbose_name="Début",
    )

    end_at = models.DateTimeField(
        db_index=True,
        verbose_name="Fin",
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Active",
    )

    hide_after_expiry = models.BooleanField(
        default=True,
        verbose_name=(
            "Masquer après expiration"
        ),
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Créée le",
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Modifiée le",
    )

    objects = (
        AdvertisementQuerySet
        .as_manager()
    )

    class Meta:
        verbose_name = "Publicité"
        verbose_name_plural = "Publicités"

        ordering = [
            "-priority_level",
            "-display_priority",
            "id",
        ]

        indexes = [
            models.Index(
                fields=[
                    "placement",
                    "is_active",
                    "start_at",
                    "end_at",
                ],
                name="ad_place_period_idx",
            ),

            models.Index(
                fields=[
                    "priority_level",
                    "display_priority",
                ],
                name="ad_priority_idx",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    end_at__gt=models.F(
                        "start_at"
                    )
                ),
                name="ad_end_after_start",
            ),
        ]

    def __str__(self):
        return (
            f"{self.company_name} — "
            f"{self.title}"
        )

    def clean(self):
        super().clean()

        if (
            self.start_at
            and self.end_at
            and self.end_at
            <= self.start_at
        ):
            raise ValidationError(
                {
                    "end_at": (
                        "La fin doit être "
                        "postérieure au début."
                    )
                }
            )

        if (
            self.display_old_price
            is not None
            and self.display_price
            is not None
            and self.display_price
            > self.display_old_price
        ):
            raise ValidationError(
                {
                    "display_price": (
                        "Le prix promotionnel affiché "
                        "ne peut pas dépasser "
                        "l'ancien prix."
                    )
                }
            )

        destination = (
            self.destination_type
        )

        if (
            destination
            == self.DestinationType.PRODUCT
            and not self.destination_product
        ):
            raise ValidationError(
                {
                    "destination_product": (
                        "Choisissez le produit "
                        "de destination."
                    )
                }
            )

        if (
            destination
            == self.DestinationType.CATEGORY
            and not self.destination_category
        ):
            raise ValidationError(
                {
                    "destination_category": (
                        "Choisissez la catégorie "
                        "de destination."
                    )
                }
            )

        if (
            destination
            == self.DestinationType.BRAND
            and not self.destination_brand
        ):
            raise ValidationError(
                {
                    "destination_brand": (
                        "Choisissez la marque "
                        "de destination."
                    )
                }
            )

        if (
            destination
            == self.DestinationType.WHATSAPP
            and not self.whatsapp
        ):
            raise ValidationError(
                {
                    "whatsapp": (
                        "Le numéro WhatsApp "
                        "est obligatoire."
                    )
                }
            )

        if (
            destination
            == self.DestinationType.WEBSITE
            and not self.website
        ):
            raise ValidationError(
                {
                    "website": (
                        "Le site web "
                        "est obligatoire."
                    )
                }
            )

        if (
            destination
            in {
                self.DestinationType.PAGE,
                self.DestinationType.CUSTOM,
            }
            and not self.button_url
        ):
            raise ValidationError(
                {
                    "button_url": (
                        "Le lien est obligatoire "
                        "pour cette destination."
                    )
                }
            )

    def save(
        self,
        *args,
        **kwargs,
    ):
        if (
            self.company_logo
            and not getattr(
                self.company_logo,
                "_committed",
                True,
            )
        ):
            self.company_logo = (
                optimize_ad_image(
                    self.company_logo,
                    max_width=1200,
                    max_height=1200,
                )
            )

        if (
            self.desktop_image
            and not getattr(
                self.desktop_image,
                "_committed",
                True,
            )
        ):
            self.desktop_image = (
                optimize_ad_image(
                    self.desktop_image,
                    max_width=2400,
                    max_height=1400,
                )
            )

        if (
            self.mobile_image
            and not getattr(
                self.mobile_image,
                "_committed",
                True,
            )
        ):
            self.mobile_image = (
                optimize_ad_image(
                    self.mobile_image,
                    max_width=1600,
                    max_height=1800,
                )
            )

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )

    @property
    def is_current(self):
        now = timezone.now()

        return (
            self.is_active
            and self.start_at
            <= now
            < self.end_at
        )

    @property
    def effective_link(self):
        if (
            self.destination_type
            == self.DestinationType.PRODUCT
            and self.destination_product
        ):
            return (
                "/produits/"
                f"{self.destination_product.slug}"
            )

        if (
            self.destination_type
            == self.DestinationType.CATEGORY
            and self.destination_category
        ):
            return (
                "/categories/"
                f"{self.destination_category.slug}"
            )

        if (
            self.destination_type
            == self.DestinationType.BRAND
            and self.destination_brand
        ):
            return (
                "/marques/"
                f"{self.destination_brand.slug}"
            )

        if (
            self.destination_type
            == self.DestinationType.WHATSAPP
        ):
            number = "".join(
                char
                for char in self.whatsapp
                if char.isdigit()
            )

            return (
                f"https://wa.me/{number}"
            )

        if (
            self.destination_type
            == self.DestinationType.WEBSITE
        ):
            return self.website

        return self.button_url


class Partner(models.Model):
    """
    Entreprise ou marque partenaire SUGU KURA.
    """

    name = models.CharField(
        max_length=180,
        unique=True,
        verbose_name="Nom",
    )

    logo = models.ImageField(
        upload_to="partners/logos/",
        validators=[
            validate_ad_image
        ],
        verbose_name="Logo",
    )

    description = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Description",
    )

    website = models.URLField(
        blank=True,
        verbose_name="Site web",
    )

    page_url = models.CharField(
        max_length=500,
        blank=True,
        verbose_name="Lien interne",
    )

    display_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        verbose_name="Ordre",
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name="Actif",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "Partenaire"
        verbose_name_plural = "Partenaires"

        ordering = [
            "display_order",
            "name",
        ]

    def __str__(self):
        return self.name

    def save(
        self,
        *args,
        **kwargs,
    ):
        if (
            self.logo
            and not getattr(
                self.logo,
                "_committed",
                True,
            )
        ):
            self.logo = (
                optimize_ad_image(
                    self.logo,
                    max_width=1200,
                    max_height=1200,
                )
            )

        self.full_clean()

        super().save(
            *args,
            **kwargs,
        )

    @property
    def effective_link(self):
        return (
            self.page_url
            or self.website
        )


class AdvertisementDailyStat(
    models.Model
):
    """
    Statistiques quotidiennes d'une publicité.

    L'attribution réelle aux commandes sera reliée
    à l'Étape 13.
    """

    advertisement = models.ForeignKey(
        Advertisement,
        on_delete=models.CASCADE,
        related_name="daily_stats",
        verbose_name="Publicité",
    )

    date = models.DateField(
        default=timezone.localdate,
        db_index=True,
        verbose_name="Date",
    )

    impressions = (
        models.PositiveBigIntegerField(
            default=0,
            verbose_name="Impressions",
        )
    )

    clicks = (
        models.PositiveBigIntegerField(
            default=0,
            verbose_name="Clics",
        )
    )

    orders_count = (
        models.PositiveBigIntegerField(
            default=0,
            verbose_name="Commandes",
        )
    )

    attributed_revenue = (
        models.DecimalField(
            max_digits=16,
            decimal_places=2,
            default=Decimal("0.00"),
            validators=[
                MinValueValidator(
                    Decimal("0.00")
                )
            ],
            verbose_name=(
                "Chiffre d'affaires attribué"
            ),
        )
    )

    class Meta:
        verbose_name = (
            "Statistique publicitaire"
        )

        verbose_name_plural = (
            "Statistiques publicitaires"
        )

        ordering = [
            "-date",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "advertisement",
                    "date",
                ],
                name="unique_ad_daily_stat",
            ),
        ]

    def __str__(self):
        return (
            f"{self.advertisement} — "
            f"{self.date}"
        )

    @property
    def ctr(self):
        if self.impressions == 0:
            return Decimal("0.00")

        value = (
            Decimal(self.clicks)
            / Decimal(self.impressions)
        ) * Decimal("100")

        return value.quantize(
            Decimal("0.01")
        )