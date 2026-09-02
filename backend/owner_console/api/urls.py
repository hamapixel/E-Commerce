from django.urls import (
    path,
)

from rest_framework.routers import (
    DefaultRouter,
)

from .catalog_views import (
    OwnerBrandViewSet,
    OwnerCategoryViewSet,
    OwnerProductImageViewSet,
    OwnerProductViewSet,
    owner_catalog_metadata,
)

from .inventory_views import (
    inventory_item_action,
    inventory_items,
)

from .advertisement_views import (
    OwnerAdvertisementViewSet,
)

from .views import (
    OwnerOrderViewSet,
    OwnerPaymentViewSet,
    dashboard_summary,
    inventory_alerts,
    marketing_summary,
    owner_login,
    owner_logout,
    owner_me,
)
from .variant_views import (
    OwnerProductVariantViewSet,
)


# ============================================================
# ROUTER DRF
# ============================================================

router = DefaultRouter()


# ============================================================
# COMMANDES
# ============================================================

router.register(
    r"orders",
    OwnerOrderViewSet,
    basename="owner-order",
)

router.register(
    r"catalog/variants",
    OwnerProductVariantViewSet,
    basename="owner-catalog-variants",
)


# ============================================================
# PAIEMENTS
# ============================================================

router.register(
    r"payments",
    OwnerPaymentViewSet,
    basename="owner-payment",
)


# ============================================================
# PUBLICITÉS
# ============================================================

router.register(
    r"advertisements",
    OwnerAdvertisementViewSet,
    basename="owner-advertisement",
)


# ============================================================
# CATÉGORIES
# ============================================================

router.register(
    r"catalog/categories",
    OwnerCategoryViewSet,
    basename="owner-category",
)


# ============================================================
# MARQUES
# ============================================================

router.register(
    r"catalog/brands",
    OwnerBrandViewSet,
    basename="owner-brand",
)


# ============================================================
# PRODUITS
# ============================================================

router.register(
    r"catalog/products",
    OwnerProductViewSet,
    basename="owner-product",
)


# ============================================================
# IMAGES PRODUITS
# ============================================================

router.register(
    r"catalog/product-images",
    OwnerProductImageViewSet,
    basename="owner-product-image",
)


# ============================================================
# ROUTES CLASSIQUES
# ============================================================

urlpatterns = [

    # ========================================================
    # AUTHENTIFICATION
    # ========================================================

    path(
        "auth/login/",
        owner_login,
        name="owner-login",
    ),

    path(
        "auth/logout/",
        owner_logout,
        name="owner-logout",
    ),

    path(
        "auth/me/",
        owner_me,
        name="owner-me",
    ),


    # ========================================================
    # DASHBOARD
    # ========================================================

    path(
        "dashboard/",
        dashboard_summary,
        name="owner-dashboard",
    ),


    # ========================================================
    # STOCK - LISTE COMPLÈTE
    # ========================================================

    path(
        "inventory/",
        inventory_items,
        name="owner-inventory-list",
    ),


    # ========================================================
    # STOCK - ACTIONS
    # ========================================================

    path(
        "inventory/<int:item_id>/action/",
        inventory_item_action,
        name="owner-inventory-action",
    ),


    # ========================================================
    # ALERTES STOCK
    # ========================================================

    path(
        "inventory-alerts/",
        inventory_alerts,
        name="owner-inventory-alerts",
    ),


    # ========================================================
    # MARKETING
    # ========================================================

    path(
        "marketing/summary/",
        marketing_summary,
        name="owner-marketing-summary",
    ),


    # ========================================================
    # MÉTADONNÉES CATALOGUE
    # ========================================================

    path(
        "catalog/metadata/",
        owner_catalog_metadata,
        name="owner-catalog-metadata",
    ),
]


# ============================================================
# ROUTES DES VIEWSETS DRF
# ============================================================

urlpatterns += router.urls
