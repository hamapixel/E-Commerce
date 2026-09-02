import base64

from cryptography.hazmat.primitives import (
    serialization,
)

from cryptography.hazmat.primitives.asymmetric import (
    ec,
)

from django.core.management.base import (
    BaseCommand,
)


def base64_url_encode(
    value: bytes,
) -> str:
    return (
        base64
        .urlsafe_b64encode(
            value
        )
        .rstrip(
            b"="
        )
        .decode(
            "ascii"
        )
    )


class Command(BaseCommand):
    help = (
        "Génère les clés VAPID "
        "pour les notifications Web Push."
    )

    def handle(
        self,
        *args,
        **options,
    ):
        private_key = (
            ec.generate_private_key(
                ec.SECP256R1()
            )
        )

        private_number = (
            private_key
            .private_numbers()
            .private_value
        )

        private_raw = (
            private_number
            .to_bytes(
                32,
                byteorder="big",
            )
        )

        public_raw = (
            private_key
            .public_key()
            .public_bytes(
                encoding=(
                    serialization
                    .Encoding
                    .X962
                ),
                format=(
                    serialization
                    .PublicFormat
                    .UncompressedPoint
                ),
            )
        )

        private_encoded = (
            base64_url_encode(
                private_raw
            )
        )

        public_encoded = (
            base64_url_encode(
                public_raw
            )
        )

        self.stdout.write(
            ""
        )

        self.stdout.write(
            self.style.SUCCESS(
                "=== CLÉS VAPID SUGU KURA ==="
            )
        )

        self.stdout.write(
            ""
        )

        self.stdout.write(
            (
                "WEBPUSH_VAPID_PUBLIC_KEY="
                f"{public_encoded}"
            )
        )

        self.stdout.write(
            ""
        )

        self.stdout.write(
            (
                "WEBPUSH_VAPID_PRIVATE_KEY="
                f"{private_encoded}"
            )
        )

        self.stdout.write(
            ""
        )

        self.stdout.write(
            (
                "WEBPUSH_VAPID_SUBJECT="
                "mailto:admin@example.com"
            )
        )

        self.stdout.write(
            ""
        )

        self.stdout.write(
            self.style.WARNING(
                "IMPORTANT : garde la clé privée secrète."
            )
        )