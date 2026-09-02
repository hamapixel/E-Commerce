from django.db.models import (
    Exists,
    F,
    OuterRef,
)

from django_filters import rest_framework as filters

from catalog.models import Product
from inventory.models import InventoryItem


class ProductFilter(filters.FilterSet):
    """
    Filtres publics du catalogue SUGU KURA.

    La recherche textuelle reste gérée par
    DRF SearchFilter avec le paramètre :

        ?search=samsung

    Ici nous gérons les filtres structurés.
    """

    category = filters.CharFilter(
        field_name="category__slug",
        lookup_expr="iexact",
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

    class Meta:
        model = Product

        fields = [
            "category",
            "brand",
            "featured",
            "has_variants",
            "in_stock",
        ]

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
        """
        Un produit est considéré disponible lorsqu'au
        moins une ligne InventoryItem possède :

            quantity_on_hand > quantity_reserved

        Cela fonctionne pour :

        - produits simples ;
        - produits avec variantes.
        """

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