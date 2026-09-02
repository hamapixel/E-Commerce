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

from rest_framework.decorators import (
    action,
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

from promotions.models import (
    Advertisement,
    Promotion,
)

from .advertisement_serializers import (
    OwnerAdvertisementSerializer,
)


OWNER_AUTHENTICATION = [
    TokenAuthentication,
    SessionAuthentication,
]


OWNER_PERMISSIONS = [
    permissions.IsAuthenticated,
    IsOwner,
]


class OwnerAdvertisementViewSet(
    viewsets.ModelViewSet
):
    authentication_classes = (
        OWNER_AUTHENTICATION
    )

    permission_classes = (
        OWNER_PERMISSIONS
    )

    serializer_class = (
        OwnerAdvertisementSerializer
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
            Advertisement.objects
            .select_related(
                "promotion",
                "destination_product",
                "destination_category",
                "destination_brand",
            )
            .prefetch_related(
                "target_categories",
                "daily_stats",
            )
            .all()
            .order_by(
                "-priority_level",
                "-display_priority",
                "-id",
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

        advertisement.is_active = (
            not advertisement.is_active
        )

        advertisement.save(
            update_fields=[
                "is_active",
                "updated_at",
            ]
        )

        return Response(
            self.get_serializer(
                advertisement
            ).data
        )

    @action(
        detail=False,
        methods=[
            "get",
        ],
        url_path="metadata",
    )
    def metadata(
        self,
        request,
    ):
        return Response(
            {
                "placements": [
                    {
                        "value": value,
                        "label": label,
                    }
                    for value, label
                    in Advertisement
                    .Placement
                    .choices
                ],

                "priorities": [
                    {
                        "value": value,
                        "label": label,
                    }
                    for value, label
                    in Advertisement
                    .Priority
                    .choices
                ],

                "destination_types": [
                    {
                        "value": value,
                        "label": label,
                    }
                    for value, label
                    in Advertisement
                    .DestinationType
                    .choices
                ],

                "categories": [
                    {
                        "id":
                            category.pk,
                        "name":
                            category.name,
                        "slug":
                            category.slug,
                    }
                    for category
                    in Category.objects
                    .all()
                    .order_by(
                        "name"
                    )
                ],

                "brands": [
                    {
                        "id":
                            brand.pk,
                        "name":
                            brand.name,
                        "slug":
                            brand.slug,
                    }
                    for brand
                    in Brand.objects
                    .all()
                    .order_by(
                        "name"
                    )
                ],

                "products": [
                    {
                        "id":
                            product.pk,
                        "name":
                            product.name,
                        "sku":
                            product.sku,
                        "slug":
                            product.slug,
                    }
                    for product
                    in Product.objects
                    .all()
                    .only(
                        "id",
                        "name",
                        "sku",
                        "slug",
                    )
                    .order_by(
                        "name"
                    )
                ],

                "promotions": [
                    {
                        "id":
                            promotion.pk,
                        "name":
                            promotion.name,
                        "is_current":
                            promotion.is_current,
                    }
                    for promotion
                    in Promotion.objects
                    .all()
                    .order_by(
                        "-start_at",
                        "-id",
                    )
                ],
            }
        )

    @transaction.atomic
    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        advertisement = (
            self.get_object()
        )

        files_to_delete = []

        for field_name in (
            "company_logo",
            "desktop_image",
            "mobile_image",
        ):
            field_file = getattr(
                advertisement,
                field_name,
                None,
            )

            if (
                field_file
                and field_file.name
            ):
                files_to_delete.append(
                    (
                        field_file.storage,
                        field_file.name,
                    )
                )

        advertisement.delete()

        def remove_files():
            for storage, name in (
                files_to_delete
            ):
                if storage.exists(
                    name
                ):
                    storage.delete(
                        name
                    )

        transaction.on_commit(
            remove_files
        )

        return Response(
            status=(
                status
                .HTTP_204_NO_CONTENT
            )
        )
