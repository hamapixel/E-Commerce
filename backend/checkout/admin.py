from django.contrib import admin

from .models import (
    CheckoutItem,
    CheckoutSession,
)


class CheckoutItemInline(
    admin.TabularInline
):
    model = CheckoutItem

    extra = 0

    can_delete = False

    fields = (
        "product_name",
        "sku",
        "variant_label",
        "normal_price",
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


@admin.register(
    CheckoutSession
)
class CheckoutSessionAdmin(
    admin.ModelAdmin
):
    list_display = (
        "id",
        "customer_name",
        "customer_phone",
        "delivery_method",
        "status",
        "subtotal",
        "total",
        "expires_at",
        "created_at",
    )

    list_filter = (
        "status",
        "delivery_method",
        "created_at",
    )

    search_fields = (
        "customer_name",
        "customer_phone",
        "customer_whatsapp",
        "customer_email",
        "id",
    )

    readonly_fields = (
        "id",
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
        "expires_at",
        "created_at",
        "updated_at",
    )

    inlines = [
        CheckoutItemInline
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


@admin.register(
    CheckoutItem
)
class CheckoutItemAdmin(
    admin.ModelAdmin
):
    list_display = (
        "product_name",
        "sku",
        "quantity",
        "unit_price",
        "line_total",
        "session",
    )

    search_fields = (
        "product_name",
        "sku",
        "session__customer_name",
        "session__customer_phone",
    )

    readonly_fields = (
        "session",
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