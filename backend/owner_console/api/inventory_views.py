from django.core.paginator import Paginator
from django.db.models import F
from django.db.models import Q
from django.db.models import Sum

from rest_framework import permissions
from rest_framework import status
from rest_framework.authentication import (
    SessionAuthentication,
    TokenAuthentication,
)
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response

from accounts.permissions import IsOwner

from inventory.models import InventoryItem

from inventory.services import (
    InsufficientReservedStockError,
    InsufficientStockError,
    InvalidStockQuantityError,
    add_stock,
    adjust_stock,
    remove_stock,
)


# ============================================================
# AUTHENTIFICATION OWNER
# ============================================================

OWNER_AUTHENTICATION = [
    TokenAuthentication,
    SessionAuthentication,
]


OWNER_PERMISSIONS = [
    permissions.IsAuthenticated,
    IsOwner,
]


# ============================================================
# UTILITAIRES
# ============================================================

def _base_queryset():
    return (
        InventoryItem.objects
        .select_related(
            "product",
            "variant",
            "product__brand",
            "product__category",
        )
        .prefetch_related(
            "variant__selections__attribute_value__attribute",
        )
        .annotate(
            calculated_available=(
                F("quantity_on_hand")
                - F("quantity_reserved")
            )
        )
    )


def _item_status(item):
    available = (
        item.quantity_on_hand
        - item.quantity_reserved
    )

    if available <= 0:
        return "OUT_OF_STOCK"

    if available <= item.low_stock_threshold:
        return "LOW_STOCK"

    return "IN_STOCK"


def _variant_label(item):
    """
    Retourne uniquement les vraies valeurs de variante.

    Exemple :
        Stockage = 256 Go
        Couleur = Noir

    Résultat :
        256 Go / Noir

    On n'utilise volontairement pas str(item.variant),
    car __str__ peut retourner quelque chose comme :
        Samsung Galaxy A26 — SAM-A26
    ce qui duplique le nom du produit et le SKU dans l'interface.
    """

    if not item.variant:
        return ""

    values = []

    for selection in item.variant.selections.all():
        value = (
            selection
            .attribute_value
            .display_value
        )

        value = str(
            value or ""
        ).strip()

        if (
            value
            and value not in values
        ):
            values.append(
                value
            )

    return " / ".join(
        values
    )


def _serialize_item(item):
    available = (
        item.quantity_on_hand
        - item.quantity_reserved
    )

    return {
        "id": item.pk,

        "product_id": (
            item.product_id
        ),

        "product_name": (
            item.product.name
        ),

        "sku": (
            item.variant.sku
            if item.variant
            else item.product.sku
        ),

        "barcode": (
            item.variant.barcode
            if (
                item.variant
                and item.variant.barcode
            )
            else (
                item.product.barcode
                or ""
            )
        ),

        "variant": (
            _variant_label(
                item
            )
        ),

        "quantity_on_hand": (
            item.quantity_on_hand
        ),

        "quantity_reserved": (
            item.quantity_reserved
        ),

        "available": available,

        "low_stock_threshold": (
            item.low_stock_threshold
        ),

        "status": (
            _item_status(item)
        ),

        "updated_at": (
            item.updated_at
        ),
    }


def _parse_integer(
    value,
    *,
    field_name,
    minimum=None,
):
    try:
        parsed = int(value)
    except (
        TypeError,
        ValueError,
    ) as exc:
        raise ValueError(
            f"{field_name} doit être un entier."
        ) from exc

    if (
        minimum is not None
        and parsed < minimum
    ):
        raise ValueError(
            (
                f"{field_name} doit être "
                f"supérieur ou égal à "
                f"{minimum}."
            )
        )

    return parsed


# ============================================================
# LISTE COMPLÈTE DU STOCK
# ============================================================

