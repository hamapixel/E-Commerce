from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone
from PIL import Image
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from promotions.models import Advertisement


User = get_user_model()


@override_settings(
    STORAGES={
        "default": {
            "BACKEND": (
                "django.core.files.storage.InMemoryStorage"
            ),
        },
    },
)
class OwnerAdvertisementScheduleTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="AD_OWNER",
            email="ad-owner@sugukura.test",
            password="StrongPass123!",
            role=User.Role.OWNER,
        )

        token = Token.objects.create(
            user=self.owner
        )

        self.client = APIClient()
        self.client.credentials(
            HTTP_AUTHORIZATION=(
                f"Token {token.key}"
            )
        )

    def create_test_image(self):
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
            "schedule-test.png",
            buffer.getvalue(),
            content_type="image/png",
        )

    def create_future_ad(self):
        now = timezone.now()

        return Advertisement.objects.create(
            company_name="MSF SARL",
            title="Promo test",
            desktop_image=(
                self.create_test_image()
            ),
            button_text="Voir l'offre",
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
                + timezone.timedelta(
                    hours=1
                )
            ),
            end_at=(
                now
                + timezone.timedelta(
                    days=1
                )
            ),
            is_active=True,
        )

    def test_publish_now_makes_future_ad_public(self):
        advertisement = (
            self.create_future_ad()
        )

        response = self.client.post(
            (
                "/api/v1/owner/"
                f"advertisements/{advertisement.pk}/"
                "publish-now/"
            )
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        advertisement.refresh_from_db()

        self.assertTrue(
            advertisement.is_active
        )
        self.assertLessEqual(
            advertisement.start_at,
            timezone.now(),
        )

        public_client = APIClient()
        public_response = public_client.get(
            (
                "/api/v1/marketing/advertisements/"
                "?placement=HOME_HERO"
            )
        )

        self.assertEqual(
            public_response.status_code,
            200,
        )
        self.assertIn(
            advertisement.pk,
            [
                item["id"]
                for item
                in public_response.json()
            ],
        )

    def test_publish_now_rejects_expired_ad(self):
        advertisement = (
            self.create_future_ad()
        )

        now = timezone.now()
        Advertisement.objects.filter(
            pk=advertisement.pk
        ).update(
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

        response = self.client.post(
            (
                "/api/v1/owner/"
                f"advertisements/{advertisement.pk}/"
                "publish-now/"
            )
        )

        self.assertEqual(
            response.status_code,
            400,
        )
