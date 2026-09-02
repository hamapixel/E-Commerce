from django.contrib import admin

from .models import (
    Advertisement,
    AdvertisementDailyStat,
    Partner,
    Promotion,
)


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "campaign_type",
        "discount_type",
        "discount_value",
        "target_mode",
        "start_at",
        "end_at",
        "priority",
        "current_status",
        "is_active",
    )

    list_filter = (
        "campaign_type",
        "discount_type",
        "target_mode",
        "is_active",
    )

    search_fields = (
        "name",
        "slug",
        "badge_text",
    )

    filter_horizontal = (
        "products",
    )

    autocomplete_fields = (
        "target_category",
        "target_brand",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "current_status",
        "remaining_time",
    )

    @admin.display(
        description="État actuel"
    )
    def current_status(
        self,
        obj,
    ):
        if obj.is_current:
            return "ACTIVE"

        return "INACTIVE"

    @admin.display(
        description="Secondes restantes"
    )
    def remaining_time(
        self,
        obj,
    ):
        return obj.remaining_seconds


@admin.register(Advertisement)
class AdvertisementAdmin(
    admin.ModelAdmin
):
    list_display = (
        "company_name",
        "title",
        "placement",
        "priority_level",
        "display_priority",
        "start_at",
        "end_at",
        "current_status",
        "is_active",
    )

    list_filter = (
        "placement",
        "priority_level",
        "destination_type",
        "is_active",
    )

    search_fields = (
        "company_name",
        "title",
        "text",
    )

    autocomplete_fields = (
        "promotion",
        "destination_product",
        "destination_category",
        "destination_brand",
    )

    filter_horizontal = (
        "target_categories",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "current_status",
        "effective_destination",
    )

    @admin.display(
        description="État actuel"
    )
    def current_status(
        self,
        obj,
    ):
        if obj.is_current:
            return "ACTIVE"

        return "INACTIVE"

    @admin.display(
        description="Lien effectif"
    )
    def effective_destination(
        self,
        obj,
    ):
        return obj.effective_link


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "display_order",
        "is_active",
        "updated_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "description",
    )

    list_editable = (
        "display_order",
        "is_active",
    )


@admin.register(
    AdvertisementDailyStat
)
class AdvertisementDailyStatAdmin(
    admin.ModelAdmin
):
    list_display = (
        "advertisement",
        "date",
        "impressions",
        "clicks",
        "ctr_display",
        "orders_count",
        "attributed_revenue",
    )

    list_filter = (
        "date",
    )

    search_fields = (
        "advertisement__company_name",
        "advertisement__title",
    )

    readonly_fields = (
        "advertisement",
        "date",
        "impressions",
        "clicks",
        "ctr_display",
        "orders_count",
        "attributed_revenue",
    )

    @admin.display(
        description="CTR %"
    )
    def ctr_display(
        self,
        obj,
    ):
        return obj.ctr

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