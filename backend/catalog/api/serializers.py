from decimal import Decimal

from rest_framework import serializers

from catalog.models import (
    Attribute,
    AttributeValue,
    Brand,
    Category,
    Product,
    ProductAttribute,
    ProductImage,
    ProductVariant,
)

from promotions.models import Promotion
from promotions.services import (
    calculate_promotional_price,
)


class CategoryMiniSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Category

        fields = (
            "id",
            "name",
            "slug",
        )


class CategorySerializer(
    serializers.ModelSerializer
):
    parent = CategoryMiniSerializer(
        read_only=True
    )

    subcategories = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Category

        fields = (
            "id",
            "name",
            "slug",
            "description",
            "parent",
            "image",
            "icon",
            "display_order",
            "is_featured_home",
            "seo_title",
            "seo_description",
            "subcategories",
        )

    def get_subcategories(
        self,
        obj,
    ):
        children = obj.subcategories.filter(
            is_active=True
        ).order_by(
            "display_order",
            "name",
        )

        return CategoryMiniSerializer(
            children,
            many=True,
            context=self.context,
        ).data


class BrandMiniSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Brand

        fields = (
            "id",
            "name",
            "slug",
            "logo",
        )


class BrandSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Brand

        fields = (
            "id",
            "name",
            "slug",
            "logo",
            "description",
            "website",
            "is_featured",
            "seo_title",
            "seo_description",
        )


class ProductImageSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ProductImage

        fields = (
            "id",
            "image",
            "alt_text",
            "is_primary",
            "display_order",
        )


class AttributeValueSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = AttributeValue

        fields = (
            "id",
            "value",
            "display_value",
            "color_hex",
            "display_order",
        )


class AttributeSerializer(
    serializers.ModelSerializer
):
    values = AttributeValueSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Attribute

        fields = (
            "id",
            "name",
            "slug",
            "data_type",
            "values",
        )


class ProductAttributeSerializer(
    serializers.ModelSerializer
):
    attribute = AttributeSerializer(
        read_only=True
    )

    class Meta:
        model = ProductAttribute

        fields = (
            "id",
            "attribute",
            "is_required",
            "is_variant_axis",
            "display_order",
        )


def promotion_matches_product(
    promotion,
    product,
):
    """
    VÃ©rifie une promotion dÃ©jÃ  prÃ©chargÃ©e,
    sans nouvelle requÃªte SQL.
    """

    if (
        promotion.target_mode
        == Promotion.TargetMode.ALL
    ):
        return True

    if (
        promotion.target_mode
        == Promotion.TargetMode.CATEGORY
    ):
        return (
            promotion.target_category_id
            == product.category_id
        )

    if (
        promotion.target_mode
        == Promotion.TargetMode.BRAND
    ):
        return (
            product.brand_id is not None
            and
            promotion.target_brand_id
            == product.brand_id
        )

    if (
        promotion.target_mode
        == Promotion.TargetMode.PRODUCTS
    ):
        product_ids = getattr(
            promotion,
            "_target_product_ids",
            set(),
        )

        return product.pk in product_ids

    return False


def calculate_product_price(
    product,
    *,
    normal_price,
    active_promotions,
):
    """
    Calcule le meilleur prix actuellement disponible.

    Les promotions ne sont pas cumulÃ©es.
    """

    normal_price = Decimal(
        normal_price
    )

    best_price = normal_price
    best_promotion = None

    for promotion in active_promotions:
        if not promotion_matches_product(
            promotion,
            product,
        ):
            continue

        candidate = (
            calculate_promotional_price(
                normal_price,
                promotion,
            )
        )

        if candidate < best_price:
            best_price = candidate
            best_promotion = promotion

    return (
        best_price,
        best_promotion,
    )


