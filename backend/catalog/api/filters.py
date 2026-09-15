from django.db.models import (
    Exists,
    F,
    OuterRef,
    Q,
)

from django_filters import rest_framework as filters

from catalog.models import (
    Category,
    Product,
)

from inventory.models import InventoryItem

from promotions.models import Promotion


class ProductFilter(filters.FilterSet):
    """
    Filtres publics du catalogue SUGU KURA.
    """

    category = filters.CharFilter(
        method="filter_category",
    )

    brand = filters.CharFilter(
        field_name="brand__slug",
        lookup_expr="iexact",
    )

    min_price = filters.NumberFilter(
        field_name="base_price",
        lookup_expr="gte",
    )

    max_price = filters.NumberFilter(
        field_name="base_price",
        lookup_expr="lte",
    )

    featured = filters.BooleanFilter(
        field_name="is_featured",
    )

    has_variants = filters.BooleanFilter(
        method="filter_has_variants",
    )

    in_stock = filters.BooleanFilter(
        method="filter_in_stock",
    )

    promotion = filters.BooleanFilter(
        method="filter_promotion",
    )

    class Meta:
        model = Product

        fields = [
            "category",
            "brand",
            "featured",
            "has_variants",
            "in_stock",
            "promotion",
        ]

    def filter_category(
        self,
        queryset,
        name,
        value,
    ):
        category = (
            Category.objects
            .filter(
                slug__iexact=value,
                is_active=True,
            )
            .first()
        )

        if not category:
            return queryset.none()

        category_ids = {
            category.pk
        }

        pending_ids = {
            category.pk
        }

        while pending_ids:
            children = set(
                Category.objects
                .filter(
                    parent_id__in=pending_ids,
                    is_active=True,
                )
                .values_list(
                    "id",
                    flat=True,
                )
            )

            children -= category_ids

            if not children:
                break

            category_ids.update(
                children
            )

            pending_ids = children

        return queryset.filter(
            category_id__in=category_ids
        )

    def filter_promotion(
        self,
        queryset,
        name,
        value,
    ):
        """
        Permet :

            ?promotion=true

        Retourne tous les produits ciblés par
        au moins une promotion actuellement active.
        """

        active_promotions = (
            Promotion.objects
            .active_now()
        )

        has_global_promotion = (
            active_promotions
            .filter(
                target_mode=(
                    Promotion.TargetMode.ALL
                )
            )
            .exists()
        )

        if has_global_promotion:
            promoted_queryset = queryset

        else:
            category_ids = list(
                active_promotions
                .filter(
                    target_mode=(
                        Promotion
                        .TargetMode
                        .CATEGORY
                    ),
                    target_category__isnull=False,
                )
                .values_list(
                    "target_category_id",
                    flat=True,
                )
            )

            brand_ids = list(
                active_promotions
                .filter(
                    target_mode=(
                        Promotion
                        .TargetMode
                        .BRAND
                    ),
                    target_brand__isnull=False,
                )
                .values_list(
                    "target_brand_id",
                    flat=True,
                )
            )

            product_ids = list(
                active_promotions
                .filter(
                    target_mode=(
                        Promotion
                        .TargetMode
                        .PRODUCTS
                    )
                )
                .values_list(
                    "products__id",
                    flat=True,
                )
            )

            promotion_query = Q(
                pk__in=[]
            )

            if category_ids:
                promotion_query |= Q(
                    category_id__in=(
                        category_ids
                    )
                )

            if brand_ids:
                promotion_query |= Q(
                    brand_id__in=(
                        brand_ids
                    )
                )

            if product_ids:
                promotion_query |= Q(
                    pk__in=product_ids
                )

            promoted_queryset = (
                queryset
                .filter(
                    promotion_query
                )
                .distinct()
            )

        if value is True:
            return promoted_queryset

        if value is False:
            return queryset.exclude(
                pk__in=(
                    promoted_queryset
                    .values("pk")
                )
            )

        return queryset

    def filter_has_variants(
        self,
        queryset,
        name,
        value,
    ):
        if value is True:
            return (
                queryset
                .filter(
                    variants__isnull=False
                )
                .distinct()
            )

        if value is False:
            return (
                queryset
                .filter(
                    variants__isnull=True
                )
                .distinct()
            )

        return queryset

    def filter_in_stock(
        self,
        queryset,
        name,
        value,
    ):
        available_stock = (
            InventoryItem.objects
            .filter(
                product_id=OuterRef(
                    "pk"
                ),
                quantity_on_hand__gt=F(
                    "quantity_reserved"
                ),
            )
        )

        queryset = queryset.annotate(
            _has_available_stock=Exists(
                available_stock
            )
        )

        if value is True:
            return queryset.filter(
                _has_available_stock=True
            )

        if value is False:
            return queryset.filter(
                _has_available_stock=False
            )

        return queryset
