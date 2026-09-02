from django.shortcuts import get_object_or_404

from rest_framework import (
    permissions,
    status,
    viewsets,
)

from rest_framework.decorators import action

from rest_framework.response import Response

from catalog.models import Category

from promotions.models import (
    Advertisement,
    Partner,
    Promotion,
)

from promotions.services import (
    record_ad_click,
    record_ad_impression,
)

from .serializers import (
    AdvertisementSerializer,
    PartnerSerializer,
    PromotionSerializer,
)


class ActivePromotionViewSet(
    viewsets.ReadOnlyModelViewSet
):
    """
    Promotions actives actuellement.

    Cette API n'est volontairement pas paginée :
    le frontend doit pouvoir récupérer directement
    les campagnes actives pour afficher les badges,
    compteurs et blocs promotionnels.
    """

    permission_classes = [
        permissions.AllowAny,
    ]

    http_method_names = [
        "get",
        "head",
        "options",
    ]

    pagination_class = None

    serializer_class = (
        PromotionSerializer
    )

    def get_queryset(self):
        return (
            Promotion.objects
            .active_now()
            .select_related(
                "target_category",
                "target_brand",
            )
            .prefetch_related(
                "products",
            )
            .order_by(
                "-priority",
                "end_at",
            )
        )


class AdvertisementViewSet(
    viewsets.ReadOnlyModelViewSet
):
    """
    Publicités actuellement diffusables.

    Pas de pagination :
    le frontend doit recevoir directement les
    publicités d'un emplacement pour construire
    son slider/carrousel.
    """

    permission_classes = [
        permissions.AllowAny,
    ]

    serializer_class = (
        AdvertisementSerializer
    )

    pagination_class = None

    http_method_names = [
        "get",
        "post",
        "head",
        "options",
    ]

    def get_queryset(self):
        placement = (
            self.request
            .query_params
            .get(
                "placement"
            )
        )

        category_slug = (
            self.request
            .query_params
            .get(
                "category"
            )
        )

        category = None

        if category_slug:
            category = get_object_or_404(
                Category,
                slug=category_slug,
                is_active=True,
            )

        return (
            Advertisement.objects
            .active_now(
                placement=placement,
                category=category,
            )
            .select_related(
                "promotion",
                "promotion__target_category",
                "promotion__target_brand",
                "destination_product",
                "destination_category",
                "destination_brand",
            )
            .prefetch_related(
                "promotion__products",
                "target_categories",
            )
        )

    @action(
        detail=True,
        methods=[
            "post",
        ],
        url_path="impression",
    )
    def impression(
        self,
        request,
        pk=None,
    ):
        """
        Enregistre une impression publicitaire.
        """

        advertisement = (
            self.get_object()
        )

        stat = record_ad_impression(
            advertisement.pk
        )

        return Response(
            {
                "status": "ok",
                "advertisement_id": (
                    advertisement.pk
                ),
                "impressions": (
                    stat.impressions
                ),
            },
            status=(
                status.HTTP_200_OK
            ),
        )

    @action(
        detail=True,
        methods=[
            "post",
        ],
        url_path="click",
    )
    def click(
        self,
        request,
        pk=None,
    ):
        """
        Enregistre un clic et renvoie le lien
        vers lequel le frontend doit rediriger.
        """

        advertisement = (
            self.get_object()
        )

        stat = record_ad_click(
            advertisement.pk
        )

        return Response(
            {
                "status": "ok",
                "advertisement_id": (
                    advertisement.pk
                ),
                "clicks": (
                    stat.clicks
                ),
                "redirect_url": (
                    advertisement
                    .effective_link
                ),
            },
            status=(
                status.HTTP_200_OK
            ),
        )


class PartnerViewSet(
    viewsets.ReadOnlyModelViewSet
):
    """
    Partenaires actifs.

    Pas de pagination :
    ils seront notamment utilisés dans le
    slider de logos partenaires.
    """

    permission_classes = [
        permissions.AllowAny,
    ]

    http_method_names = [
        "get",
        "head",
        "options",
    ]

    pagination_class = None

    serializer_class = (
        PartnerSerializer
    )

    queryset = (
        Partner.objects
        .filter(
            is_active=True
        )
        .order_by(
            "display_order",
            "name",
        )
    )