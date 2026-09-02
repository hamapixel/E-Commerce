from decimal import Decimal
from io import BytesIO

from django.core.files.uploadedfile import (
    SimpleUploadedFile,
)
from django.test import TestCase
from django.utils import timezone
from PIL import Image

from catalog.models import (
    Brand,
    Category,
    Product,
)

from .models import (
    Advertisement,
    Partner,
    Promotion,
)

from .services import (
    calculate_promotional_price,
    get_active_advertisements,
    get_effective_price,
    record_ad_click,
    record_ad_impression,
)


class PromotionBaseMixin:
    def create_catalog(self):
        self.category = (
            Category.objects.create(
                name="Smartphones",
            )
        )

        self.other_category = (
            Category.objects.create(
                name="Électricité",
            )
        )

        self.brand = (
            Brand.objects.create(
                name="Samsung",
            )
        )

        self.product = (
            Product.objects.create(
                name="Samsung Galaxy A26",
                sku="SAM-A26",
                category=self.category,
                brand=self.brand,
                base_price=Decimal(
                    "150000.00"
                ),
                status=(
                    Product.Status.ACTIVE
                ),
            )
        )

    def active_period(self):
        now = timezone.now()

        return (
            now - timezone.timedelta(
                hours=1
            ),
            now + timezone.timedelta(
                hours=5
            ),
        )

    def create_test_image(
        self,
        name="banner.png",
    ):
        buffer = BytesIO()

        image = Image.new(
            "RGB",
            (
                1200,
                600,
            ),
            "white",
        )

        image.save(
            buffer,
            format="PNG",
        )

        return SimpleUploadedFile(
            name,
            buffer.getvalue(),
            content_type="image/png",
        )


class PromotionTests(
    PromotionBaseMixin,
    TestCase,
):
    def setUp(self):
        self.create_catalog()

    def test_percentage_promotion(self):
        start, end = (
            self.active_period()
        )

        promo = Promotion.objects.create(
            name="Promo Samsung",
            campaign_type=(
                Promotion
                .CampaignType
                .STANDARD
            ),
            discount_type=(
                Promotion
                .DiscountType
                .PERCENTAGE
            ),
            discount_value=(
                Decimal("20.00")
            ),
            target_mode=(
                Promotion
                .TargetMode
                .BRAND
            ),
            target_brand=self.brand,
            start_at=start,
            end_at=end,
        )

        price = (
            calculate_promotional_price(
                Decimal("150000.00"),
                promo,
            )
        )

        self.assertEqual(
            price,
            Decimal("120000.00"),
        )

    def test_sale_category_applies_to_product(
        self
    ):
        start, end = (
            self.active_period()
        )

        Promotion.objects.create(
            name="Soldes Smartphones",
            campaign_type=(
                Promotion
                .CampaignType
                .SALE
            ),
            discount_type=(
                Promotion
                .DiscountType
                .PERCENTAGE
            ),
            discount_value=(
                Decimal("10.00")
            ),
            target_mode=(
                Promotion
                .TargetMode
                .CATEGORY
            ),
            target_category=(
                self.category
            ),
            start_at=start,
            end_at=end,
        )

        result = get_effective_price(
            self.product
        )

        self.assertTrue(
            result["has_promotion"]
        )

        self.assertEqual(
            result["current_price"],
            Decimal("135000.00"),
        )

    def test_expired_promotion_is_ignored(
        self
    ):
        now = timezone.now()

        Promotion.objects.create(
            name="Ancienne promo",
            discount_type=(
                Promotion
                .DiscountType
                .PERCENTAGE
            ),
            discount_value=(
                Decimal("50.00")
            ),
            target_mode=(
                Promotion
                .TargetMode
                .ALL
            ),
            start_at=(
                now
                - timezone.timedelta(
                    days=2
                )
            ),
            end_at=(
                now
                - timezone.timedelta(
                    days=1
                )
            ),
        )

        result = get_effective_price(
            self.product
        )

        self.assertFalse(
            result["has_promotion"]
        )

        self.assertEqual(
            result["current_price"],
            Decimal("150000.00"),
        )

    def test_future_promotion_is_ignored(
        self
    ):
        now = timezone.now()

        Promotion.objects.create(
            name="Promo future",
            discount_type=(
                Promotion
                .DiscountType
                .PERCENTAGE
            ),
            discount_value=(
                Decimal("50.00")
            ),
            target_mode=(
                Promotion
                .TargetMode
                .ALL
            ),
            start_at=(
                now
                + timezone.timedelta(
                    days=1
                )
            ),
            end_at=(
                now
                + timezone.timedelta(
                    days=2
                )
            ),
        )

        result = get_effective_price(
            self.product
        )

        self.assertFalse(
            result["has_promotion"]
        )

    def test_best_promotion_wins(self):
        start, end = (
            self.active_period()
        )

        Promotion.objects.create(
            name="10 pourcent",
            discount_type=(
                Promotion
                .DiscountType
                .PERCENTAGE
            ),
            discount_value=(
                Decimal("10.00")
            ),
            target_mode=(
                Promotion
                .TargetMode
                .ALL
            ),
            start_at=start,
            end_at=end,
        )

        Promotion.objects.create(
            name="Prix spécial",
            discount_type=(
                Promotion
                .DiscountType
                .FIXED_PRICE
            ),
            discount_value=(
                Decimal("130000.00")
            ),
            target_mode=(
                Promotion
                .TargetMode
                .ALL
            ),
            start_at=start,
            end_at=end,
        )

        result = get_effective_price(
            self.product
        )

        self.assertEqual(
            result["current_price"],
            Decimal("130000.00"),
        )

    def test_selected_products_promotion(
        self
    ):
        start, end = (
            self.active_period()
        )

        promo = Promotion.objects.create(
            name="Produits sélectionnés",
            discount_type=(
                Promotion
                .DiscountType
                .PERCENTAGE
            ),
            discount_value=(
                Decimal("15.00")
            ),
            target_mode=(
                Promotion
                .TargetMode
                .PRODUCTS
            ),
            start_at=start,
            end_at=end,
        )

        promo.products.add(
            self.product
        )

        result = get_effective_price(
            self.product
        )

        self.assertTrue(
            result["has_promotion"]
        )


