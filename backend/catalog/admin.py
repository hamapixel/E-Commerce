from django.contrib import admin

from .models import (
    Attribute,
    AttributeValue,
    Brand,
    Category,
    Product,
    ProductAttribute,
    ProductImage,
    ProductVariant,
    VariantAttributeSelection,
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage

    extra = 0

    fields = (
        "image",
        "alt_text",
        "is_primary",
        "display_order",
    )


class ProductAttributeInline(admin.TabularInline):
    model = ProductAttribute

    extra = 0

    fields = (
        "attribute",
        "is_required",
        "is_variant_axis",
        "display_order",
    )


class AttributeValueInline(admin.TabularInline):
    model = AttributeValue

    extra = 0

    fields = (
        "value",
        "display_value",
        "color_hex",
        "display_order",
        "is_active",
    )


class VariantAttributeSelectionInline(
    admin.TabularInline
):
    model = VariantAttributeSelection

    extra = 0

    autocomplete_fields = (
        "attribute_value",
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "parent",
        "display_order",
        "is_active",
        "is_featured_home",
        "updated_at",
    )

    list_filter = (
        "is_active",
        "is_featured_home",
        "parent",
    )

    search_fields = (
        "name",
        "slug",
        "description",
    )

    ordering = (
        "display_order",
        "name",
    )

    list_editable = (
        "display_order",
        "is_active",
        "is_featured_home",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "display_order",
        "is_active",
        "is_featured",
        "updated_at",
    )

    list_filter = (
        "is_active",
        "is_featured",
    )

    search_fields = (
        "name",
        "slug",
        "description",
    )

    ordering = (
        "display_order",
        "name",
    )

    list_editable = (
        "display_order",
        "is_active",
        "is_featured",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "sku",
        "category",
        "brand",
        "base_price",
        "status",
        "is_featured",
        "updated_at",
    )

    list_filter = (
        "status",
        "is_featured",
        "category",
        "brand",
    )

    search_fields = (
        "name",
        "sku",
        "barcode",
        "slug",
        "short_description",
    )

    autocomplete_fields = (
        "category",
        "brand",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    list_select_related = (
        "category",
        "brand",
    )

    inlines = (
        ProductImageInline,
        ProductAttributeInline,
    )

    fieldsets = (
        (
            "Produit",
            {
                "fields": (
                    "name",
                    "slug",
                    "sku",
                    "barcode",
                    "category",
                    "brand",
                    "status",
                )
            },
        ),
        (
            "Description",
            {
                "fields": (
                    "short_description",
                    "description",
                )
            },
        ),
        (
            "Prix",
            {
                "fields": (
                    "base_price",
                    "purchase_price",
                )
            },
        ),
        (
            "Présentation",
            {
                "fields": (
                    "is_featured",
                )
            },
        ),
        (
            "SEO",
            {
                "fields": (
                    "seo_title",
                    "seo_description",
                )
            },
        ),
        (
            "Historique",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


@admin.register(Attribute)
class AttributeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "data_type",
        "display_order",
        "is_active",
    )

    list_filter = (
        "data_type",
        "is_active",
    )

    search_fields = (
        "name",
        "slug",
    )

    inlines = (
        AttributeValueInline,
    )


@admin.register(AttributeValue)
class AttributeValueAdmin(admin.ModelAdmin):
    list_display = (
        "attribute",
        "display_value",
        "color_hex",
        "display_order",
        "is_active",
    )

    list_filter = (
        "attribute",
        "is_active",
    )

    search_fields = (
        "value",
        "display_value",
        "attribute__name",
    )

    autocomplete_fields = (
        "attribute",
    )


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = (
        "sku",
        "product",
        "effective_price",
        "is_active",
        "updated_at",
    )

    list_filter = (
        "is_active",
        "product__category",
        "product__brand",
    )

    search_fields = (
        "sku",
        "barcode",
        "product__name",
    )

    autocomplete_fields = (
        "product",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    inlines = (
        VariantAttributeSelectionInline,
    )


@admin.register(ProductAttribute)
class ProductAttributeAdmin(
    admin.ModelAdmin
):
    list_display = (
        "product",
        "attribute",
        "is_required",
        "is_variant_axis",
        "display_order",
    )

    list_filter = (
        "is_required",
        "is_variant_axis",
    )

    search_fields = (
        "product__name",
        "attribute__name",
    )

    autocomplete_fields = (
        "product",
        "attribute",
    )