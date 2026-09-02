from django.contrib import admin

from .models import (
    NotificationLog,
    PushSubscription,
)


@admin.register(
    PushSubscription
)
class PushSubscriptionAdmin(
    admin.ModelAdmin
):
    list_display = (
        "user",
        "is_active",
        "failure_count",
        "last_success_at",
        "updated_at",
    )

    list_filter = (
        "is_active",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "endpoint",
        "user_agent",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "last_success_at",
    )


@admin.register(
    NotificationLog
)
class NotificationLogAdmin(
    admin.ModelAdmin
):
    list_display = (
        "title",
        "kind",
        "status",
        "subscribers_count",
        "sent_count",
        "failed_count",
        "created_at",
    )

    list_filter = (
        "kind",
        "status",
        "created_at",
    )

    search_fields = (
        "title",
        "body",
    )

    readonly_fields = (
        "kind",
        "title",
        "body",
        "url",
        "data",
        "subscribers_count",
        "sent_count",
        "failed_count",
        "status",
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