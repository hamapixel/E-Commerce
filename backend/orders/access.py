from django.core import signing


ORDER_ACCESS_SALT = (
    "sugu-kura-order-access"
)

ORDER_ACCESS_MAX_AGE_SECONDS = (
    60 * 60 * 24 * 90
)


def issue_order_access_token(order):
    return signing.dumps(
        {
            "order_id": str(order.pk),
        },
        salt=ORDER_ACCESS_SALT,
        compress=True,
    )


def validate_order_access_token(
    token,
    order_id,
):
    if not token:
        return False

    try:
        payload = signing.loads(
            token,
            salt=ORDER_ACCESS_SALT,
            max_age=(
                ORDER_ACCESS_MAX_AGE_SECONDS
            ),
        )
    except (
        signing.BadSignature,
        signing.SignatureExpired,
    ):
        return False

    return (
        str(payload.get("order_id"))
        == str(order_id)
    )
