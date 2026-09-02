from django.conf import settings
from django.db import models


class PushSubscription(
    models.Model
):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name=(
            "push_subscriptions"
        ),
    )

    endpoint = models.URLField(
        max_length=2048,
        unique=True,
    )

    p256dh = models.TextField()

    auth = models.CharField(
        max_length=255,
    )

    user_agent = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
        db_index=True,
    )

    failure_count = (
        models.PositiveIntegerField(
            default=0,
        )
    )

    last_success_at = (
        models.DateTimeField(
            null=True,
            blank=True,
        )
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "-updated_at",
        ]

        indexes = [
            models.Index(
                fields=[
                    "user",
                    "is_active",
                ],
                name=(
                    "push_user_active_idx"
                ),
            ),
        ]

        verbose_name = (
            "Abonnement Push"
        )

        verbose_name_plural = (
            "Abonnements Push"
        )

    def __str__(self):
        status = (
            "actif"
            if self.is_active
            else "inactif"
        )

        return (
            f"{self.user} — "
            f"{status}"
        )

    @property
    def subscription_info(self):
        return {
            "endpoint": (
                self.endpoint
            ),

            "keys": {
                "p256dh": (
                    self.p256dh
                ),

                "auth": (
                    self.auth
                ),
            },
        }


class NotificationLog(
    models.Model
):
    class Kind(
        models.TextChoices
    ):
        ORDER = (
            "ORDER",
            "Commande",
        )

        PAYMENT = (
            "PAYMENT",
            "Paiement",
        )

        STOCK = (
            "STOCK",
            "Stock",
        )

        TEST = (
            "TEST",
            "Test",
        )

        SYSTEM = (
            "SYSTEM",
            "Système",
        )

    class Status(
        models.TextChoices
    ):
        SENT = (
            "SENT",
            "Envoyée",
        )

        PARTIAL = (
            "PARTIAL",
            "Partielle",
        )

        FAILED = (
            "FAILED",
            "Échec",
        )

        NO_SUBSCRIBER = (
            "NO_SUBSCRIBER",
            "Aucun appareil",
        )

    kind = models.CharField(
        max_length=20,
        choices=Kind.choices,
        default=Kind.SYSTEM,
        db_index=True,
    )

    title = models.CharField(
        max_length=200,
    )

    body = models.TextField()

    url = models.CharField(
        max_length=500,
        default="/",
        blank=True,
    )

    data = models.JSONField(
        default=dict,
        blank=True,
    )

    subscribers_count = (
        models.PositiveIntegerField(
            default=0,
        )
    )

    sent_count = (
        models.PositiveIntegerField(
            default=0,
        )
    )

    failed_count = (
        models.PositiveIntegerField(
            default=0,
        )
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.NO_SUBSCRIBER,
        db_index=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        ordering = [
            "-created_at",
        ]

        verbose_name = (
            "Historique notification"
        )

        verbose_name_plural = (
            "Historique notifications"
        )

    def __str__(self):
        return (
            f"{self.title} — "
            f"{self.get_status_display()}"
        )