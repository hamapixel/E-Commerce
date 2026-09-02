from rest_framework import serializers

from promotions.models import (
    Advertisement,
)


class OwnerLoginSerializer(
    serializers.Serializer
):
    username = serializers.CharField(
        max_length=150
    )

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )


class AdvertisementOwnerSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Advertisement

        fields = "__all__"

        read_only_fields = (
            "id",
        )