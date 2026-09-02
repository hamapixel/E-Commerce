from decimal import Decimal

from django.contrib.auth import authenticate

from django.db.models import (
    F,
    Q,
    Sum,
)

from django.utils import timezone

from rest_framework import (
    mixins,
    permissions,
    status,
    viewsets,
)

from rest_framework.authentication import (
    SessionAuthentication,
    TokenAuthentication,
)

from rest_framework.authtoken.models import (
    Token,
)

from rest_framework.decorators import (
    action,
    api_view,
    authentication_classes,
    permission_classes,
    throttle_classes,
)

from rest_framework.response import (
    Response,
)

from accounts.permissions import (
    IsOwner,
)

from catalog.models import (
    Brand,
    Category,
    Product,
)

from checkout.models import (
    CheckoutSession,
)

from inventory.models import (
    InventoryItem,
)

from orders.api.serializers import (
    OrderSerializer,
    PaymentSerializer,
)

from orders.models import (
    Order,
    Payment,
)

from orders.services import (
    PaymentError,
    mark_payment_paid,
)

from promotions.models import (
    Advertisement,
    AdvertisementDailyStat,
    Partner,
    Promotion,
)

from .serializers import (
    AdvertisementOwnerSerializer,
    OwnerLoginSerializer,
)

from core.throttles import (
    OwnerLoginThrottle,
)


OWNER_AUTHENTICATION = [
    TokenAuthentication,
    SessionAuthentication,
]


def _active_count(
    model,
):
    field_names = {
        field.name
        for field
        in model._meta.fields
    }

    queryset = model.objects.all()

    if "is_active" in field_names:
        queryset = queryset.filter(
            is_active=True
        )

    return queryset.count()


def _marketing_totals():
    field_names = {
        field.name
        for field
        in AdvertisementDailyStat
        ._meta
        .fields
    }

    aggregations = {}

    if "impressions" in field_names:
        aggregations[
            "impressions"
        ] = Sum(
            "impressions"
        )

    if "clicks" in field_names:
        aggregations[
            "clicks"
        ] = Sum(
            "clicks"
        )

    if "orders" in field_names:
        aggregations[
            "orders"
        ] = Sum(
            "orders"
        )

    if "revenue" in field_names:
        aggregations[
            "revenue"
        ] = Sum(
            "revenue"
        )

    result = (
        AdvertisementDailyStat
        .objects
        .aggregate(
            **aggregations
        )
        if aggregations
        else {}
    )

    impressions = (
        result.get(
            "impressions"
        )
        or 0
    )

    clicks = (
        result.get(
            "clicks"
        )
        or 0
    )

    orders = (
        result.get(
            "orders"
        )
        or 0
    )

    revenue = (
        result.get(
            "revenue"
        )
        or Decimal("0.00")
    )

    ctr = (
        round(
            (
                float(clicks)
                / float(impressions)
            )
            * 100,
            2,
        )
        if impressions
        else 0
    )

    return {
        "impressions": impressions,
        "clicks": clicks,
        "ctr": ctr,
        "orders": orders,
        "revenue": str(
            revenue
        ),
    }


@api_view([
    "POST",
])
@authentication_classes([])
@permission_classes([
    permissions.AllowAny,
])
@throttle_classes([
    OwnerLoginThrottle,
])
def owner_login(
    request,
):
    serializer = OwnerLoginSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    username = (
        serializer
        .validated_data[
            "username"
        ]
    )

    password = (
        serializer
        .validated_data[
            "password"
        ]
    )

    user = authenticate(
        request=request,
        username=username,
        password=password,
    )

    if (
        user is None
        or not user.is_active
    ):
        return Response(
            {
                "detail": (
                    "Identifiants incorrects."
                )
            },
            status=(
                status
                .HTTP_400_BAD_REQUEST
            ),
        )

    if not user.is_owner:
        # Même réponse qu'un username/mot de passe incorrect.
        # Cela évite de révéler qu'un compte non-OWNER existe.
        return Response(
            {
                "detail": (
                    "Identifiants incorrects."
                )
            },
            status=(
                status
                .HTTP_400_BAD_REQUEST
            ),
        )

    Token.objects.filter(
        user=user
    ).delete()

    token = Token.objects.create(
        user=user
    )

    return Response(
        {
            "token": token.key,

            "user": {
                "id": user.pk,
                "username": (
                    user.username
                ),
                "email": (
                    user.email
                ),
                "role": (
                    user.role
                ),
                "display_name": (
                    user.display_name
                ),
            },
        }
    )


