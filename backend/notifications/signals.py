from django.db import transaction

from django.db.models.signals import (
    post_save,
    pre_save,
)

from django.dispatch import (
    receiver,
)

from inventory.models import (
    InventoryItem,
)

from orders.models import (
    Order,
    Payment,
)

from .models import (
    NotificationLog,
)

from .services import (
    send_owner_notification,
)


def _money(value):
    try:
        return (
            f"{value:,.0f}"
            .replace(
                ",",
                " ",
            )
        )

    except Exception:
        return str(value)


@receiver(
    post_save,
    sender=Order,
)
def notify_new_order(
    sender,
    instance,
    created,
    **kwargs,
):
    if not created:
        return

    title = (
        "🛒 Nouvelle commande"
    )

    body = (
        f"{instance.order_number} • "
        f"{instance.customer_name} • "
        f"{_money(instance.total)} F CFA"
    )

    transaction.on_commit(
        lambda: (
            send_owner_notification(
                title=title,
                body=body,
                url="/commandes",
                kind=(
                    NotificationLog
                    .Kind
                    .ORDER
                ),
                data={
                    "order_id": str(
                        instance.pk
                    ),

                    "order_number": (
                        instance
                        .order_number
                    ),
                },
            )
        )
    )


@receiver(
    pre_save,
    sender=Payment,
)
def capture_previous_payment_status(
    sender,
    instance,
    **kwargs,
):
    if not instance.pk:
        instance._previous_status = None
        return

    instance._previous_status = (
        Payment.objects
        .filter(
            pk=instance.pk
        )
        .values_list(
            "status",
            flat=True,
        )
        .first()
    )


@receiver(
    post_save,
    sender=Payment,
)
def notify_paid_payment(
    sender,
    instance,
    created,
    **kwargs,
):
    previous_status = getattr(
        instance,
        "_previous_status",
        None,
    )

    if (
        instance.status
        != Payment.Status.PAID
    ):
        return

    if (
        not created
        and previous_status
        == Payment.Status.PAID
    ):
        return

    title = (
        "💰 Paiement confirmé"
    )

    body = (
        f"{instance.reference} • "
        f"{_money(instance.amount)} "
        f"{instance.currency}"
    )

    transaction.on_commit(
        lambda: (
            send_owner_notification(
                title=title,
                body=body,
                url="/paiements",
                kind=(
                    NotificationLog
                    .Kind
                    .PAYMENT
                ),
                data={
                    "payment_id": str(
                        instance.pk
                    ),

                    "order_id": str(
                        instance.order_id
                    ),
                },
            )
        )
    )


@receiver(
    pre_save,
    sender=InventoryItem,
)
def capture_previous_stock(
    sender,
    instance,
    **kwargs,
):
    if not instance.pk:
        instance._previous_available = (
            None
        )

        instance._previous_threshold = (
            None
        )

        return

    previous = (
        InventoryItem.objects
        .filter(
            pk=instance.pk
        )
        .values(
            "quantity_on_hand",
            "quantity_reserved",
            "low_stock_threshold",
        )
        .first()
    )

    if not previous:
        instance._previous_available = (
            None
        )

        instance._previous_threshold = (
            None
        )

        return

    instance._previous_available = (
        previous[
            "quantity_on_hand"
        ]
        - previous[
            "quantity_reserved"
        ]
    )

    instance._previous_threshold = (
        previous[
            "low_stock_threshold"
        ]
    )


@receiver(
    post_save,
    sender=InventoryItem,
)
def notify_stock_alert(
    sender,
    instance,
    created,
    **kwargs,
):
    available = (
        instance.quantity_on_hand
        - instance.quantity_reserved
    )

    threshold = (
        instance.low_stock_threshold
    )

    previous_available = getattr(
        instance,
        "_previous_available",
        None,
    )

    if created:
        return

    if previous_available is None:
        return

    if (
        previous_available > 0
        and available <= 0
    ):
        title = (
            "🚨 Rupture de stock"
        )

        body = (
            f"{instance.product.name} "
            f"est maintenant en rupture."
        )

        transaction.on_commit(
            lambda: (
                send_owner_notification(
                    title=title,
                    body=body,
                    url="/stock",
                    kind=(
                        NotificationLog
                        .Kind
                        .STOCK
                    ),
                    data={
                        "inventory_item_id": (
                            instance.pk
                        ),

                        "product_id": (
                            instance.product_id
                        ),

                        "available": (
                            available
                        ),
                    },
                )
            )
        )

        return

    if (
        previous_available
        > threshold
        and available > 0
        and available <= threshold
    ):
        title = (
            "⚠️ Stock faible"
        )

        body = (
            f"{instance.product.name} : "
            f"{available} disponible(s)."
        )

        transaction.on_commit(
            lambda: (
                send_owner_notification(
                    title=title,
                    body=body,
                    url="/stock",
                    kind=(
                        NotificationLog
                        .Kind
                        .STOCK
                    ),
                    data={
                        "inventory_item_id": (
                            instance.pk
                        ),

                        "product_id": (
                            instance.product_id
                        ),

                        "available": (
                            available
                        ),

                        "threshold": (
                            threshold
                        ),
                    },
                )
            )
        )