@api_view([
    "GET",
])
@authentication_classes(
    OWNER_AUTHENTICATION
)
@permission_classes(
    OWNER_PERMISSIONS
)
def inventory_items(
    request,
):
    """
    Liste paginée du stock propriétaire.

    Filtres :
        ?q=samsung
        ?status=IN_STOCK
        ?status=LOW_STOCK
        ?status=OUT_OF_STOCK
        ?page=1
        ?page_size=20
    """

    base_queryset = (
        _base_queryset()
    )


    # ========================================================
    # RÉSUMÉ GLOBAL
    # ========================================================

    totals = (
        base_queryset.aggregate(
            total_on_hand=Sum(
                "quantity_on_hand"
            ),
            total_reserved=Sum(
                "quantity_reserved"
            ),
        )
    )


    total_items = (
        base_queryset.count()
    )


    out_of_stock = (
        base_queryset
        .filter(
            calculated_available__lte=0
        )
        .count()
    )


    low_stock = (
        base_queryset
        .filter(
            calculated_available__gt=0,
            calculated_available__lte=F(
                "low_stock_threshold"
            ),
        )
        .count()
    )


    in_stock = max(
        0,
        total_items
        - low_stock
        - out_of_stock,
    )


    total_on_hand = (
        totals[
            "total_on_hand"
        ]
        or 0
    )


    total_reserved = (
        totals[
            "total_reserved"
        ]
        or 0
    )


    summary = {
        "total_items": (
            total_items
        ),

        "in_stock": (
            in_stock
        ),

        "low_stock": (
            low_stock
        ),

        "out_of_stock": (
            out_of_stock
        ),

        "total_on_hand": (
            total_on_hand
        ),

        "total_reserved": (
            total_reserved
        ),

        "total_available": (
            total_on_hand
            - total_reserved
        ),
    }


    # ========================================================
    # FILTRAGE
    # ========================================================

    queryset = (
        base_queryset
    )


    search = (
        request.query_params
        .get(
            "q",
            "",
        )
        .strip()
    )


    if search:
        queryset = (
            queryset.filter(
                Q(
                    product__name__icontains=(
                        search
                    )
                )
                |
                Q(
                    product__sku__icontains=(
                        search
                    )
                )
                |
                Q(
                    product__barcode__icontains=(
                        search
                    )
                )
                |
                Q(
                    variant__sku__icontains=(
                        search
                    )
                )
                |
                Q(
                    variant__barcode__icontains=(
                        search
                    )
                )
                |
                Q(
                    variant__selections__attribute_value__display_value__icontains=(
                        search
                    )
                )
            )
            .distinct()
        )


    stock_status = (
        request.query_params
        .get(
            "status",
            "",
        )
        .strip()
        .upper()
    )


    if (
        stock_status
        == "OUT_OF_STOCK"
    ):
        queryset = (
            queryset.filter(
                calculated_available__lte=0
            )
        )


    elif (
        stock_status
        == "LOW_STOCK"
    ):
        queryset = (
            queryset.filter(
                calculated_available__gt=0,
                calculated_available__lte=F(
                    "low_stock_threshold"
                ),
            )
        )


    elif (
        stock_status
        == "IN_STOCK"
    ):
        queryset = (
            queryset.filter(
                calculated_available__gt=F(
                    "low_stock_threshold"
                )
            )
        )


    queryset = (
        queryset.order_by(
            "product__name",
            "variant__sku",
            "pk",
        )
    )


    # ========================================================
    # PAGINATION
    # ========================================================

    try:
        page_number = max(
            1,
            int(
                request.query_params
                .get(
                    "page",
                    "1",
                )
            ),
        )
    except ValueError:
        page_number = 1


    try:
        page_size = int(
            request.query_params
            .get(
                "page_size",
                "20",
            )
        )
    except ValueError:
        page_size = 20


    page_size = min(
        max(
            page_size,
            1,
        ),
        100,
    )


    paginator = Paginator(
        queryset,
        page_size,
    )


    page_obj = (
        paginator.get_page(
            page_number
        )
    )


    return Response(
        {
            "summary": summary,

            "count": (
                paginator.count
            ),

            "page": (
                page_obj.number
            ),

            "page_size": (
                page_size
            ),

            "total_pages": (
                paginator.num_pages
            ),

            "results": [
                _serialize_item(
                    item
                )
                for item
                in page_obj.object_list
            ],
        }
    )


