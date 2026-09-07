from django.db import transaction

from rest_framework import (
    permissions,
    status,
    viewsets,
)
from rest_framework.authentication import (
    SessionAuthentication,
    TokenAuthentication,
)
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsOwner
from promotions.models import Partner

from .partner_serializers import (
    OwnerPartnerSerializer,
)


OWNER_AUTHENTICATION = [
    TokenAuthentication,
    SessionAuthentication,
]

OWNER_PERMISSIONS = [
    permissions.IsAuthenticated,
    IsOwner,
]


class OwnerPartnerViewSet(
    viewsets.ModelViewSet
):
    authentication_classes = (
        OWNER_AUTHENTICATION
    )
    permission_classes = (
        OWNER_PERMISSIONS
    )
    serializer_class = (
        OwnerPartnerSerializer
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
            Partner.objects
            .all()
            .order_by(
                "display_order",
                "name",
            )
        )

    @action(
        detail=True,
        methods=["post"],
        url_path="toggle",
    )
    def toggle(self, request, pk=None):
        partner = self.get_object()
        partner.is_active = (
            not partner.is_active
        )
        partner.save(
            update_fields=[
                "is_active",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(
                partner
            ).data
        )

    @transaction.atomic
    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        partner = self.get_object()
        storage = None
        logo_name = ""

        if partner.logo and partner.logo.name:
            storage = partner.logo.storage
            logo_name = partner.logo.name

        partner.delete()

        if storage and logo_name:
            def remove_logo():
                if storage.exists(logo_name):
                    storage.delete(logo_name)

            transaction.on_commit(
                remove_logo
            )

        return Response(
            status=(
                status.HTTP_204_NO_CONTENT
            )
        )
