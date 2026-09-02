from rest_framework import (
    mixins,
    permissions,
    status,
    viewsets,
)

from rest_framework.response import (
    Response,
)

from core.throttles import (
    OrderCreateThrottle,
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
)


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

        output = OrderSerializer(
            order,
            context={
                "request": request
            },
        )

        return Response(
            output.data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )
