from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import serializers
from rest_framework.authentication import (
    SessionAuthentication,
    TokenAuthentication,
)
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsOwner
from catalog.models import Product
from promotions.models import Promotion


class OwnerProductPromotionInputSerializer(
    serializers.Serializer
):
    enabled = serializers.BooleanField()

    price = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        required=False,
        allow_null=True,
        min_value=Decimal("0.01"),
    )

    start_at = serializers.DateTimeField(
        required=False,
        allow_null=True,
    )

    end_at = serializers.DateTimeField(
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        if not attrs.get("enabled"):
            return attrs

        product = self.context["product"]
        price = attrs.get("price")
        start_at = attrs.get("start_at")
        end_at = attrs.get("end_at")

        errors = {}

        if price is None:
            errors["price"] = (
                "Saisissez le nouveau prix promotionnel."
            )
        elif price >= product.base_price:
            errors["price"] = (
                "Le prix promotionnel doit être inférieur "
                "au prix normal."
            )

        if start_at is None:
            errors["start_at"] = (
                "Choisissez la date de début."
            )

        if end_at is None:
            errors["end_at"] = (
                "Choisissez la date de fin."
            )

        if (
            start_at is not None
            and end_at is not None
            and end_at <= start_at
        ):
            errors["end_at"] = (
                "La date de fin doit être après le début."
            )

        if errors:
            raise serializers.ValidationError(errors)

        return attrs


def _promotion_slug(product_id):
    return f"owner-product-{product_id}"


def _serialize_promotion(product, promotion):
    if promotion is None:
        return {
            "enabled": False,
            "price": None,
            "start_at": None,
            "end_at": None,
            "is_current": False,
            "percentage": None,
        }

    percentage = None

    try:
        normal = Decimal(product.base_price)
        promo_price = Decimal(promotion.discount_value)

        if normal > 0 and promo_price < normal:
            percentage = int(
                ((normal - promo_price) / normal * 100)
                .quantize(Decimal("1"))
            )
    except Exception:
        percentage = None

    return {
        "enabled": bool(promotion.is_active),
        "price": f"{promotion.discount_value:.2f}",
        "start_at": promotion.start_at,
        "end_at": promotion.end_at,
        "is_current": bool(promotion.is_current),
        "percentage": percentage,
    }


@api_view(["GET", "PUT"])
@authentication_classes([
    TokenAuthentication,
    SessionAuthentication,
])
@permission_classes([
    IsAuthenticated,
    IsOwner,
])
def owner_product_promotion(
    request,
    product_id,
):
    product = get_object_or_404(
        Product,
        pk=product_id,
    )

    slug = _promotion_slug(product.pk)

    promotion = (
        Promotion.objects
        .filter(slug=slug)
        .first()
    )

    if request.method == "GET":
        return Response(
            _serialize_promotion(
                product,
                promotion,
            )
        )

    serializer = (
        OwnerProductPromotionInputSerializer(
            data=request.data,
            context={
                "product": product,
            },
        )
    )

    serializer.is_valid(
        raise_exception=True
    )

    data = serializer.validated_data

    with transaction.atomic():
        if not data["enabled"]:
            if promotion is not None:
                promotion.is_active = False
                promotion.save(
                    update_fields=[
                        "is_active",
                        "updated_at",
                    ]
                )

            return Response(
                _serialize_promotion(
                    product,
                    promotion,
                )
            )

        defaults = {
            "name": (
                f"Promotion rapide — {product.name}"
            ),
            "campaign_type": (
                Promotion.CampaignType.STANDARD
            ),
            "discount_type": (
                Promotion.DiscountType.FIXED_PRICE
            ),
            "discount_value": data["price"],
            "target_mode": (
                Promotion.TargetMode.PRODUCTS
            ),
            "badge_text": "PROMO",
            "start_at": data["start_at"],
            "end_at": data["end_at"],
            "priority": 100,
            "is_active": True,
        }

        if promotion is None:
            promotion = Promotion(
                slug=slug,
                **defaults,
            )
        else:
            for field, value in defaults.items():
                setattr(
                    promotion,
                    field,
                    value,
                )

        promotion.save()
        promotion.products.set([product])

    return Response(
        _serialize_promotion(
            product,
            promotion,
        )
    )