@api_view([
    "POST",
])
@authentication_classes(
    OWNER_AUTHENTICATION
)
@permission_classes([
    permissions.IsAuthenticated,
    IsOwner,
])
def owner_logout(
    request,
):
    if (
        request.auth
        and hasattr(
            request.auth,
            "delete",
        )
    ):
        request.auth.delete()

    return Response(
        {
            "detail": (
                "DÃ©connexion rÃ©ussie."
            )
        }
    )


@api_view([
    "GET",
])
@authentication_classes(
    OWNER_AUTHENTICATION
)
@permission_classes([
    permissions.IsAuthenticated,
    IsOwner,
])
def owner_me(
    request,
):
    user = request.user

    return Response(
        {
            "id": user.pk,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "display_name": (
                user.display_name
            ),
        }
    )


@api_view([
    "GET",
])
@authentication_classes(
    OWNER_AUTHENTICATION
)
@permission_classes([
    permissions.IsAuthenticated,
    IsOwner,
])
def dashboard_summary(
    request,
):
    today = (
        timezone.localdate()
    )

    paid_revenue = (
        Payment.objects
        .filter(
            status=(
                Payment.Status.PAID
            )
        )
        .aggregate(
            total=Sum(
                "amount"
            )
        )["total"]
        or Decimal("0.00")
    )

    pending_amount = (
        Payment.objects
        .filter(
            status=(
                Payment.Status.PENDING
            )
        )
        .aggregate(
            total=Sum(
                "amount"
            )
        )["total"]
        or Decimal("0.00")
    )

    today_total = (
        Order.objects
        .filter(
            created_at__date=(
                today
            )
        )
        .aggregate(
            total=Sum(
                "total"
            )
        )["total"]
        or Decimal("0.00")
    )

    stock_queryset = (
        InventoryItem.objects
        .annotate(
            calculated_available=(
                F(
                    "quantity_on_hand"
                )
                - F(
                    "quantity_reserved"
                )
            )
        )
    )

    low_stock_count = (
        stock_queryset
        .filter(
            calculated_available__gt=0,
            calculated_available__lte=F(
                "low_stock_threshold"
            ),
        )
        .count()
    )

    out_of_stock_count = (
        stock_queryset
        .filter(
            calculated_available__lte=0
        )
        .count()
    )

    processing_statuses = [
        Order.Status.CONFIRMED,
        Order.Status.PREPARING,
        Order.Status.READY,
        Order.Status.SHIPPED,
    ]

    return Response(
        {
            "orders": {
                "total": (
                    Order.objects.count()
                ),

                "today": (
                    Order.objects
                    .filter(
                        created_at__date=(
                            today
                        )
                    )
                    .count()
                ),

                "pending": (
                    Order.objects
                    .filter(
                        status=(
                            Order.Status.PENDING
                        )
                    )
                    .count()
                ),

                "processing": (
                    Order.objects
                    .filter(
                        status__in=(
                            processing_statuses
                        )
                    )
                    .count()
                ),

                "delivered": (
                    Order.objects
                    .filter(
                        status=(
                            Order.Status.DELIVERED
                        )
                    )
                    .count()
                ),
            },

            "money": {
                "paid_revenue": str(
                    paid_revenue
                ),

                "pending_amount": str(
                    pending_amount
                ),

                "today_order_total": str(
                    today_total
                ),
            },

            "catalog": {
                "products": (
                    Product.objects.count()
                ),

                "active_products": (
                    Product.objects
                    .filter(
                        status=(
                            Product.Status.ACTIVE
                        )
                    )
                    .count()
                ),

                "categories": (
                    Category.objects.count()
                ),

                "brands": (
                    Brand.objects.count()
                ),
            },

            "inventory": {
                "low_stock": (
                    low_stock_count
                ),

                "out_of_stock": (
                    out_of_stock_count
                ),
            },

            "checkout": {
                "active": (
                    CheckoutSession
                    .objects
                    .filter(
                        status=(
                            CheckoutSession
                            .Status
                            .ACTIVE
                        )
                    )
                    .count()
                ),
            },

            "marketing": {
                "active_promotions": (
                    _active_count(
                        Promotion
                    )
                ),

                "active_ads": (
                    _active_count(
                        Advertisement
                    )
                ),

                "active_partners": (
                    _active_count(
                        Partner
                    )
                ),

                **_marketing_totals(),
            },
        }
    )


class OwnerOrderViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    authentication_classes = (
        OWNER_AUTHENTICATION
    )

    permission_classes = [
        permissions.IsAuthenticated,
        IsOwner,
    ]

    pagination_class = None

    serializer_class = (
        OrderSerializer
    )

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
            .order_by(
                "-created_at"
            )
        )

    @action(
        detail=True,
        methods=[
            "post",
        ],
        url_path="set-status",
    )
    def set_status(
        self,
        request,
        pk=None,
    ):
        order = self.get_object()

        new_status = (
            request.data.get(
                "status"
            )
        )

        allowed = {
            Order.Status.PENDING,
            Order.Status.CONFIRMED,
            Order.Status.PREPARING,
            Order.Status.READY,
            Order.Status.SHIPPED,
            Order.Status.DELIVERED,
        }

        if new_status not in allowed:
            return Response(
                {
                    "detail": (
                        "Statut de commande "
                        "non autorisÃ©."
                    )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        order.status = new_status

        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            OrderSerializer(
                order,
                context={
                    "request": request
                },
            ).data
        )


class OwnerPaymentViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    authentication_classes = (
        OWNER_AUTHENTICATION
    )

    permission_classes = [
        permissions.IsAuthenticated,
        IsOwner,
    ]

    pagination_class = None

    serializer_class = (
        PaymentSerializer
    )

    def get_queryset(self):
        return (
            Payment.objects
            .select_related(
                "order"
            )
            .order_by(
                "-created_at"
            )
        )

    @action(
        detail=True,
        methods=[
            "post",
        ],
        url_path="mark-paid",
    )
    def mark_paid(
        self,
        request,
        pk=None,
    ):
        payment = self.get_object()

        try:
            payment = (
                mark_payment_paid(
                    payment.pk,
                    user=request.user,
                )
            )

        except PaymentError as exc:
            return Response(
                {
                    "detail": str(exc)
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        return Response(
            PaymentSerializer(
                payment,
                context={
                    "request": request
                },
            ).data
        )


@api_view([
    "GET",
])
@authentication_classes(
    OWNER_AUTHENTICATION
)
@permission_classes([
    permissions.IsAuthenticated,
    IsOwner,
])
def inventory_alerts(
    request,
):
    queryset = (
        InventoryItem.objects
        .select_related(
            "product",
            "variant",
            "product__brand",
            "product__category",
        )
        .annotate(
            calculated_available=(
                F(
                    "quantity_on_hand"
                )
                - F(
                    "quantity_reserved"
                )
            )
        )
        .filter(
            Q(
                calculated_available__lte=F(
                    "low_stock_threshold"
                )
            )
        )
        .order_by(
            "calculated_available",
            "product__name",
        )
    )

    results = []

    for item in queryset:
        results.append(
            {
                "id": item.pk,

                "product_id": (
                    item.product_id
                ),

                "product_name": (
                    item.product.name
                ),

                "sku": (
                    item.variant.sku
                    if item.variant
                    else item.product.sku
                ),

                "variant": (
                    str(
                        item.variant
                    )
                    if item.variant
                    else ""
                ),

                "quantity_on_hand": (
                    item.quantity_on_hand
                ),

                "quantity_reserved": (
                    item.quantity_reserved
                ),

                "available": (
                    item.calculated_available
                ),

                "low_stock_threshold": (
                    item.low_stock_threshold
                ),

                "status": (
                    "OUT_OF_STOCK"
                    if item.calculated_available
                    <= 0
                    else "LOW_STOCK"
                ),
            }
        )

    return Response(
        results
    )


@api_view([
    "GET",
])
@authentication_classes(
    OWNER_AUTHENTICATION
)
@permission_classes([
    permissions.IsAuthenticated,
    IsOwner,
])
def marketing_summary(
    request,
):
    return Response(
        {
            "active_promotions": (
                _active_count(
                    Promotion
                )
            ),

            "active_ads": (
                _active_count(
                    Advertisement
                )
            ),

            "active_partners": (
                _active_count(
                    Partner
                )
            ),

            **_marketing_totals(),
        }
    )


class OwnerAdvertisementViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    authentication_classes = (
        OWNER_AUTHENTICATION
    )

    permission_classes = [
        permissions.IsAuthenticated,
        IsOwner,
    ]

    pagination_class = None

    serializer_class = (
        AdvertisementOwnerSerializer
    )

    queryset = (
        Advertisement.objects
        .all()
        .order_by(
            "-pk"
        )
    )

    @action(
        detail=True,
        methods=[
            "post",
        ],
        url_path="toggle",
    )
    def toggle(
        self,
        request,
        pk=None,
    ):
        advertisement = (
            self.get_object()
        )

        field_names = {
            field.name
            for field
            in Advertisement
            ._meta
            .fields
        }

        if (
            "is_active"
            not in field_names
        ):
            return Response(
                {
                    "detail": (
                        "Le modÃ¨le publicitÃ© "
                        "ne possÃ¨de pas "
                        "le champ is_active."
                    )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        advertisement.is_active = (
            not advertisement.is_active
        )

        advertisement.save(
            update_fields=[
                "is_active"
            ]
        )

        return Response(
            AdvertisementOwnerSerializer(
                advertisement,
                context={
                    "request": request
                },
            ).data
        )
