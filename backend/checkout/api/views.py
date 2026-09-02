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
    CheckoutCreateThrottle,
)

from checkout.models import (
    CheckoutSession,
)

from checkout.services import (
    CheckoutError,
    cancel_checkout_session,
    create_checkout_session,
    expire_checkout_session_if_needed,
)

from .serializers import (
    CheckoutCreateSerializer,
    CheckoutSessionSerializer,
)


class CheckoutSessionViewSet(
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    API publique checkout.

    Pas de liste publique des sessions
    pour protÃ©ger les informations clients.
    """

    permission_classes = [
        permissions.AllowAny
    ]

    http_method_names = [
        "get",
        "post",
        "delete",
        "head",
        "options",
    ]

    lookup_field = "pk"

    def get_throttles(self):
        if self.action == "create":
            return [
                CheckoutCreateThrottle()
            ]

        return super().get_throttles()

    def get_queryset(self):
        return (
            CheckoutSession.objects
            .prefetch_related(
                "items",
                "items__product",
            )
        )

    def get_serializer_class(self):
        if self.action == "create":
            return (
                CheckoutCreateSerializer
            )

        return (
            CheckoutSessionSerializer
        )

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):
        serializer = (
            CheckoutCreateSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        validated = (
            serializer.validated_data
        )

        try:
            session = (
                create_checkout_session(
                    customer_name=(
                        validated[
                            "customer_name"
                        ]
                    ),
                    customer_phone=(
                        validated[
                            "customer_phone"
                        ]
                    ),
                    customer_whatsapp=(
                        validated.get(
                            "customer_whatsapp",
                            "",
                        )
                    ),
                    customer_email=(
                        validated.get(
                            "customer_email",
                            "",
                        )
                    ),
                    delivery_method=(
                        validated[
                            "delivery_method"
                        ]
                    ),
                    city=(
                        validated.get(
                            "city",
                            "Bamako",
                        )
                    ),
                    delivery_zone=(
                        validated.get(
                            "delivery_zone",
                            "",
                        )
                    ),
                    address=(
                        validated.get(
                            "address",
                            "",
                        )
                    ),
                    notes=(
                        validated.get(
                            "notes",
                            "",
                        )
                    ),
                    lines=(
                        validated[
                            "items"
                        ]
                    ),
                )
            )

        except CheckoutError as exc:
            return Response(
                {
                    "detail": str(
                        exc
                    )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        output = (
            CheckoutSessionSerializer(
                session,
                context={
                    "request": request
                },
            )
        )

        return Response(
            output.data,
            status=(
                status
                .HTTP_201_CREATED
            ),
        )

    def retrieve(
        self,
        request,
        *args,
        **kwargs,
    ):
        session = (
            self.get_object()
        )

        try:
            session = (
                expire_checkout_session_if_needed(
                    session.pk
                )
            )

        except CheckoutError as exc:
            return Response(
                {
                    "detail": str(
                        exc
                    )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        session = (
            self.get_queryset()
            .get(
                pk=session.pk
            )
        )

        serializer = (
            CheckoutSessionSerializer(
                session,
                context={
                    "request": request
                },
            )
        )

        return Response(
            serializer.data
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        session = (
            self.get_object()
        )

        try:
            session = (
                cancel_checkout_session(
                    session.pk
                )
            )

        except CheckoutError as exc:
            return Response(
                {
                    "detail": str(
                        exc
                    )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        return Response(
            {
                "status": (
                    session.status
                ),
                "detail": (
                    "Session checkout annulÃ©e."
                ),
            },
            status=status.HTTP_200_OK,
        )
