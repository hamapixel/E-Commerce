from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import (
    include,
    path,
)


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "api/v1/",
        include(
            "core.urls"
        ),
    ),

    path(
        "api/v1/catalog/",
        include(
            "catalog.api.urls"
        ),
    ),

    path(
        "api/v1/marketing/",
        include(
            "promotions.api.urls"
        ),
    ),

    path(
        "api/v1/checkout/",
        include(
            "checkout.api.urls"
        ),
    ),

    path(
        "api/v1/orders/",
        include(
            "orders.api.urls"
        ),
    ),

    path(
        "api/v1/owner/",
        include(
            "owner_console.api.urls"
        ),
    ),

    path(
        (
            "api/v1/owner/"
            "notifications/"
        ),
        include(
            "notifications.api.urls"
        ),
    ),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=(
            settings.MEDIA_ROOT
        ),
    )