import re

from rest_framework import (
    mixins,
    permissions,
    status,
    viewsets,
)
from rest_framework.decorators import (
    action,
)

from rest_framework.response import (
    Response,
)

from core.throttles import (
    OrderCreateThrottle,
    OrderTrackingThrottle,
)

from orders.access import (
    issue_order_access_token,
    validate_order_access_token,
)
from orders.models import (
    Order,
)

from orders.services import (
    OrderError,
    create_order_from_checkout,
)

from .serializers import (
    OrderCreateSerializer,
    OrderSerializer,
    OrderTrackingInputSerializer,
)


def _normalize_phone(
    value,
):
    return re.sub(
        r"\D+",
        "",
        str(value or ""),
    )


def _serialize_order_with_access(
    order,
    request,
):
    output = OrderSerializer(
        order,
        context={
            "request": request
        },
    )

    data = dict(output.data)
    data["access_token"] = (
        issue_order_access_token(
            order
        )
    )

    return data


class OrderViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [
        permissions.AllowAny
    ]

    http_method_names = [
        "get",
        "post",
        "head",
        "options",
    ]

    def get_throttles(self):
        if self.action == "create":
            return [
                OrderCreateThrottle()
            ]

        if self.action == "track":
            return [
                OrderTrackingThrottle()
            ]

        return super().get_throttles()

    def get_queryset(self):
        return (
            Order.objects
            .select_related(
                "checkout_session"
            )
            .prefetch_related(
                "items",
                "items__product",
                "payments",
            )
        )

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer

        if self.action == "track":
            return (
                OrderTrackingInputSerializer
            )

        return OrderSerializer

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):
        serializer = (
            OrderCreateSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        try:
            order, created = (
                create_order_from_checkout(
                    checkout_id=(
                        data["checkout_id"]
                    ),
                    payment_method=(
                        data[
                            "payment_method"
                        ]
                    ),
                )
            )

        except OrderError as exc:
            return Response(
                {
                    "detail": str(exc)
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        order = (
            self.get_queryset()
            .get(
                pk=order.pk
            )
        )

        return Response(
            _serialize_order_with_access(
                order,
                request,
            ),
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )

    def retrieve(
        self,
        request,
        *args,
        **kwargs,
    ):
        order = self.get_object()

        access_token = (
            request.headers.get(
                "X-Order-Access-Token",
                "",
            )
        )

        if not validate_order_access_token(
            access_token,
            order.pk,
        ):
            return Response(
                {
                    "detail": (
                        "Commande introuvable ou accès expiré. "
                        "Vérifiez de nouveau la commande avec "
                        "son numéro et le téléphone utilisé."
                    )
                },
                status=(
                    status
                    .HTTP_404_NOT_FOUND
                ),
            )

        output = OrderSerializer(
            order,
            context={
                "request": request
            },
        )

        return Response(
            output.data
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="track",
    )
    def track(
        self,
        request,
    ):
        serializer = (
            OrderTrackingInputSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        order = (
            self.get_queryset()
            .filter(
                order_number__iexact=(
                    data[
                        "order_number"
                    ]
                )
            )
            .first()
        )

        supplied_phone = (
            _normalize_phone(
                data[
                    "customer_phone"
                ]
            )
        )

        if (
            not order
            or _normalize_phone(
                order.customer_phone
            ) != supplied_phone
        ):
            return Response(
                {
                    "detail": (
                        "Commande introuvable. "
                        "Vérifiez le numéro de commande "
                        "et le téléphone utilisé lors de l'achat."
                    )
                },
                status=(
                    status
                    .HTTP_404_NOT_FOUND
                ),
            )

        return Response(
            _serialize_order_with_access(
                order,
                request,
            )
        )
