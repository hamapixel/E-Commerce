from rest_framework import (
    permissions,
    viewsets,
)
from rest_framework.authentication import (
    SessionAuthentication,
    TokenAuthentication,
)

from accounts.permissions import IsOwner
from checkout.models import (
    DeliveryZone,
)

from .delivery_serializers import (
    OwnerDeliveryZoneSerializer,
)


OWNER_AUTHENTICATION = [
    TokenAuthentication,
    SessionAuthentication,
]

OWNER_PERMISSIONS = [
    permissions.IsAuthenticated,
    IsOwner,
]


class OwnerDeliveryZoneViewSet(
    viewsets.ModelViewSet
):
    authentication_classes = (
        OWNER_AUTHENTICATION
    )
    permission_classes = (
        OWNER_PERMISSIONS
    )
    serializer_class = (
        OwnerDeliveryZoneSerializer
    )
    pagination_class = None
    http_method_names = [
        "get",
        "post",
        "patch",
        "delete",
        "head",
        "options",
    ]

    def get_queryset(self):
        return (
            DeliveryZone.objects
            .all()
            .order_by(
                "display_order",
                "city",
                "name",
            )
        )
