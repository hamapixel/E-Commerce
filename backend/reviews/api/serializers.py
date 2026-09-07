from rest_framework import serializers

from reviews.models import ProductReview


class ProductReviewSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ProductReview
        fields = (
            "id",
            "customer_name",
            "rating",
            "comment",
            "created_at",
        )
        read_only_fields = (
            "id",
            "created_at",
        )

    def validate_customer_name(
        self,
        value,
    ):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Saisissez votre nom."
            )

        return value

    def validate_comment(
        self,
        value,
    ):
        value = value.strip()

        if len(value) < 5:
            raise serializers.ValidationError(
                "Votre avis est trop court."
            )

        return value
