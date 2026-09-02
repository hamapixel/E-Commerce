from django.utils import timezone
from rest_framework import serializers

from promotions.models import (
    Advertisement,
    Partner,
    Promotion,
)


class PromotionSerializer(
    serializers.ModelSerializer
):
    remaining_seconds = (
        serializers.IntegerField(
            read_only=True
        )
    )

    products = (
        serializers.SerializerMethodField()
    )

    target = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Promotion

        fields = (
            "id",
            "name",
            "slug",
            "campaign_type",
            "discount_type",
            "discount_value",
            "target_mode",
            "target",
            "products",
            "badge_text",
            "start_at",
            "end_at",
            "remaining_seconds",
            "priority",
        )

    def get_products(
        self,
        obj,
    ):
        if (
            obj.target_mode
            != Promotion
            .TargetMode
            .PRODUCTS
        ):
            return []

        return [
            {
                "id": product.pk,
                "name": product.name,
                "slug": product.slug,
            }
            for product
            in obj.products.all()
        ]

    def get_target(
        self,
        obj,
    ):
        if (
            obj.target_mode
            == Promotion.TargetMode.ALL
        ):
            return {
                "type": "ALL",
            }

        if (
            obj.target_mode
            == Promotion
            .TargetMode
            .CATEGORY
            and obj.target_category
        ):
            return {
                "type": "CATEGORY",
                "id": (
                    obj.target_category.pk
                ),
                "name": (
                    obj.target_category.name
                ),
                "slug": (
                    obj.target_category.slug
                ),
            }

        if (
            obj.target_mode
            == Promotion
            .TargetMode
            .BRAND
            and obj.target_brand
        ):
            return {
                "type": "BRAND",
                "id": (
                    obj.target_brand.pk
                ),
                "name": (
                    obj.target_brand.name
                ),
                "slug": (
                    obj.target_brand.slug
                ),
            }

        return {
            "type": "PRODUCTS",
        }


class AdvertisementSerializer(
    serializers.ModelSerializer
):
    effective_link = (
        serializers.CharField(
            read_only=True
        )
    )

    remaining_seconds = (
        serializers.SerializerMethodField()
    )

    promotion = (
        PromotionSerializer(
            read_only=True
        )
    )

    class Meta:
        model = Advertisement

        fields = (
            "id",
            "company_name",
            "company_logo",
            "title",
            "text",
            "desktop_image",
            "mobile_image",
            "button_text",
            "effective_link",
            "placement",
            "priority_level",
            "display_priority",
            "promotion",
            "display_old_price",
            "display_price",
            "start_at",
            "end_at",
            "remaining_seconds",
        )

    def get_remaining_seconds(
        self,
        obj,
    ):
        now = timezone.now()

        if not (
            obj.is_active
            and obj.start_at
            <= now
            < obj.end_at
        ):
            return 0

        return max(
            0,
            int(
                (
                    obj.end_at
                    - now
                ).total_seconds()
            ),
        )


class PartnerSerializer(
    serializers.ModelSerializer
):
    effective_link = (
        serializers.CharField(
            read_only=True
        )
    )

    class Meta:
        model = Partner

        fields = (
            "id",
            "name",
            "logo",
            "description",
            "effective_link",
            "display_order",
        )