class ProductVariantSerializer(
    serializers.ModelSerializer
):
    effective_price = (
        serializers.SerializerMethodField()
    )

    current_price = (
        serializers.SerializerMethodField()
    )

    has_promotion = (
        serializers.SerializerMethodField()
    )

    attributes = (
        serializers.SerializerMethodField()
    )

    available_quantity = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = ProductVariant

        fields = (
            "id",
            "sku",
            "barcode",
            "effective_price",
            "current_price",
            "has_promotion",
            "image",
            "is_active",
            "attributes",
            "available_quantity",
        )

    def _pricing(
        self,
        obj,
    ):
        cache_name = (
            "_api_price_cache"
        )

        cached = getattr(
            obj,
            cache_name,
            None,
        )

        if cached is not None:
            return cached

        promotions = self.context.get(
            "active_promotions",
            [],
        )

        normal_price = Decimal(
            obj.effective_price
        )

        price, promotion = (
            calculate_product_price(
                obj.product,
                normal_price=normal_price,
                active_promotions=promotions,
            )
        )

        result = (
            normal_price,
            price,
            promotion,
        )

        setattr(
            obj,
            cache_name,
            result,
        )

        return result

    def get_effective_price(
        self,
        obj,
    ):
        normal_price, _, _ = (
            self._pricing(obj)
        )

        return f"{normal_price:.2f}"

    def get_current_price(
        self,
        obj,
    ):
        _, current_price, _ = (
            self._pricing(obj)
        )

        return f"{current_price:.2f}"

    def get_has_promotion(
        self,
        obj,
    ):
        _, _, promotion = (
            self._pricing(obj)
        )

        return promotion is not None

    def get_attributes(
        self,
        obj,
    ):
        selections = obj.selections.all()

        return [
            {
                "attribute": (
                    selection
                    .attribute_value
                    .attribute
                    .name
                ),
                "attribute_slug": (
                    selection
                    .attribute_value
                    .attribute
                    .slug
                ),
                "value": (
                    selection
                    .attribute_value
                    .display_value
                ),
                "color_hex": (
                    selection
                    .attribute_value
                    .color_hex
                ),
            }
            for selection in selections
        ]

    def get_available_quantity(
        self,
        obj,
    ):
        try:
            inventory = obj.inventory
        except Exception:
            return 0

        return inventory.quantity_available


class ProductListSerializer(
    serializers.ModelSerializer
):
    category = CategoryMiniSerializer(
        read_only=True
    )

    brand = BrandMiniSerializer(
        read_only=True
    )

    primary_image = (
        serializers.SerializerMethodField()
    )

    normal_price = (
        serializers.SerializerMethodField()
    )

    current_price = (
        serializers.SerializerMethodField()
    )

    has_promotion = (
        serializers.SerializerMethodField()
    )

    promotion = (
        serializers.SerializerMethodField()
    )

    available_quantity = (
        serializers.SerializerMethodField()
    )

    has_variants = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "category",
            "brand",
            "short_description",
            "primary_image",
            "normal_price",
            "current_price",
            "has_promotion",
            "promotion",
            "available_quantity",
            "has_variants",
            "is_featured",
            "created_at",
        )

    def _pricing(
        self,
        obj,
    ):
        cache_name = (
            "_api_product_price_cache"
        )

        cached = getattr(
            obj,
            cache_name,
            None,
        )

        if cached is not None:
            return cached

        active_promotions = (
            self.context.get(
                "active_promotions",
                [],
            )
        )

        normal_price = Decimal(
            obj.base_price
        )

        current_price, promotion = (
            calculate_product_price(
                obj,
                normal_price=normal_price,
                active_promotions=(
                    active_promotions
                ),
            )
        )

        result = (
            normal_price,
            current_price,
            promotion,
        )

        setattr(
            obj,
            cache_name,
            result,
        )

        return result

    def get_primary_image(
        self,
        obj,
    ):
        image = obj.primary_image

        if not image:
            return None

        request = self.context.get(
            "request"
        )

        url = image.image.url

        if request:
            return request.build_absolute_uri(
                url
            )

        return url

    def get_normal_price(
        self,
        obj,
    ):
        normal, _, _ = self._pricing(
            obj
        )

        return f"{normal:.2f}"

    def get_current_price(
        self,
        obj,
    ):
        _, current, _ = self._pricing(
            obj
        )

        return f"{current:.2f}"

    def get_has_promotion(
        self,
        obj,
    ):
        _, _, promotion = (
            self._pricing(obj)
        )

        return promotion is not None

    def get_promotion(
        self,
        obj,
    ):
        _, _, promotion = (
            self._pricing(obj)
        )

        if not promotion:
            return None

        return {
            "id": promotion.pk,
            "name": promotion.name,
            "type": (
                promotion.campaign_type
            ),
            "badge": promotion.badge_text,
            "end_at": promotion.end_at,
            "remaining_seconds": (
                promotion.remaining_seconds
            ),
        }

    def get_available_quantity(
        self,
        obj,
    ):
        inventory_items = list(
            obj.inventory_items.all()
        )

        return sum(
            item.quantity_available
            for item in inventory_items
        )

    def get_has_variants(
        self,
        obj,
    ):
        return bool(
            list(
                obj.variants.all()
            )
        )


class ProductDetailSerializer(
    ProductListSerializer
):
    images = ProductImageSerializer(
        many=True,
        read_only=True,
    )

    variants = ProductVariantSerializer(
        many=True,
        read_only=True,
    )

    attributes = (
        ProductAttributeSerializer(
            source="product_attributes",
            many=True,
            read_only=True,
        )
    )

    class Meta(
        ProductListSerializer.Meta
    ):
        fields = (
            ProductListSerializer
            .Meta
            .fields
            + (
                "barcode",
                "description",
                "seo_title",
                "seo_description",
                "images",
                "attributes",
                "variants",
                "updated_at",
            )
        )
