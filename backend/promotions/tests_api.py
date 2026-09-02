from decimal import Decimal
from io import BytesIO

from django.core.files.uploadedfile import (
    SimpleUploadedFile,
)
from django.test import TestCase
from django.utils import timezone

from PIL import Image

from rest_framework.test import (
    APIClient,
)

from catalog.models import (
    Brand,
    Category,
    Product,
)

from promotions.models import (
    Advertisement,
    Partner,
    Promotion,
)


class MarketingAPITests(
    TestCase
):
    def setUp(self):
        self.client = APIClient()

        self.category = (
            Category.objects.create(
                name="Smartphones"
            )
        )

        self.brand = (
            Brand.objects.create(
                name="Samsung"
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

    def image(
        self,
        name,
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

    def active_period(self):
        now = timezone.now()

        return (
            now
            - timezone.timedelta(
                hours=1
            ),
            now
            + timezone.timedelta(
                hours=2
            ),
        )

    def create_ad(self):
        start, end = (
            self.active_period()
        )

        return (
            Advertisement.objects.create(
                company_name="Samsung",
                title="Offres Samsung",
                desktop_image=self.image(
                    "samsung.png"
                ),
                button_text=(
                    "Voir les produits"
                ),
                destination_type=(
                    Advertisement
                    .DestinationType
                    .PRODUCT
                ),
                destination_product=(
                    self.product
                ),
                placement=(
                    Advertisement
                    .Placement
                    .HOME_HERO
                ),
                start_at=start,
                end_at=end,
            )
        )

    def test_active_promotions_api(
        self
    ):
        start, end = (
            self.active_period()
        )

        Promotion.objects.create(
            name="Promo Samsung",
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
                .BRAND
            ),
            target_brand=self.brand,
            start_at=start,
            end_at=end,
        )

        response = self.client.get(
            (
                "/api/v1/marketing/"
                "promotions/"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

    def test_active_advertisements_api(
        self
    ):
        ad = self.create_ad()

        response = self.client.get(
            (
                "/api/v1/marketing/"
                "advertisements/"
            ),
            {
                "placement": (
                    Advertisement
                    .Placement
                    .HOME_HERO
                )
            },
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        ad.desktop_image.delete(
            save=False
        )

    def test_ad_impression_endpoint(
        self
    ):
        ad = self.create_ad()

        response = self.client.post(
            (
                "/api/v1/marketing/"
                f"advertisements/{ad.pk}/"
                "impression/"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data[
                "impressions"
            ],
            1,
        )

        ad.desktop_image.delete(
            save=False
        )

    def test_ad_click_endpoint(
        self
    ):
        ad = self.create_ad()

        response = self.client.post(
            (
                "/api/v1/marketing/"
                f"advertisements/{ad.pk}/"
                "click/"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response.data["clicks"],
            1,
        )

        self.assertEqual(
            response.data[
                "redirect_url"
            ],
            (
                "/produits/"
                "samsung-galaxy-a26"
            ),
        )

        ad.desktop_image.delete(
            save=False
        )

    def test_partner_api(
        self
    ):
        partner = Partner.objects.create(
            name="Samsung Mali",
            logo=self.image(
                "partner.png"
            ),
            website=(
                "https://example.com"
            ),
        )

        response = self.client.get(
            (
                "/api/v1/marketing/"
                "partners/"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        partner.logo.delete(
            save=False
        )