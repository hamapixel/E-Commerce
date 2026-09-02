import secrets

from django.db import transaction
from django.utils import timezone

from checkout.models import (
    CheckoutSession,
)

from checkout.services import (
    expire_checkout_session_if_needed,
)

from inventory.services import (
    InsufficientReservedStockError,
    consume_reserved_stock,
)

from .models import (
    Order,
    OrderItem,
    Payment,
)


class OrderError(Exception):
    pass


class OrderCheckoutNotFoundError(
    OrderError
):
    pass


class OrderCheckoutClosedError(
    OrderError
):
    pass


class OrderCheckoutExpiredError(
    OrderError
):
    pass


class OrderStockError(
    OrderError
):
    pass


class InvalidPaymentMethodError(
    OrderError
):
    pass


class PaymentError(
    OrderError
):
    pass


def _generate_order_number():
    date_part = (
        timezone.localtime()
        .strftime("%Y%m%d")
    )

    for _ in range(20):
        random_part = (
            secrets
            .token_hex(3)
            .upper()
        )

        number = (
            f"SK-{date_part}-"
            f"{random_part}"
        )

        if not Order.objects.filter(
            order_number=number
        ).exists():
            return number

    raise OrderError(
        "Impossible de gÃ©nÃ©rer un numÃ©ro de commande."
    )


def _generate_payment_reference():
    date_part = (
        timezone.localtime()
        .strftime("%Y%m%d")
    )

    for _ in range(20):
        random_part = (
            secrets
            .token_hex(4)
            .upper()
        )

        reference = (
            f"PAY-{date_part}-"
            f"{random_part}"
        )

        if not Payment.objects.filter(
            reference=reference
        ).exists():
            return reference

    raise PaymentError(
        "Impossible de gÃ©nÃ©rÃ©rer la rÃ©fÃ©rence paiement."
    )


def _validate_payment_method(
    checkout,
    payment_method,
):
    if (
        checkout.delivery_method
        == CheckoutSession
        .DeliveryMethod
        .DELIVERY
    ):
        expected = (
            Payment.Method
            .CASH_ON_DELIVERY
        )

        if payment_method != expected:
            raise InvalidPaymentMethodError(
                (
                    "Pour une livraison, "
                    "le mode autorisÃ© actuellement "
                    "est le paiement Ã  la livraison."
                )
            )

    elif (
        checkout.delivery_method
        == CheckoutSession
        .DeliveryMethod
        .PICKUP
    ):
        expected = (
            Payment.Method
            .PAY_AT_PICKUP
        )

        if payment_method != expected:
            raise InvalidPaymentMethodError(
                (
                    "Pour un retrait, "
                    "le mode autorisÃ© actuellement "
                    "est le paiement au retrait."
                )
            )


def create_order_from_checkout(
    *,
    checkout_id,
    payment_method,
):
    result = (
        _create_order_from_checkout_atomic(
            checkout_id=checkout_id,
            payment_method=payment_method,
        )
    )

    if result is None:
        raise OrderCheckoutExpiredError(
            (
                "Le checkout a expiré. "
                "Le stock réservé a été libéré."
            )
        )

    return result


