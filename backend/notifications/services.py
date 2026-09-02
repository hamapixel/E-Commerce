import json
import logging

from django.conf import settings

from django.contrib.auth import (
    get_user_model,
)

from django.utils import timezone

from pywebpush import (
    WebPushException,
    webpush,
)

from .models import (
    NotificationLog,
    PushSubscription,
)


logger = logging.getLogger(
    __name__
)


def webpush_is_configured():
    return bool(
        getattr(
            settings,
            "WEBPUSH_VAPID_PUBLIC_KEY",
            "",
        )
        and getattr(
            settings,
            "WEBPUSH_VAPID_PRIVATE_KEY",
            "",
        )
        and getattr(
            settings,
            "WEBPUSH_VAPID_SUBJECT",
            "",
        )
    )


def send_push_to_subscription(
    subscription,
    payload,
):
    if not webpush_is_configured():
        return (
            False,
            "VAPID_NOT_CONFIGURED",
        )

    try:
        webpush(
            subscription_info=(
                subscription
                .subscription_info
            ),

            data=json.dumps(
                payload,
                ensure_ascii=False,
            ),

            vapid_private_key=(
                settings
                .WEBPUSH_VAPID_PRIVATE_KEY
            ),

            vapid_claims={
                "sub": (
                    settings
                    .WEBPUSH_VAPID_SUBJECT
                ),
            },

            ttl=86400,

            timeout=10,
        )

    except WebPushException as exc:
        response = getattr(
            exc,
            "response",
            None,
        )

        status_code = getattr(
            response,
            "status_code",
            None,
        )

        subscription.failure_count += 1

        update_fields = [
            "failure_count",
            "updated_at",
        ]

        if status_code in {
            404,
            410,
        }:
            subscription.is_active = False

            update_fields.append(
                "is_active"
            )

        subscription.save(
            update_fields=(
                update_fields
            )
        )

        logger.warning(
            (
                "Échec Web Push "
                "subscription=%s "
                "status=%s error=%s"
            ),
            subscription.pk,
            status_code,
            exc,
        )

        return (
            False,
            str(exc),
        )

    except Exception as exc:
        subscription.failure_count += 1

        subscription.save(
            update_fields=[
                "failure_count",
                "updated_at",
            ]
        )

        logger.exception(
            "Erreur Web Push : %s",
            exc,
        )

        return (
            False,
            str(exc),
        )

    subscription.failure_count = 0

    subscription.last_success_at = (
        timezone.now()
    )

    subscription.save(
        update_fields=[
            "failure_count",
            "last_success_at",
            "updated_at",
        ]
    )

    return (
        True,
        "",
    )


def send_owner_notification(
    *,
    title,
    body,
    url="/",
    kind=NotificationLog.Kind.SYSTEM,
    data=None,
):
    User = get_user_model()

    subscriptions = (
        PushSubscription
        .objects
        .select_related(
            "user"
        )
        .filter(
            user__is_active=True,
            user__role=(
                User.Role.OWNER
            ),
            is_active=True,
        )
    )

    subscriptions_count = (
        subscriptions.count()
    )

    log = NotificationLog.objects.create(
        kind=kind,
        title=title,
        body=body,
        url=url,
        data=data or {},
        subscribers_count=(
            subscriptions_count
        ),
    )

    if subscriptions_count == 0:
        log.status = (
            NotificationLog
            .Status
            .NO_SUBSCRIBER
        )

        log.save(
            update_fields=[
                "status",
            ]
        )

        return log

    if not webpush_is_configured():
        log.failed_count = (
            subscriptions_count
        )

        log.status = (
            NotificationLog
            .Status
            .FAILED
        )

        log.save(
            update_fields=[
                "failed_count",
                "status",
            ]
        )

        return log

    payload = {
        "title": title,
        "body": body,
        "url": url,
        "kind": kind,
        "data": data or {},
    }

    sent_count = 0
    failed_count = 0

    for subscription in (
        subscriptions.iterator()
    ):
        success, _error = (
            send_push_to_subscription(
                subscription,
                payload,
            )
        )

        if success:
            sent_count += 1

        else:
            failed_count += 1

    log.sent_count = sent_count
    log.failed_count = failed_count

    if sent_count > 0 and (
        failed_count == 0
    ):
        log.status = (
            NotificationLog
            .Status
            .SENT
        )

    elif sent_count > 0:
        log.status = (
            NotificationLog
            .Status
            .PARTIAL
        )

    else:
        log.status = (
            NotificationLog
            .Status
            .FAILED
        )

    log.save(
        update_fields=[
            "sent_count",
            "failed_count",
            "status",
        ]
    )

    return log