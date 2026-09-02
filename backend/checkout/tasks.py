from celery import shared_task

from .services import (
    expire_due_checkout_sessions,
)


@shared_task
def expire_checkout_sessions():
    """
    Libère automatiquement les réservations
    des sessions checkout expirées.
    """

    return (
        expire_due_checkout_sessions()
    )