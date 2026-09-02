from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

from promotions.models import (
    Advertisement,
)


class OwnerAdvertisementSerializer(
    serializers.ModelSerializer
):
    placement_label = (
        serializers.CharField(
            source="get_placement_display",
            read_only=True,
        )
    )

    priority_label = (
        serializers.CharField(
            source="get_priority_level_display",
            read_only=True,
        )
    )

    destination_label = (
        serializers.CharField(
            source="get_destination_type_display",
            read_only=True,
        )
    )

    effective_link = (
        serializers.CharField(
            read_only=True,
        )
    )

    is_current = (
        serializers.SerializerMethodField()
    )

    has_expired = (
        serializers.SerializerMethodField()
    )

    stats = (
        serializers.SerializerMethodField()
    )

    clear_target_categories = (
        serializers.BooleanField(
            write_only=True,
            required=False,
            default=False,
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
            "button_url",
            "whatsapp",
            "website",
            "placement",
            "placement_label",
            "target_categories",
            "priority_level",
            "priority_label",
            "display_priority",
            "promotion",
            "display_old_price",
            "display_price",
            "destination_type",
            "destination_label",
            "destination_product",
            "destination_category",
            "destination_brand",
            "start_at",
            "end_at",
            "is_active",
            "hide_after_expiry",
            "effective_link",
            "is_current",
            "has_expired",
            "stats",
            "clear_target_categories",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "placement_label",
            "priority_label",
            "destination_label",
            "effective_link",
            "is_current",
            "has_expired",
            "stats",
            "created_at",
            "updated_at",
        )

        extra_kwargs = {
            "company_logo": {
                "required": False,
                "allow_null": True,
            },
            "mobile_image": {
                "required": False,
                "allow_null": True,
            },
            "promotion": {
                "required": False,
                "allow_null": True,
            },
            "destination_product": {
                "required": False,
                "allow_null": True,
            },
            "destination_category": {
                "required": False,
                "allow_null": True,
            },
            "destination_brand": {
                "required": False,
                "allow_null": True,
            },
            "target_categories": {
                "required": False,
            },
        }

    def get_is_current(
        self,
        obj,
    ):
        return obj.is_current

    def get_has_expired(
        self,
        obj,
    ):
        return (
            obj.end_at
            <= timezone.now()
        )

    def get_stats(
        self,
        obj,
    ):
        result = (
            obj.daily_stats
            .aggregate(
                impressions=Sum(
                    "impressions"
                ),
                clicks=Sum(
                    "clicks"
                ),
                orders=Sum(
                    "orders_count"
                ),
                revenue=Sum(
                    "attributed_revenue"
                ),
            )
        )

        impressions = (
            result.get(
                "impressions"
            )
            or 0
        )

        clicks = (
            result.get(
                "clicks"
            )
            or 0
        )

        ctr = (
            round(
                (
                    float(clicks)
                    / float(impressions)
                )
                * 100,
                2,
            )
            if impressions
            else 0
        )

        return {
            "impressions":
                impressions,
            "clicks":
                clicks,
            "ctr":
                ctr,
            "orders":
                result.get(
                    "orders"
                )
                or 0,
            "revenue":
                str(
                    result.get(
                        "revenue"
                    )
                    or "0.00"
                ),
        }

    def _resolved(
        self,
        attrs,
        field_name,
        default=None,
    ):
        if field_name in attrs:
            return attrs[
                field_name
            ]

        if self.instance is not None:
            return getattr(
                self.instance,
                field_name,
                default,
            )

        return default

    def validate(
        self,
        attrs,
    ):
        start_at = (
            self._resolved(
                attrs,
                "start_at",
            )
        )

        end_at = (
            self._resolved(
                attrs,
                "end_at",
            )
        )

        if (
            start_at
            and end_at
            and end_at <= start_at
        ):
            raise serializers.ValidationError(
                {
                    "end_at": (
                        "La date de fin doit être "
                        "postérieure à la date de début."
                    )
                }
            )

        old_price = (
            self._resolved(
                attrs,
                "display_old_price",
            )
        )

        price = (
            self._resolved(
                attrs,
                "display_price",
            )
        )

        if (
            old_price is not None
            and price is not None
            and price > old_price
        ):
            raise serializers.ValidationError(
                {
                    "display_price": (
                        "Le prix affiché ne peut pas "
                        "dépasser l'ancien prix."
                    )
                }
            )

        destination_type = (
            self._resolved(
                attrs,
                "destination_type",
                Advertisement
                .DestinationType
                .CUSTOM,
            )
        )

        if (
            destination_type
            == Advertisement
            .DestinationType
            .PRODUCT
        ):
            if not self._resolved(
                attrs,
                "destination_product",
            ):
                raise serializers.ValidationError(
                    {
                        "destination_product": (
                            "Choisissez le produit "
                            "de destination."
                        )
                    }
                )

            attrs[
                "destination_category"
            ] = None

            attrs[
                "destination_brand"
            ] = None

        elif (
            destination_type
            == Advertisement
            .DestinationType
            .CATEGORY
        ):
            if not self._resolved(
                attrs,
                "destination_category",
            ):
                raise serializers.ValidationError(
                    {
                        "destination_category": (
                            "Choisissez la catégorie "
                            "de destination."
                        )
                    }
                )

            attrs[
                "destination_product"
            ] = None

            attrs[
                "destination_brand"
            ] = None

        elif (
            destination_type
            == Advertisement
            .DestinationType
            .BRAND
        ):
            if not self._resolved(
                attrs,
                "destination_brand",
            ):
                raise serializers.ValidationError(
                    {
                        "destination_brand": (
                            "Choisissez la marque "
                            "de destination."
                        )
                    }
                )

            attrs[
                "destination_product"
            ] = None

            attrs[
                "destination_category"
            ] = None

        elif (
            destination_type
            == Advertisement
            .DestinationType
            .WHATSAPP
        ):
            if not str(
                self._resolved(
                    attrs,
                    "whatsapp",
                    "",
                )
                or ""
            ).strip():
                raise serializers.ValidationError(
                    {
                        "whatsapp": (
                            "Le numéro WhatsApp "
                            "est obligatoire."
                        )
                    }
                )

            attrs[
                "destination_product"
            ] = None

            attrs[
                "destination_category"
            ] = None

            attrs[
                "destination_brand"
            ] = None

        elif (
            destination_type
            == Advertisement
            .DestinationType
            .WEBSITE
        ):
            if not str(
                self._resolved(
                    attrs,
                    "website",
                    "",
                )
                or ""
            ).strip():
                raise serializers.ValidationError(
                    {
                        "website": (
                            "Le site web est obligatoire."
                        )
                    }
                )

            attrs[
                "destination_product"
            ] = None

            attrs[
                "destination_category"
            ] = None

            attrs[
                "destination_brand"
            ] = None

        else:
            if not str(
                self._resolved(
                    attrs,
                    "button_url",
                    "",
                )
                or ""
            ).strip():
                raise serializers.ValidationError(
                    {
                        "button_url": (
                            "Le lien de destination "
                            "est obligatoire."
                        )
                    }
                )

            attrs[
                "destination_product"
            ] = None

            attrs[
                "destination_category"
            ] = None

            attrs[
                "destination_brand"
            ] = None

        return attrs

    def create(
        self,
        validated_data,
    ):
        clear_categories = (
            validated_data.pop(
                "clear_target_categories",
                False,
            )
        )

        instance = super().create(
            validated_data
        )

        if clear_categories:
            instance.target_categories.clear()

        return instance

    def update(
        self,
        instance,
        validated_data,
    ):
        clear_categories = (
            validated_data.pop(
                "clear_target_categories",
                False,
            )
        )

        instance = super().update(
            instance,
            validated_data,
        )

        if clear_categories:
            instance.target_categories.clear()

        return instance
