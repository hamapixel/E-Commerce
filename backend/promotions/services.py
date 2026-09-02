from decimal import (
    Decimal,
    ROUND_HALF_UP,
)

from django.db import transaction
from django.db.models import F, Q
from django.utils import timezone

from .models import (
    Advertisement,
    AdvertisementDailyStat,
    Promotion,
)


MONEY_STEP = Decimal("0.01")


def calculate_promotional_price(
    base_price,
    promotion,
):
    """
    Calcule le prix d'une promotion sans modifier
    le prix normal enregistré dans Product.
    """

    base_price = Decimal(
        base_price
    )

    value = Decimal(
        promotion.discount_value
    )

    if (
        promotion.discount_type
        == Promotion
        .DiscountType
        .PERCENTAGE
    ):
        discount = (
            base_price
            * value
            / Decimal("100")
        )

        result = (
            base_price
            - discount
        )

    elif (
        promotion.discount_type
        == Promotion
        .DiscountType
        .FIXED_AMOUNT
    ):
        result = (
            base_price
            - value
        )

    else:
        result = value

    if result < Decimal("0"):
        result = Decimal("0")

    return result.quantize(
        MONEY_STEP,
        rounding=ROUND_HALF_UP,
    )


def promotion_applies_to_product(
    promotion,
    product,
):
    """
    Vérifie si une promotion concerne un produit.
    """

    mode = promotion.target_mode

    if mode == Promotion.TargetMode.ALL:
        return True

    if (
        mode
        == Promotion.TargetMode.CATEGORY
    ):
        return (
            promotion.target_category_id
            == product.category_id
        )

    if (
        mode
        == Promotion.TargetMode.BRAND
    ):
        return (
            product.brand_id is not None
            and
            promotion.target_brand_id
            == product.brand_id
        )

    if (
        mode
        == Promotion.TargetMode.PRODUCTS
    ):
        return (
            promotion.products.filter(
                pk=product.pk
            ).exists()
        )

    return False


def get_active_promotions_for_product(
    product,
    *,
    at=None,
):
    """
    Promotions actuellement applicables au produit.
    """

    at = at or timezone.now()

    query = Q(
        target_mode=(
            Promotion.TargetMode.ALL
        )
    )

    query |= Q(
        target_mode=(
            Promotion.TargetMode.CATEGORY
        ),
        target_category=product.category,
    )

    if product.brand_id:
        query |= Q(
            target_mode=(
                Promotion.TargetMode.BRAND
            ),
            target_brand=product.brand,
        )

    query |= Q(
        target_mode=(
            Promotion.TargetMode.PRODUCTS
        ),
        products=product,
    )

    return (
        Promotion.objects
        .active_now(
            at=at
        )
        .filter(
            query
        )
        .distinct()
        .order_by(
            "-priority",
            "end_at",
        )
    )


def get_effective_price(
    product,
    *,
    variant=None,
    at=None,
):
    """
    Retourne :

    {
        normal_price,
        current_price,
        promotion,
        has_promotion
    }

    Les promotions ne sont PAS cumulées.

    Si plusieurs promotions correspondent au produit,
    le meilleur prix pour le client est choisi.
    """

    if variant is not None:
        normal_price = Decimal(
            variant.effective_price
        )

    else:
        normal_price = Decimal(
            product.base_price
        )

    best_price = normal_price
    best_promotion = None

    promotions = (
        get_active_promotions_for_product(
            product,
            at=at,
        )
    )

    for promotion in promotions:
        candidate = (
            calculate_promotional_price(
                normal_price,
                promotion,
            )
        )

        if candidate < best_price:
            best_price = candidate
            best_promotion = promotion

    return {
        "normal_price": normal_price,
        "current_price": best_price,
        "promotion": best_promotion,
        "has_promotion": (
            best_promotion is not None
        ),
    }


def get_active_advertisements(
    *,
    placement,
    category=None,
    at=None,
):
    """
    Publicités réellement diffusables.
    """

    return (
        Advertisement.objects
        .active_now(
            placement=placement,
            category=category,
            at=at,
        )
    )


@transaction.atomic
def record_ad_impression(
    advertisement_id,
):
    """
    Enregistre une impression sans modifier directement
    le modèle Advertisement.
    """

    today = timezone.localdate()

    stat, _ = (
        AdvertisementDailyStat
        .objects
        .get_or_create(
            advertisement_id=(
                advertisement_id
            ),
            date=today,
        )
    )

    (
        AdvertisementDailyStat
        .objects
        .filter(
            pk=stat.pk
        )
        .update(
            impressions=(
                F("impressions") + 1
            )
        )
    )

    stat.refresh_from_db()

    return stat


@transaction.atomic
def record_ad_click(
    advertisement_id,
):
    """
    Enregistre un clic publicitaire.
    """

    today = timezone.localdate()

    stat, _ = (
        AdvertisementDailyStat
        .objects
        .get_or_create(
            advertisement_id=(
                advertisement_id
            ),
            date=today,
        )
    )

    (
        AdvertisementDailyStat
        .objects
        .filter(
            pk=stat.pk
        )
        .update(
            clicks=(
                F("clicks") + 1
            )
        )
    )

    stat.refresh_from_db()

    return stat