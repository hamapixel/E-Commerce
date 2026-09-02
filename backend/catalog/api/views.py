from django.db.models import Prefetch

from django_filters.rest_framework import (
    DjangoFilterBackend,
)

from rest_framework import (
    filters,
    permissions,
    viewsets,
)

from catalog.models import (
    Brand,
    Category,
    Product,
    ProductAttribute,
    ProductImage,
    ProductVariant,
    VariantAttributeSelection,
)

from inventory.models import (
    InventoryItem,
)

from promotions.models import (
    Promotion,
)

from .filters import ProductFilter

from .pagination import (
    ProductPagination,
)

from .serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


class PublicReadOnlyViewSet(
    viewsets.ReadOnlyModelViewSet
):
    permission_classes = [
        permissions.AllowAny
    ]

    http_method_names = [
        "get",
        "head",
        "options",
    ]


class CategoryViewSet(
    PublicReadOnlyViewSet
):
    serializer_class = (
        CategorySerializer
    )

    lookup_field = "slug"

    queryset = (
        Category.objects
        .filter(
            is_active=True
        )
        .select_related(
            "parent"
        )
        .prefetch_related(
            "subcategories"
        )
        .order_by(
            "display_order",
            "name",
        )
    )

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "name",
        "description",
    ]

    ordering_fields = [
        "name",
        "display_order",
    ]

    ordering = [
        "display_order",
        "name",
    ]


class BrandViewSet(
    PublicReadOnlyViewSet
):
    serializer_class = BrandSerializer

    lookup_field = "slug"

    queryset = (
        Brand.objects
        .filter(
            is_active=True
        )
        .order_by(
            "display_order",
            "name",
        )
    )

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "name",
        "description",
    ]

    ordering_fields = [
        "name",
        "display_order",
    ]

    ordering = [
        "display_order",
        "name",
    ]


class ProductViewSet(
    PublicReadOnlyViewSet
):
    lookup_field = "slug"

    pagination_class = (
        ProductPagination
    )

    filterset_class = (
        ProductFilter
    )

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "name",
        "sku",
        "barcode",
        "category__name",
        "brand__name",
        "short_description",
    ]

    ordering_fields = [
        "name",
        "base_price",
        "created_at",
    ]

    ordering = [
        "-created_at",
    ]

    def get_queryset(self):
        variant_queryset = (
            ProductVariant.objects
            .filter(
                is_active=True
            )
            .select_related(
                "inventory"
            )
            .prefetch_related(
                Prefetch(
                    "selections",
                    queryset=(
                        VariantAttributeSelection
                        .objects
                        .select_related(
                            "attribute_value"
                            "__attribute"
                        )
                    ),
                )
            )
        )

        attribute_queryset = (
            ProductAttribute.objects
            .select_related(
                "attribute"
            )
            .prefetch_related(
                "attribute__values"
            )
            .order_by(
                "display_order"
            )
        )

        inventory_queryset = (
            InventoryItem.objects
            .select_related(
                "variant"
            )
        )

        image_queryset = (
            ProductImage.objects
            .order_by(
                "display_order",
                "id",
            )
        )

        return (
            Product.objects
            .filter(
                status=(
                    Product.Status.ACTIVE
                )
            )
            .select_related(
                "category",
                "brand",
            )
            .prefetch_related(
                Prefetch(
                    "images",
                    queryset=image_queryset,
                ),
                Prefetch(
                    "variants",
                    queryset=variant_queryset,
                ),
                Prefetch(
                    "product_attributes",
                    queryset=(
                        attribute_queryset
                    ),
                ),
                Prefetch(
                    "inventory_items",
                    queryset=(
                        inventory_queryset
                    ),
                ),
            )
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return (
                ProductDetailSerializer
            )

        return ProductListSerializer

    def get_serializer_context(self):
        context = (
            super()
            .get_serializer_context()
        )

        promotions = list(
            Promotion.objects
            .active_now()
            .select_related(
                "target_category",
                "target_brand",
            )
            .prefetch_related(
                "products"
            )
        )

        for promotion in promotions:
            promotion._target_product_ids = {
                product.pk
                for product
                in promotion.products.all()
            }

        context[
            "active_promotions"
        ] = promotions

        return context