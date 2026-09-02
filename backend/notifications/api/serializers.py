from rest_framework import (
    serializers,
)

from notifications.models import (
    NotificationLog,
)


class PushSubscriptionSerializer(
    serializers.Serializer
):
    endpoint = serializers.URLField(
        max_length=2048,
    )

    p256dh = serializers.CharField(
        max_length=1000,
    )

    auth = serializers.CharField(
        max_length=255,
    )

    user_agent = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000,
    )


class PushUnsubscribeSerializer(
    serializers.Serializer
):
    endpoint = serializers.URLField(
        max_length=2048,
    )


class NotificationLogSerializer(
    serializers.ModelSerializer
):
    kind_label = (
        serializers.CharField(
            source=(
                "get_kind_display"
            ),
            read_only=True,
        )
    )

    status_label = (
        serializers.CharField(
            source=(
                "get_status_display"
            ),
            read_only=True,
        )
    )

    class Meta:
        model = NotificationLog

        fields = (
            "id",
            "kind",
            "kind_label",
            "title",
            "body",
            "url",
            "data",
            "subscribers_count",
            "sent_count",
            "failed_count",
            "status",
            "status_label",
            "created_at",
        )