@transaction.atomic
def _create_order_from_checkout_atomic(
    *,
    checkout_id,
    payment_method,
):
    try:
        checkout = (
            CheckoutSession.objects
            .select_for_update()
            .get(
                pk=checkout_id
            )
        )

    except CheckoutSession.DoesNotExist as exc:
        raise OrderCheckoutNotFoundError(
            "Checkout introuvable."
        ) from exc

    existing_order = (
        Order.objects
        .filter(
            checkout_session=checkout
        )
        .first()
    )

    if existing_order:
        return (
            existing_order,
            False,
        )

    if (
        checkout.status
        != CheckoutSession
        .Status
        .ACTIVE
    ):
        raise OrderCheckoutClosedError(
            (
                "Cette session checkout "
                "n'est plus active."
            )
        )

    if (
        checkout.expires_at
        <= timezone.now()
    ):
        # Expire et libère le stock dans la transaction.
        # Le wrapper lève ensuite l'exception après le commit.
        expire_checkout_session_if_needed(
            checkout.pk
        )

        return None

    _validate_payment_method(
        checkout,
        payment_method,
    )

    checkout_items = list(
        checkout.items
        .select_related(
            "product",
            "variant",
            "inventory_item",
        )
        .order_by(
            "inventory_item_id",
            "id",
        )
    )

    if not checkout_items:
        raise OrderError(
            "Le checkout ne contient aucun article."
        )

    order = Order.objects.create(
        order_number=(
            _generate_order_number()
        ),
        checkout_session=checkout,
        customer_name=(
            checkout.customer_name
        ),
        customer_phone=(
            checkout.customer_phone
        ),
        customer_whatsapp=(
            checkout.customer_whatsapp
        ),
        customer_email=(
            checkout.customer_email
        ),
        delivery_method=(
            checkout.delivery_method
        ),
        city=checkout.city,
        delivery_zone=(
            checkout.delivery_zone
        ),
        address=checkout.address,
        notes=checkout.notes,
        subtotal=checkout.subtotal,
        delivery_fee=(
            checkout.delivery_fee
        ),
        total=checkout.total,
    )

    stock_reference = (
        f"ORDER-{order.order_number}"
    )

    for checkout_item in checkout_items:
        try:
            consume_reserved_stock(
                checkout_item.inventory_item_id,
                checkout_item.quantity,
                reference=stock_reference,
                note=(
                    "Stock consommÃ© lors "
                    "de la confirmation "
                    "de la commande."
                ),
            )

        except (
            InsufficientReservedStockError
        ) as exc:
            raise OrderStockError(
                (
                    "Le stock rÃ©servÃ© n'est "
                    "plus suffisant pour "
                    f"{checkout_item.product_name}."
                )
            ) from exc

        OrderItem.objects.create(
            order=order,
            product=(
                checkout_item.product
            ),
            variant=(
                checkout_item.variant
            ),
            inventory_item=(
                checkout_item.inventory_item
            ),
            product_name=(
                checkout_item.product_name
            ),
            sku=checkout_item.sku,
            variant_label=(
                checkout_item.variant_label
            ),
            normal_price=(
                checkout_item.normal_price
            ),
            unit_price=(
                checkout_item.unit_price
            ),
            quantity=(
                checkout_item.quantity
            ),
            line_total=(
                checkout_item.line_total
            ),
        )

    Payment.objects.create(
        reference=(
            _generate_payment_reference()
        ),
        order=order,
        method=payment_method,
        status=(
            Payment.Status.PENDING
        ),
        amount=order.total,
        currency="XOF",
    )

    checkout.status = (
        CheckoutSession
        .Status
        .CONVERTED
    )

    checkout.save(
        update_fields=[
            "status",
            "updated_at",
        ]
    )

    return (
        order,
        True,
    )


@transaction.atomic
def mark_payment_paid(
    payment_id,
    *,
    user=None,
):
    try:
        payment = (
            Payment.objects
            .select_for_update()
            .select_related(
                "order"
            )
            .get(
                pk=payment_id
            )
        )

    except Payment.DoesNotExist as exc:
        raise PaymentError(
            "Paiement introuvable."
        ) from exc

    if (
        payment.status
        == Payment.Status.PAID
    ):
        return payment

    if (
        payment.status
        in {
            Payment.Status.CANCELLED,
            Payment.Status.REFUNDED,
        }
    ):
        raise PaymentError(
            (
                "Ce paiement ne peut "
                "plus Ãªtre marquÃ© comme payÃ©."
            )
        )

    payment.status = (
        Payment.Status.PAID
    )

    payment.paid_at = (
        timezone.now()
    )

    payment.recorded_by = user

    payment.save(
        update_fields=[
            "status",
            "paid_at",
            "recorded_by",
            "updated_at",
        ]
    )

    order = payment.order

    if (
        order.status
        == Order.Status.PENDING
    ):
        order.status = (
            Order.Status.CONFIRMED
        )

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

    return payment
