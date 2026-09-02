from django.contrib import admin

from .forms import InventoryItemAdminForm

from .models import (
    InventoryItem,
    StockMovement,
)

from .services import (
    add_stock,
    remove_stock,
)


@admin.register(InventoryItem)
class InventoryItemAdmin(
    admin.ModelAdmin
):
    form = InventoryItemAdminForm

    list_display = (
        "product",
        "variant",
        "physical_stock",
        "reserved_stock",
        "available_stock",
        "stock_status_display",
        "low_stock_threshold",
        "updated_at",
    )

    list_filter = (
        "product__category",
        "product__brand",
    )

    search_fields = (
        "product__name",
        "product__sku",
        "product__barcode",
        "variant__sku",
        "variant__barcode",
    )

    autocomplete_fields = (
        "product",
        "variant",
    )

    list_editable = (
        "low_stock_threshold",
    )

    readonly_fields = (
        "physical_stock",
        "reserved_stock",
        "available_stock",
        "stock_status_display",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Produit",
            {
                "fields": (
                    "product",
                    "variant",
                ),
            },
        ),

        (
            "État actuel du stock",
            {
                "fields": (
                    "physical_stock",
                    "reserved_stock",
                    "available_stock",
                    "stock_status_display",
                    "low_stock_threshold",
                ),
            },
        ),

        (
            "Mouvement de stock",
            {
                "description": (
                    "Utilisez cette zone pour ajouter "
                    "ou retirer du stock tout en conservant "
                    "l'historique des mouvements."
                ),

                "fields": (
                    "stock_adjustment",
                    "movement_reference",
                    "movement_note",
                ),
            },
        ),

        (
            "Informations système",
            {
                "classes": (
                    "collapse",
                ),

                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )

    @admin.display(
        description="Stock physique"
    )
    def physical_stock(
        self,
        obj,
    ):
        if not obj or not obj.pk:
            return 0

        return obj.quantity_on_hand

    @admin.display(
        description="Stock réservé"
    )
    def reserved_stock(
        self,
        obj,
    ):
        if not obj or not obj.pk:
            return 0

        return obj.quantity_reserved

    @admin.display(
        description="Disponible"
    )
    def available_stock(
        self,
        obj,
    ):
        if not obj or not obj.pk:
            return 0

        return obj.quantity_available

    @admin.display(
        description="État du stock"
    )
    def stock_status_display(
        self,
        obj,
    ):
        if not obj or not obj.pk:
            return "Nouveau"

        status = obj.stock_status

        labels = {
            InventoryItem.StockStatus.IN_STOCK:
                "En stock",

            InventoryItem.StockStatus.LOW_STOCK:
                "Stock faible",

            InventoryItem.StockStatus.OUT_OF_STOCK:
                "Rupture",
        }

        return labels.get(
            status,
            status,
        )

    def save_model(
        self,
        request,
        obj,
        form,
        change,
    ):
        """
        Sauvegarde d'abord la fiche InventoryItem,
        puis applique le mouvement demandé.

        Les services add_stock/remove_stock créent
        automatiquement l'historique StockMovement.
        """

        super().save_model(
            request,
            obj,
            form,
            change,
        )

        adjustment = (
            form.cleaned_data.get(
                "stock_adjustment"
            )
            or 0
        )

        reference = (
            form.cleaned_data.get(
                "movement_reference"
            )
            or ""
        ).strip()

        note = (
            form.cleaned_data.get(
                "movement_note"
            )
            or ""
        ).strip()

        if adjustment > 0:
            add_stock(
                obj.pk,
                adjustment,
                reference=reference,
                note=note,
                user=request.user,
            )

        elif adjustment < 0:
            remove_stock(
                obj.pk,
                abs(adjustment),
                reference=reference,
                note=note,
                user=request.user,
            )

        obj.refresh_from_db()


@admin.register(StockMovement)
class StockMovementAdmin(
    admin.ModelAdmin
):
    list_display = (
        "inventory_item",
        "movement_type",
        "quantity_delta",
        "reserved_delta",
        "quantity_after",
        "reserved_after",
        "reference",
        "created_by",
        "created_at",
    )

    list_filter = (
        "movement_type",
        "created_at",
    )

    search_fields = (
        "inventory_item__product__name",
        "inventory_item__product__sku",
        "inventory_item__variant__sku",
        "reference",
        "note",
    )

    readonly_fields = (
        "inventory_item",
        "movement_type",
        "quantity_delta",
        "reserved_delta",
        "quantity_after",
        "reserved_after",
        "reference",
        "note",
        "created_by",
        "created_at",
    )

    ordering = (
        "-created_at",
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