# ============================================================
# ACTION SUR LE STOCK
# ============================================================

@api_view([
    "POST",
])
@authentication_classes(
    OWNER_AUTHENTICATION
)
@permission_classes(
    OWNER_PERMISSIONS
)
def inventory_item_action(
    request,
    item_id,
):
    """
    Actions possibles :

    RECEIVE
        Entrée de stock.

    REMOVE
        Sortie manuelle.

    ADJUST
        Stock physique réel après inventaire.

    THRESHOLD
        Modifier le seuil d'alerte.
    """

    item = (
        InventoryItem.objects
        .select_related(
            "product",
            "variant",
        )
        .prefetch_related(
            "variant__selections__attribute_value__attribute",
        )
        .filter(
            pk=item_id
        )
        .first()
    )


    if item is None:
        return Response(
            {
                "detail": (
                    "Ligne de stock introuvable."
                )
            },
            status=(
                status.HTTP_404_NOT_FOUND
            ),
        )


    operation = (
        str(
            request.data.get(
                "operation",
                "",
            )
        )
        .strip()
        .upper()
    )


    reference = (
        str(
            request.data.get(
                "reference",
                "",
            )
            or ""
        )
        .strip()[:120]
    )


    note = (
        str(
            request.data.get(
                "note",
                "",
            )
            or ""
        )
        .strip()[:1000]
    )


    try:
        # ====================================================
        # ENTRÉE STOCK
        # ====================================================

        if operation == "RECEIVE":
            quantity = (
                _parse_integer(
                    request.data.get(
                        "quantity"
                    ),
                    field_name=(
                        "La quantité"
                    ),
                    minimum=1,
                )
            )


            item = add_stock(
                item.pk,
                quantity,
                reference=reference,
                note=note,
                user=request.user,
            )


        # ====================================================
        # SORTIE STOCK
        # ====================================================

        elif operation == "REMOVE":
            quantity = (
                _parse_integer(
                    request.data.get(
                        "quantity"
                    ),
                    field_name=(
                        "La quantité"
                    ),
                    minimum=1,
                )
            )


            item = remove_stock(
                item.pk,
                quantity,
                reference=reference,
                note=note,
                user=request.user,
            )


        # ====================================================
        # AJUSTEMENT INVENTAIRE
        # ====================================================

        elif operation == "ADJUST":
            new_quantity = (
                _parse_integer(
                    request.data.get(
                        "new_quantity"
                    ),
                    field_name=(
                        "Le nouveau stock"
                    ),
                    minimum=0,
                )
            )


            item = adjust_stock(
                item.pk,
                new_quantity,
                reference=reference,
                note=note,
                user=request.user,
            )


        # ====================================================
        # SEUIL D'ALERTE
        # ====================================================

        elif operation == "THRESHOLD":
            threshold = (
                _parse_integer(
                    request.data.get(
                        "low_stock_threshold"
                    ),
                    field_name=(
                        "Le seuil d'alerte"
                    ),
                    minimum=0,
                )
            )


            item.low_stock_threshold = (
                threshold
            )

            item.save(
                update_fields=[
                    "low_stock_threshold",
                    "updated_at",
                ]
            )


        else:
            return Response(
                {
                    "detail": (
                        "Opération stock inconnue."
                    )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )


    except (
        ValueError,
        InvalidStockQuantityError,
        InsufficientStockError,
        InsufficientReservedStockError,
    ) as exc:
        return Response(
            {
                "detail": str(exc)
            },
            status=(
                status
                .HTTP_400_BAD_REQUEST
            ),
        )


    item = (
        InventoryItem.objects
        .select_related(
            "product",
            "variant",
        )
        .prefetch_related(
            "variant__selections__attribute_value__attribute",
        )
        .get(
            pk=item.pk
        )
    )


    return Response(
        {
            "detail": (
                "Stock mis à jour avec succès."
            ),

            "item": (
                _serialize_item(
                    item
                )
            ),
        },
        status=(
            status.HTTP_200_OK
        ),
    )
