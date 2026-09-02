from django.conf import settings

from rest_framework import (
    permissions,
    status,
)

from rest_framework.authentication import (
    SessionAuthentication,
    TokenAuthentication,
)

from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)

from rest_framework.response import (
    Response,
)

from accounts.permissions import (
    IsOwner,
)

from notifications.models import (
    NotificationLog,
    PushSubscription,
)

from notifications.services import (
    send_owner_notification,
)

from .serializers import (
    NotificationLogSerializer,
    PushSubscriptionSerializer,
    PushUnsubscribeSerializer,
)


OWNER_AUTH_CLASSES = [
    TokenAuthentication,
    SessionAuthentication,
]


OWNER_PERMISSIONS = [
    permissions.IsAuthenticated,
    IsOwner,
]


@api_view([
    "GET",
])
@authentication_classes(
    OWNER_AUTH_CLASSES
)
@permission_classes(
    OWNER_PERMISSIONS
)
def public_key(
    request,
):
    key = getattr(
        settings,
        "WEBPUSH_VAPID_PUBLIC_KEY",
        "",
    )

    if not key:
        return Response(
            {
                "detail": (
                    "Clé publique "
                    "VAPID non configurée."
                )
            },
            status=(
                status
                .HTTP_503_SERVICE_UNAVAILABLE
            ),
        )

    return Response(
        {
            "public_key": key,
        }
    )


@api_view([
    "POST",
])
@authentication_classes(
    OWNER_AUTH_CLASSES
)
@permission_classes(
    OWNER_PERMISSIONS
)
def subscribe(
    request,
):
    serializer = (
        PushSubscriptionSerializer(
            data=request.data
        )
    )

    serializer.is_valid(
        raise_exception=True
    )

    data = (
        serializer
        .validated_data
    )

    subscription, created = (
        PushSubscription
        .objects
        .update_or_create(
            endpoint=(
                data[
                    "endpoint"
                ]
            ),

            defaults={
                "user": (
                    request.user
                ),

                "p256dh": (
                    data[
                        "p256dh"
                    ]
                ),

                "auth": (
                    data[
                        "auth"
                    ]
                ),

                "user_agent": (
                    data.get(
                        "user_agent",
                        "",
                    )
                ),

                "is_active": True,

                "failure_count": 0,
            },
        )
    )

    return Response(
        {
            "detail": (
                "Notifications activées."
            ),

            "created": created,

            "subscription_id": (
                subscription.pk
            ),
        },

        status=(
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        ),
    )


@api_view([
    "POST",
])
@authentication_classes(
    OWNER_AUTH_CLASSES
)
@permission_classes(
    OWNER_PERMISSIONS
)
def unsubscribe(
    request,
):
    serializer = (
        PushUnsubscribeSerializer(
            data=request.data
        )
    )

    serializer.is_valid(
        raise_exception=True
    )

    endpoint = (
        serializer
        .validated_data[
            "endpoint"
        ]
    )

    PushSubscription.objects.filter(
        user=request.user,
        endpoint=endpoint,
    ).update(
        is_active=False
    )

    return Response(
        {
            "detail": (
                "Notifications désactivées."
            )
        }
    )


@api_view([
    "POST",
])
@authentication_classes(
    OWNER_AUTH_CLASSES
)
@permission_classes(
    OWNER_PERMISSIONS
)
def test_push(
    request,
):
    active_count = (
        PushSubscription
        .objects
        .filter(
            user=request.user,
            is_active=True,
        )
        .count()
    )

    if active_count == 0:
        return Response(
            {
                "detail": (
                    "Aucun appareil "
                    "n'est abonné."
                )
            },
            status=(
                status
                .HTTP_400_BAD_REQUEST
            ),
        )

    log = send_owner_notification(
        title=(
            "🔔 SUGU KURA"
        ),

        body=(
            "Les notifications Push "
            "fonctionnent correctement."
        ),

        url="/",

        kind=(
            NotificationLog
            .Kind
            .TEST
        ),
    )

    return Response(
        {
            "detail": (
                "Notification test "
                "envoyée."
            ),

            "status": (
                log.status
            ),

            "sent_count": (
                log.sent_count
            ),

            "failed_count": (
                log.failed_count
            ),
        }
    )


@api_view([
    "GET",
])
@authentication_classes(
    OWNER_AUTH_CLASSES
)
@permission_classes(
    OWNER_PERMISSIONS
)
def notification_history(
    request,
):
    queryset = (
        NotificationLog
        .objects
        .all()[:50]
    )

    serializer = (
        NotificationLogSerializer(
            queryset,
            many=True,
        )
    )

    return Response(
        serializer.data
    )