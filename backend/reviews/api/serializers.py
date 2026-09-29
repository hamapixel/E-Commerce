from rest_framework import serializers

from reviews.models import (
    OrderSatisfaction,
    ProductReview,
)


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


class OrderSatisfactionSerializer(
    serializers.ModelSerializer
):
    ALLOWED_TAGS = (
        "DELIVERY_FAST",
        "PRODUCT_AS_EXPECTED",
        "PACKAGING",
        "SERVICE",
        "EASY_ORDER",
        "GOOD_VALUE",
    )

    tags = serializers.ListField(
        child=serializers.ChoiceField(
            choices=ALLOWED_TAGS,
        ),
        required=False,
        allow_empty=True,
    )

    class Meta:
        model = OrderSatisfaction
        fields = (
            "id",
            "rating",
            "experience",
            "tags",
            "comment",
            "problem_reason",
            "wants_contact",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )

    def validate_comment(
        self,
        value,
    ):
        return value.strip()

    def validate_tags(
        self,
        value,
    ):
        return list(dict.fromkeys(value))

    def validate(self, attrs):
        experience = attrs.get(
            "experience",
            getattr(
                self.instance,
                "experience",
                OrderSatisfaction.Experience.OK,
            ),
        )

        problem_reason = attrs.get(
            "problem_reason",
            getattr(
                self.instance,
                "problem_reason",
                "",
            ),
        )

        if (
            experience
            == OrderSatisfaction.Experience.PROBLEM
            and not problem_reason
        ):
            raise serializers.ValidationError(
                {
                    "problem_reason": (
                        "Choisissez le problème rencontré."
                    )
                }
            )

        if (
            experience
            != OrderSatisfaction.Experience.PROBLEM
        ):
            attrs["problem_reason"] = ""
            attrs["wants_contact"] = False

        return attrs
