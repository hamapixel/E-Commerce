from django.db import transaction

from .models import (
    InventoryItem,
    StockMovement,
)


class InventoryError(Exception):
    """
    Erreur métier générale liée au stock.
    """


class InvalidStockQuantityError(InventoryError):
    """
    Quantité invalide.
    """


class InsufficientStockError(InventoryError):
    """
    Stock disponible insuffisant.
    """


class InsufficientReservedStockError(
    InventoryError
):
    """
    Stock réservé insuffisant.
    """


def _validate_positive_quantity(quantity):
    """
    Vérifie qu'une quantité métier est un entier
    strictement supérieur à zéro.
    """

    if not isinstance(quantity, int):
        raise InvalidStockQuantityError(
            "La quantité doit être un entier."
        )

    if quantity <= 0:
        raise InvalidStockQuantityError(
            "La quantité doit être supérieure à zéro."
        )


def _get_locked_item(inventory_item_id):
    """
    Récupère et verrouille uniquement la ligne
    InventoryItem concernée.

    IMPORTANT :

    On ne fait volontairement PAS de select_related()
    ici.

    La relation `variant` est nullable.

    Avec PostgreSQL, combiner :

        select_for_update()
        + select_related("variant")

    peut produire une jointure externe sur une relation
    nullable, ce que PostgreSQL refuse de verrouiller.

    Le verrou dont SUGU KURA a réellement besoin est celui
    de la ligne de stock elle-même.
    """

    return (
        InventoryItem.objects
        .select_for_update()
        .get(
            pk=inventory_item_id
        )
    )


def _create_movement(
    *,
    item,
    movement_type,
    quantity_delta=0,
    reserved_delta=0,
    reference="",
    note="",
    user=None,
):
    """
    Enregistre un snapshot du stock après l'opération.
    """

    return StockMovement.objects.create(
        inventory_item=item,
        movement_type=movement_type,
        quantity_delta=quantity_delta,
        reserved_delta=reserved_delta,
        quantity_after=item.quantity_on_hand,
        reserved_after=item.quantity_reserved,
        reference=reference,
        note=note,
        created_by=user,
    )


@transaction.atomic
def add_stock(
    inventory_item_id,
    quantity,
    *,
    reference="",
    note="",
    user=None,
):
    """
    Ajoute du stock physique.

    Exemple :
    réception fournisseur de 50 pièces.
    """

    _validate_positive_quantity(
        quantity
    )

    item = _get_locked_item(
        inventory_item_id
    )

    item.quantity_on_hand += quantity

    item.save(
        update_fields=[
            "quantity_on_hand",
            "updated_at",
        ]
    )

    _create_movement(
        item=item,
        movement_type=(
            StockMovement
            .MovementType
            .RECEIVE
        ),
        quantity_delta=quantity,
        reference=reference,
        note=note,
        user=user,
    )

    return item


@transaction.atomic
def remove_stock(
    inventory_item_id,
    quantity,
    *,
    reference="",
    note="",
    user=None,
):
    """
    Retire une quantité du stock physique disponible.

    Le stock réservé reste protégé.
    """

    _validate_positive_quantity(
        quantity
    )

    item = _get_locked_item(
        inventory_item_id
    )

    if quantity > item.quantity_available:
        raise InsufficientStockError(
            "Stock disponible insuffisant."
        )

    item.quantity_on_hand -= quantity

    item.save(
        update_fields=[
            "quantity_on_hand",
            "updated_at",
        ]
    )

    _create_movement(
        item=item,
        movement_type=(
            StockMovement
            .MovementType
            .REMOVE
        ),
        quantity_delta=-quantity,
        reference=reference,
        note=note,
        user=user,
    )

    return item


