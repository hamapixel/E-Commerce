from rest_framework import serializers

from orders.models import (
    Order,
    OrderItem,
    Payment,
)


class OrderCreateSerializer(
    serializers.Serializer
):
    checkout_id = (
        serializers.UUIDField()
    )

    payment_method = (
        serializers.ChoiceField(
            choices=(
                Payment.Method.choices
            )
        )
    )


class OrderItemSerializer(
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
        model = OrderItem

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


class PaymentSerializer(
    serializers.ModelSerializer
):
    method_label = (
        serializers.SerializerMethodField()
    )

    status_label = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Payment

        fields = (
            "id",
            "reference",
            "method",
            "method_label",
            "status",
            "status_label",
            "amount",
            "currency",
            "provider",
            "provider_reference",
            "transaction_id",
            "paid_at",
            "created_at",
        )

    def get_method_label(
        self,
        obj,
    ):
        return (
            obj.get_method_display()
        )

    def get_status_label(
        self,
        obj,
    ):
        return (
            obj.get_status_display()
        )


class OrderSerializer(
    serializers.ModelSerializer
):
    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    payments = PaymentSerializer(
        many=True,
        read_only=True,
    )

    status_label = (
        serializers.SerializerMethodField()
    )

    delivery_method_label = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Order

        fields = (
            "id",
            "order_number",
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
            "created_at",
            "updated_at",
            "items",
            "payments",
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
            obj.get_delivery_method_display()
        )