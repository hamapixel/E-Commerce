from django.contrib import admin

from .models import ProductReview


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
