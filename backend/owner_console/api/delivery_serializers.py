from rest_framework import serializers

from checkout.models import (
    DeliveryZone,
)


class OwnerDeliveryZoneSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = DeliveryZone

        fields = (
            "id",
            "name",
            "city",
            "fee",
            "estimated_delivery",
            "display_order",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def validate_name(
        self,
        value,
    ):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Le nom de la zone est obligatoire."
            )

        return value

    def validate_city(
        self,
        value,
    ):
        return (
            value.strip()
            or "Bamako"
        )