@transaction.atomic
def reserve_stock(
    inventory_item_id,
    quantity,
    *,
    reference="",
    note="",
    user=None,
):
    """
    Réserve une quantité sans retirer immédiatement
    le stock physique.

    Exemple :

        physique = 5
        réservé = 0
        disponible = 5

    Réservation de 2 :

        physique = 5
        réservé = 2
        disponible = 3

    select_for_update() garantit que deux transactions
    concurrentes ne peuvent pas réserver le dernier article
    en même temps.
    """

    _validate_positive_quantity(
        quantity
    )

    item = _get_locked_item(
        inventory_item_id
    )

    if quantity > item.quantity_available:
        raise InsufficientStockError(
            "Stock disponible insuffisant "
            "pour cette réservation."
        )

    item.quantity_reserved += quantity

    item.save(
        update_fields=[
            "quantity_reserved",
            "updated_at",
        ]
    )

    _create_movement(
        item=item,
        movement_type=(
            StockMovement
            .MovementType
            .RESERVE
        ),
        reserved_delta=quantity,
        reference=reference,
        note=note,
        user=user,
    )

    return item


@transaction.atomic
def release_stock(
    inventory_item_id,
    quantity,
    *,
    reference="",
    note="",
    user=None,
):
    """
    Libère une réservation existante.

    Exemple :
    commande annulée avant validation définitive.
    """

    _validate_positive_quantity(
        quantity
    )

    item = _get_locked_item(
        inventory_item_id
    )

    if quantity > item.quantity_reserved:
        raise InsufficientReservedStockError(
            "La quantité à libérer dépasse "
            "le stock actuellement réservé."
        )

    item.quantity_reserved -= quantity

    item.save(
        update_fields=[
            "quantity_reserved",
            "updated_at",
        ]
    )

    _create_movement(
        item=item,
        movement_type=(
            StockMovement
            .MovementType
            .RELEASE
        ),
        reserved_delta=-quantity,
        reference=reference,
        note=note,
        user=user,
    )

    return item


@transaction.atomic
def consume_reserved_stock(
    inventory_item_id,
    quantity,
    *,
    reference="",
    note="",
    user=None,
):
    """
    Transforme une réservation en sortie réelle.

    Exemple :

    Avant validation :
        physique = 5
        réservé = 2
        disponible = 3

    Vente définitive de 2 :

        physique = 3
        réservé = 0
        disponible = 3
    """

    _validate_positive_quantity(
        quantity
    )

    item = _get_locked_item(
        inventory_item_id
    )

    if quantity > item.quantity_reserved:
        raise InsufficientReservedStockError(
            "Le stock réservé est insuffisant."
        )

    if quantity > item.quantity_on_hand:
        raise InsufficientStockError(
            "Le stock physique est insuffisant."
        )

    item.quantity_on_hand -= quantity
    item.quantity_reserved -= quantity

    item.save(
        update_fields=[
            "quantity_on_hand",
            "quantity_reserved",
            "updated_at",
        ]
    )

    _create_movement(
        item=item,
        movement_type=(
            StockMovement
            .MovementType
            .SALE
        ),
        quantity_delta=-quantity,
        reserved_delta=-quantity,
        reference=reference,
        note=note,
        user=user,
    )

    return item


@transaction.atomic
def adjust_stock(
    inventory_item_id,
    new_quantity,
    *,
    reference="",
    note="",
    user=None,
):
    """
    Corrige le stock après un inventaire physique.

    Le nouveau stock ne peut jamais être inférieur
    à la quantité déjà réservée.
    """

    if not isinstance(
        new_quantity,
        int,
    ):
        raise InvalidStockQuantityError(
            "Le nouveau stock doit être un entier."
        )

    if new_quantity < 0:
        raise InvalidStockQuantityError(
            "Le nouveau stock ne peut pas être négatif."
        )

    item = _get_locked_item(
        inventory_item_id
    )

    if (
        new_quantity
        < item.quantity_reserved
    ):
        raise InsufficientReservedStockError(
            "Impossible de descendre le stock "
            "sous la quantité déjà réservée."
        )

    previous_quantity = (
        item.quantity_on_hand
    )

    difference = (
        new_quantity
        - previous_quantity
    )

    item.quantity_on_hand = new_quantity

    item.save(
        update_fields=[
            "quantity_on_hand",
            "updated_at",
        ]
    )

    _create_movement(
        item=item,
        movement_type=(
            StockMovement
            .MovementType
            .ADJUSTMENT
        ),
        quantity_delta=difference,
        reference=reference,
        note=note,
        user=user,
    )

    return item