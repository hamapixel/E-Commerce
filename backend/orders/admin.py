from django.contrib import (
    admin,
    messages,
)

from .models import (
    Order,
    OrderItem,
    Payment,
)

from .services import (
    PaymentError,
    mark_payment_paid,
)


class OrderItemInline(
    admin.TabularInline
):
    model = OrderItem

    extra = 0

    can_delete = False

    fields = (
        "product_name",
        "sku",
        "variant_label",
        "unit_price",
        "quantity",
        "line_total",
    )

    readonly_fields = fields

    def has_add_permission(
        self,
        request,
        obj=None,
    ):
        return False


class PaymentInline(
    admin.TabularInline
):
    model = Payment

    extra = 0

    can_delete = False

    fields = (
        "reference",
        "method",
        "status",
        "amount",
        "paid_at",
        "created_at",
    )

    readonly_fields = fields

    def has_add_permission(
        self,
        request,
        obj=None,
    ):
        return False


@admin.register(Order)
class OrderAdmin(
    admin.ModelAdmin
):
    list_display = (
        "order_number",
        "customer_name",
        "customer_phone",
        "status",
        "delivery_method",
        "total",
        "created_at",
    )

    list_filter = (
        "status",
        "delivery_method",
        "created_at",
    )

    search_fields = (
        "order_number",
        "customer_name",
        "customer_phone",
        "customer_whatsapp",
        "customer_email",
    )

    readonly_fields = (
        "id",
        "order_number",
        "checkout_session",
        "status",
        "customer_name",
        "customer_phone",
        "customer_whatsapp",
        "customer_email",
        "delivery_method",
        "city",
        "delivery_zone",
        "address",
        "notes",
        "subtotal",
        "delivery_fee",
        "total",
        "created_at",
        "updated_at",
    )

    inlines = [
        OrderItemInline,
        PaymentInline,
    ]

    ordering = (
        "-created_at",
    )

    def has_add_permission(
        self,
        request,
    ):
        return False

    def has_delete_permission(
        self,
        request,
        obj=None,
    ):
        return False


@admin.register(OrderItem)
class OrderItemAdmin(
    admin.ModelAdmin
):
    list_display = (
        "product_name",
        "sku",
        "quantity",
        "unit_price",
        "line_total",
        "order",
    )

    search_fields = (
        "product_name",
        "sku",
        "order__order_number",
    )

    readonly_fields = (
        "order",
        "product",
        "variant",
        "inventory_item",
        "product_name",
        "sku",
        "variant_label",
        "normal_price",
        "unit_price",
        "quantity",
        "line_total",
        "created_at",
    )

    def has_add_permission(
        self,
        request,
    ):
        return False

    def has_change_permission(
        self,
        request,
        obj=None,
    ):
        return False

    def has_delete_permission(
        self,
        request,
        obj=None,
    ):
        return False


@admin.register(Payment)
class PaymentAdmin(
    admin.ModelAdmin
):
    list_display = (
        "reference",
        "order",
        "method",
        "status",
        "amount",
        "currency",
        "paid_at",
        "created_at",
    )

    list_filter = (
        "status",
        "method",
        "created_at",
    )

    search_fields = (
        "reference",
        "order__order_number",
        "order__customer_name",
        "order__customer_phone",
        "provider_reference",
        "transaction_id",
    )

    readonly_fields = (
        "id",
        "reference",
        "order",
        "method",
        "status",
        "amount",
        "currency",
        "provider",
        "provider_reference",
        "transaction_id",
        "provider_payload",
        "paid_at",
        "recorded_by",
        "created_at",
        "updated_at",
    )

    actions = [
        "mark_selected_as_paid",
    ]

    ordering = (
        "-created_at",
    )

    @admin.action(
        description=(
            "Marquer les paiements "
            "sélectionnés comme payés"
        )
    )
    def mark_selected_as_paid(
        self,
        request,
        queryset,
    ):
        success = 0

        for payment in queryset:
            try:
                mark_payment_paid(
                    payment.pk,
                    user=request.user,
                )

                success += 1

            except PaymentError as exc:
                self.message_user(
                    request,
                    str(exc),
                    level=messages.ERROR,
                )

        if success:
            self.message_user(
                request,
                (
                    f"{success} paiement(s) "
                    "marqué(s) comme payé(s)."
                ),
                level=messages.SUCCESS,
            )

    def has_add_permission(
        self,
        request,
    ):
        return False

    def has_delete_permission(
        self,
        request,
        obj=None,
    ):
        return False