from datetime import timedelta
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from catalog.models import (
    Product,
    ProductVariant,
)

from inventory.models import (
    InventoryItem,
)

from inventory.services import (
    InsufficientReservedStockError,
    InsufficientStockError,
    release_stock,
    reserve_stock,
)

from promotions.services import (
    get_effective_price,
)

from .models import (
    CheckoutItem,
    CheckoutSession,
)


CHECKOUT_DURATION_MINUTES = 30

MAX_CHECKOUT_LINES = 50

MAX_QUANTITY_PER_LINE = 99


class CheckoutError(Exception):
    pass


class EmptyCheckoutError(
    CheckoutError
):
    pass


class InvalidCheckoutQuantityError(
    CheckoutError
):
    pass


class ProductUnavailableError(
    CheckoutError
):
    pass


class VariantRequiredError(
    CheckoutError
):
    pass


class VariantUnavailableError(
    CheckoutError
):
    pass


class CheckoutStockError(
    CheckoutError
):
    pass


class CheckoutAlreadyClosedError(
    CheckoutError
):
    pass


def _normalize_lines(
    lines,
):
    if not lines:
        raise EmptyCheckoutError(
            "Le panier est vide."
        )

    if (
        len(lines)
        > MAX_CHECKOUT_LINES
    ):
        raise CheckoutError(
            "Le panier contient trop de lignes."
        )

    aggregated = {}

    for line in lines:
        product_id = int(
            line["product_id"]
        )

        variant_id = (
            line.get(
                "variant_id"
            )
        )

        if variant_id is not None:
            variant_id = int(
                variant_id
            )

        quantity = int(
            line["quantity"]
        )

        if (
            quantity <= 0
            or quantity
            > MAX_QUANTITY_PER_LINE
        ):
            raise InvalidCheckoutQuantityError(
                (
                    "Chaque quantité doit être "
                    f"comprise entre 1 et "
                    f"{MAX_QUANTITY_PER_LINE}."
                )
            )

        key = (
            product_id,
            variant_id,
        )

        aggregated[key] = (
            aggregated.get(
                key,
                0,
            )
            + quantity
        )

        if (
            aggregated[key]
            > MAX_QUANTITY_PER_LINE
        ):
            raise InvalidCheckoutQuantityError(
                (
                    "La quantité totale d'un article "
                    f"ne peut pas dépasser "
                    f"{MAX_QUANTITY_PER_LINE}."
                )
            )

    normalized = [
        {
            "product_id": (
                product_id
            ),
            "variant_id": (
                variant_id
            ),
            "quantity": quantity,
        }
        for (
            product_id,
            variant_id,
        ), quantity
        in aggregated.items()
    ]

    normalized.sort(
        key=lambda item: (
            item["product_id"],
            item["variant_id"]
            or 0,
        )
    )

    return normalized


def _get_product(
    product_id,
):
    try:
        return (
            Product.objects
            .select_related(
                "category",
                "brand",
            )
            .get(
                pk=product_id,
                status=(
                    Product.Status.ACTIVE
                ),
            )
        )

    except Product.DoesNotExist as exc:
        raise ProductUnavailableError(
            (
                "Un produit du panier "
                "n'est plus disponible."
            )
        ) from exc


def _get_variant(
    product,
    variant_id,
):
    has_active_variants = (
        product.variants.filter(
            is_active=True
        ).exists()
    )

    if variant_id is None:
        if has_active_variants:
            raise VariantRequiredError(
                (
                    f"Choisissez une variante "
                    f"pour {product.name}."
                )
            )

        return None

    try:
        return (
            ProductVariant.objects
            .prefetch_related(
                "selections"
                "__attribute_value"
                "__attribute"
            )
            .get(
                pk=variant_id,
                product=product,
                is_active=True,
            )
        )

    except ProductVariant.DoesNotExist as exc:
        raise VariantUnavailableError(
            (
                f"La variante choisie pour "
                f"{product.name} "
                f"n'est plus disponible."
            )
        ) from exc


def _get_inventory_item(
    product,
    variant,
):
    try:
        return (
            InventoryItem.objects
            .get(
                product=product,
                variant=variant,
            )
        )

    except InventoryItem.DoesNotExist as exc:
        raise CheckoutStockError(
            (
                f"Aucun stock n'est configuré "
                f"pour {product.name}."
            )
        ) from exc


def _variant_label(
    variant,
):
    if variant is None:
        return ""

    selections = (
        variant.selections
        .select_related(
            "attribute_value"
            "__attribute"
        )
        .all()
    )

    values = [
        (
            f"{selection.attribute_value.attribute.name}: "
            f"{selection.attribute_value.display_value}"
        )
        for selection
        in selections
    ]

    if values:
        return " • ".join(
            values
        )

    return "Option standard"


