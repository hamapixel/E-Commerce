from django.contrib import admin

from .models import (
    OrderSatisfaction,
    ProductReview,
)


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "customer_name",
        "rating",
        "is_approved",
        "created_at",
    )

    list_filter = (
        "rating",
        "is_approved",
        "created_at",
    )

    search_fields = (
        "product__name",
        "customer_name",
        "comment",
    )

    list_editable = (
        "is_approved",
    )

    readonly_fields = (
        "created_at",
    )

    autocomplete_fields = (
        "product",
    )


@admin.register(OrderSatisfaction)
class OrderSatisfactionAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "rating",
        "experience",
        "problem_reason",
        "wants_contact",
        "created_at",
    )

    list_filter = (
        "rating",
        "experience",
        "problem_reason",
        "wants_contact",
        "created_at",
    )

    search_fields = (
        "order__order_number",
        "order__customer_name",
        "order__customer_phone",
        "comment",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    autocomplete_fields = (
        "order",
    )
