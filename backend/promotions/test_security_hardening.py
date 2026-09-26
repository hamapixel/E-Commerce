from io import BytesIO

from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone
from PIL import Image
from rest_framework.test import APIClient

from .image_utils import optimize_ad_image
from .models import Advertisement


def make_image(
    name="advertisement.png",
):
    buffer = BytesIO()
    image = Image.new(
        "RGB",
        (1200, 600),
        "white",
    )
    image.save(
        buffer,
        format="PNG",
    )
    image.close()

    return SimpleUploadedFile(
        name,
        buffer.getvalue(),
        content_type="image/png",
    )


class AdvertisementImageFilenameTests(TestCase):
    def test_very_long_original_filename_is_safely_shortened(self):
        uploaded = make_image(
            f"{'promotion-super-longue-' * 12}.png"
        )

        optimized = optimize_ad_image(
            uploaded,
            max_width=2400,
            max_height=1400,
        )

        stored_path = (
            "advertising/desktop/"
            f"{optimized.name}"
        )

        self.assertLessEqual(
            len(stored_path),
            100,
        )
        self.assertTrue(
            optimized.name.endswith(
                ".webp"
            )
        )


@override_settings(
    STORAGES={
        "default": {
            "BACKEND": (
                "django.core.files.storage.InMemoryStorage"
            ),
        },
    },
    ADVERTISEMENT_EVENT_THROTTLE_RATE="2/minute",
)
class AdvertisementEventThrottleTests(TestCase):
    def setUp(self):
        cache.clear()

        now = timezone.now()

        self.advertisement = (
            Advertisement.objects.create(
                company_name="MSF SARL",
                title="Promo sécurité",
                desktop_image=make_image(),
                button_text="Voir",
                button_url="/",
                placement=(
                    Advertisement
                    .Placement
                    .HOME_HERO
                ),
                destination_type=(
                    Advertisement
                    .DestinationType
                    .CUSTOM
                ),
                start_at=(
                    now
                    - timezone.timedelta(
                        minutes=1
                    )
                ),
                end_at=(
                    now
                    + timezone.timedelta(
                        hours=1
                    )
                ),
                is_active=True,
            )
        )

        self.client = APIClient()

    def test_impression_endpoint_is_rate_limited(self):
        url = (
            "/api/v1/marketing/advertisements/"
            f"{self.advertisement.pk}/impression/"
        )

        first = self.client.post(url)
        second = self.client.post(url)
        third = self.client.post(url)

        self.assertEqual(
            first.status_code,
            200,
        )
        self.assertEqual(
            second.status_code,
            200,
        )
        self.assertEqual(
            third.status_code,
            429,
        )