@transaction.atomic
def create_checkout_session(
    *,
    customer_name,
    customer_phone,
    customer_whatsapp="",
    customer_email="",
    delivery_method=(
        CheckoutSession
        .DeliveryMethod
        .DELIVERY
    ),
    city="Bamako",
    delivery_zone="",
    address="",
    notes="",
    lines,
):
    normalized_lines = (
        _normalize_lines(
            lines
        )
    )

    if (
        delivery_method
        == CheckoutSession
        .DeliveryMethod
        .DELIVERY
        and not address.strip()
    ):
        raise CheckoutError(
            (
                "L'adresse est obligatoire "
                "pour une livraison."
            )
        )

    session = (
        CheckoutSession.objects.create(
            customer_name=(
                customer_name.strip()
            ),
            customer_phone=(
                customer_phone.strip()
            ),
            customer_whatsapp=(
                customer_whatsapp.strip()
            ),
            customer_email=(
                customer_email.strip()
            ),
            delivery_method=(
                delivery_method
            ),
            city=(
                city.strip()
                or "Bamako"
            ),
            delivery_zone=(
                delivery_zone.strip()
            ),
            address=(
                address.strip()
            ),
            notes=(
                notes.strip()
            ),
            expires_at=(
                timezone.now()
                + timedelta(
                    minutes=(
                        CHECKOUT_DURATION_MINUTES
                    )
                )
            ),
        )
    )

    subtotal = Decimal(
        "0.00"
    )

    reference = (
        f"CHECKOUT-{session.pk}"
    )

    for line in normalized_lines:
        product = _get_product(
            line["product_id"]
        )

        variant = _get_variant(
            product,
            line["variant_id"],
        )

        inventory_item = (
            _get_inventory_item(
                product,
                variant,
            )
        )

        quantity = line[
            "quantity"
        ]

        try:
            reserve_stock(
                inventory_item.pk,
                quantity,
                reference=reference,
                note=(
                    "Réservation temporaire "
                    "pendant le checkout."
                ),
            )

        except InsufficientStockError as exc:
            raise CheckoutStockError(
                (
                    f"Stock insuffisant pour "
                    f"{product.name}."
                )
            ) from exc

        pricing = (
            get_effective_price(
                product,
                variant=variant,
            )
        )

        normal_price = Decimal(
            pricing[
                "normal_price"
            ]
        )

        unit_price = Decimal(
            pricing[
                "current_price"
            ]
        )

        line_total = (
            unit_price
            * quantity
        )

        CheckoutItem.objects.create(
            session=session,
            product=product,
            variant=variant,
            inventory_item=(
                inventory_item
            ),
            product_name=(
                product.name
            ),
            sku=(
                variant.sku
                if variant
                else product.sku
            ),
            variant_label=(
                _variant_label(
                    variant
                )
            ),
            normal_price=(
                normal_price
            ),
            unit_price=(
                unit_price
            ),
            quantity=quantity,
            line_total=(
                line_total
            ),
        )

        subtotal += line_total

    session.subtotal = (
        subtotal
    )

    session.delivery_fee = (
        Decimal("0.00")
    )

    session.total = (
        session.subtotal
        + session.delivery_fee
    )

    session.save(
        update_fields=[
            "subtotal",
            "delivery_fee",
            "total",
            "updated_at",
        ]
    )

    return session


def _release_reserved_stock(
    session,
    *,
    reason,
):
    items = (
        session.items
        .select_related(
            "inventory_item"
        )
        .order_by(
            "inventory_item_id",
            "id",
        )
    )

    reference = (
        f"CHECKOUT-{session.pk}"
    )

    for item in items:
        try:
            release_stock(
                item.inventory_item_id,
                item.quantity,
                reference=reference,
                note=reason,
            )

        except (
            InsufficientReservedStockError,
            InsufficientStockError,
        ) as exc:
            raise CheckoutStockError(
                (
                    "Impossible de libérer "
                    "correctement une réservation "
                    "de stock."
                )
            ) from exc


@transaction.atomic
def cancel_checkout_session(
    session_id,
):
    try:
        session = (
            CheckoutSession.objects
            .select_for_update()
            .get(
                pk=session_id
            )
        )

    except CheckoutSession.DoesNotExist as exc:
        raise CheckoutError(
            "Session checkout introuvable."
        ) from exc

    if (
        session.status
        == CheckoutSession
        .Status
        .CONVERTED
    ):
        raise CheckoutAlreadyClosedError(
            (
                "Cette session a déjà été "
                "convertie en commande."
            )
        )

    if (
        session.status
        in {
            CheckoutSession
            .Status
            .CANCELLED,

            CheckoutSession
            .Status
            .EXPIRED,
        }
    ):
        return session

    _release_reserved_stock(
        session,
        reason=(
            "Libération suite à "
            "l'annulation du checkout."
        ),
    )

    session.status = (
        CheckoutSession
        .Status
        .CANCELLED
    )

    session.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return session


@transaction.atomic
def expire_checkout_session_if_needed(
    session_id,
):
    try:
        session = (
            CheckoutSession.objects
            .select_for_update()
            .get(
                pk=session_id
            )
        )

    except CheckoutSession.DoesNotExist as exc:
        raise CheckoutError(
            "Session checkout introuvable."
        ) from exc

    if (
        session.status
        != CheckoutSession
        .Status
        .ACTIVE
    ):
        return session

    if (
        session.expires_at
        > timezone.now()
    ):
        return session

    _release_reserved_stock(
        session,
        reason=(
            "Libération automatique : "
            "checkout expiré."
        ),
    )

    session.status = (
        CheckoutSession
        .Status
        .EXPIRED
    )

    session.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return session


def expire_due_checkout_sessions(
    *,
    limit=200,
):
    ids = list(
        CheckoutSession.objects
        .filter(
            status=(
                CheckoutSession
                .Status
                .ACTIVE
            ),
            expires_at__lte=(
                timezone.now()
            ),
        )
        .order_by(
            "expires_at"
        )
        .values_list(
            "pk",
            flat=True,
        )[
            :limit
        ]
    )

    expired = 0

    for session_id in ids:
        session = (
            expire_checkout_session_if_needed(
                session_id
            )
        )

        if (
            session.status
            == CheckoutSession
            .Status
            .EXPIRED
        ):
            expired += 1

    return expired