class AdvertisementTests(
    PromotionBaseMixin,
    TestCase,
):
    def setUp(self):
        self.create_catalog()

    def create_ad(
        self,
        **kwargs,
    ):
        start, end = (
            self.active_period()
        )

        data = {
            "company_name": "Samsung",
            "title": (
                "Découvrez les offres Samsung"
            ),
            "desktop_image": (
                self.create_test_image()
            ),
            "button_text": (
                "Voir les produits"
            ),
            "button_url": (
                "/categories/smartphones"
            ),
            "placement": (
                Advertisement
                .Placement
                .HOME_HERO
            ),
            "priority_level": (
                Advertisement
                .Priority
                .PREMIUM
            ),
            "destination_type": (
                Advertisement
                .DestinationType
                .CUSTOM
            ),
            "start_at": start,
            "end_at": end,
        }

        data.update(
            kwargs
        )

        return (
            Advertisement.objects.create(
                **data
            )
        )

    def test_active_ad_is_returned(self):
        ad = self.create_ad()

        queryset = (
            get_active_advertisements(
                placement=(
                    Advertisement
                    .Placement
                    .HOME_HERO
                )
            )
        )

        self.assertIn(
            ad,
            queryset,
        )

        ad.desktop_image.delete(
            save=False
        )

    def test_future_ad_is_not_returned(
        self
    ):
        now = timezone.now()

        ad = self.create_ad(
            start_at=(
                now
                + timezone.timedelta(
                    days=1
                )
            ),
            end_at=(
                now
                + timezone.timedelta(
                    days=2
                )
            ),
        )

        queryset = (
            get_active_advertisements(
                placement=(
                    Advertisement
                    .Placement
                    .HOME_HERO
                )
            )
        )

        self.assertNotIn(
            ad,
            queryset,
        )

        ad.desktop_image.delete(
            save=False
        )

    def test_category_targeting(self):
        ad = self.create_ad()

        ad.target_categories.add(
            self.category
        )

        smartphone_ads = (
            get_active_advertisements(
                placement=(
                    Advertisement
                    .Placement
                    .HOME_HERO
                ),
                category=self.category,
            )
        )

        electric_ads = (
            get_active_advertisements(
                placement=(
                    Advertisement
                    .Placement
                    .HOME_HERO
                ),
                category=(
                    self.other_category
                ),
            )
        )

        self.assertIn(
            ad,
            smartphone_ads,
        )

        self.assertNotIn(
            ad,
            electric_ads,
        )

        ad.desktop_image.delete(
            save=False
        )

    def test_product_destination_link(self):
        ad = self.create_ad(
            destination_type=(
                Advertisement
                .DestinationType
                .PRODUCT
            ),
            destination_product=(
                self.product
            ),
            button_url="",
        )

        self.assertEqual(
            ad.effective_link,
            (
                "/produits/"
                "samsung-galaxy-a26"
            ),
        )

        ad.desktop_image.delete(
            save=False
        )

    def test_ad_image_is_webp(self):
        ad = self.create_ad()

        self.assertTrue(
            ad.desktop_image.name.endswith(
                ".webp"
            )
        )

        ad.desktop_image.delete(
            save=False
        )

    def test_ad_statistics(self):
        ad = self.create_ad()

        record_ad_impression(
            ad.pk
        )

        record_ad_impression(
            ad.pk
        )

        stat = record_ad_click(
            ad.pk
        )

        self.assertEqual(
            stat.impressions,
            2,
        )

        self.assertEqual(
            stat.clicks,
            1,
        )

        self.assertEqual(
            stat.ctr,
            Decimal("50.00"),
        )

        ad.desktop_image.delete(
            save=False
        )


class PartnerTests(
    PromotionBaseMixin,
    TestCase,
):
    def test_partner(self):
        image = (
            self.create_test_image(
                "partner.png"
            )
        )

        partner = Partner.objects.create(
            name="Samsung Mali",
            logo=image,
            website=(
                "https://example.com"
            ),
        )

        self.assertTrue(
            partner.is_active
        )

        self.assertEqual(
            partner.effective_link,
            "https://example.com",
        )

        self.assertTrue(
            partner.logo.name.endswith(
                ".webp"
            )
        )

        partner.logo.delete(
            save=False
        )