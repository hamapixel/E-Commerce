from rest_framework import serializers

from checkout.models import (
    CheckoutItem,
    CheckoutSession,
)


class CheckoutLineInputSerializer(
    serializers.Serializer
):
    product_id = (
        serializers.IntegerField(
            min_value=1
        )
    )

    variant_id = (
        serializers.IntegerField(
            min_value=1,
            required=False,
            allow_null=True,
        )
    )

    quantity = (
        serializers.IntegerField(
            min_value=1,
            max_value=99,
        )
    )


class CheckoutCreateSerializer(
    serializers.Serializer
):
    customer_name = (
        serializers.CharField(
            max_length=180
        )
    )

    customer_phone = (
        serializers.CharField(
            max_length=30
        )
    )

    customer_whatsapp = (
        serializers.CharField(
            max_length=30,
            required=False,
            allow_blank=True,
            default="",
        )
    )

    customer_email = (
        serializers.EmailField(
            required=False,
            allow_blank=True,
            default="",
        )
    )

    delivery_method = (
        serializers.ChoiceField(
            choices=(
                CheckoutSession
                .DeliveryMethod
                .choices
            ),
            default=(
                CheckoutSession
                .DeliveryMethod
                .DELIVERY
            ),
        )
    )

    city = serializers.CharField(
        max_length=120,
        required=False,
        allow_blank=True,
        default="Bamako",
    )

    delivery_zone = (
        serializers.CharField(
            max_length=180,
            required=False,
            allow_blank=True,
            default="",
        )
    )

    address = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    items = CheckoutLineInputSerializer(
        many=True
    )

    def validate_items(
        self,
        value,
    ):
        if not value:
            raise serializers.ValidationError(
                "Le panier est vide."
            )

        if len(value) > 50:
            raise serializers.ValidationError(
                (
                    "Le panier ne peut pas "
                    "dépasser 50 lignes."
                )
            )

        return value

    def validate(
        self,
        attrs,
    ):
        if (
            attrs[
                "delivery_method"
            ]
            == CheckoutSession
            .DeliveryMethod
            .DELIVERY
            and not attrs.get(
                "address",
                "",
            ).strip()
        ):
            raise serializers.ValidationError(
                {
                    "address": (
                        "L'adresse est obligatoire "
                        "pour une livraison."
                    )
                }
            )

        return attrs


class CheckoutItemSerializer(
    serializers.ModelSerializer
):
    product_id = (
        serializers.IntegerField(
            read_only=True
        )
    )

    variant_id = (
        serializers.IntegerField(
            read_only=True,
            allow_null=True,
        )
    )

    product_slug = (
        serializers.CharField(
            source="product.slug",
            read_only=True,
        )
    )

    class Meta:
        model = CheckoutItem

        fields = (
            "id",
            "product_id",
            "variant_id",
            "product_slug",
            "product_name",
            "sku",
            "variant_label",
            "normal_price",
            "unit_price",
            "quantity",
            "line_total",
        )


class CheckoutSessionSerializer(
    serializers.ModelSerializer
):
    items = CheckoutItemSerializer(
        many=True,
        read_only=True,
    )

    remaining_seconds = (
        serializers.IntegerField(
            read_only=True
        )
    )

    status_label = (
        serializers.SerializerMethodField()
    )

    delivery_method_label = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = CheckoutSession

        fields = (
            "id",
            "status",
            "status_label",
            "customer_name",
            "customer_phone",
            "customer_whatsapp",
            "customer_email",
            "delivery_method",
            "delivery_method_label",
            "city",
            "delivery_zone",
            "address",
            "notes",
            "subtotal",
            "delivery_fee",
            "total",
            "expires_at",
            "remaining_seconds",
            "created_at",
            "items",
        )

    def get_status_label(
        self,
        obj,
    ):
        return (
            obj.get_status_display()
        )

    def get_delivery_method_label(
        self,
        obj,
    ):
        return (
            obj
            .get_delivery_method_display()
        )