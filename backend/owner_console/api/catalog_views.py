from django.db import transaction
from django.db.models import Q

from django.db.models.deletion import (
    ProtectedError,
)

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
    api_view,
    authentication_classes,
    permission_classes,
)

from rest_framework.pagination import (
    PageNumberPagination,
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
    ProductImage,
)

from .catalog_serializers import (
    OwnerBrandSerializer,
    OwnerCategorySerializer,
    OwnerProductImageSerializer,
    OwnerProductSerializer,
)


OWNER_AUTHENTICATION = [
    TokenAuthentication,
    SessionAuthentication,
]


OWNER_PERMISSIONS = [
    permissions.IsAuthenticated,
    IsOwner,
]


class OwnerProductPagination(
    PageNumberPagination
):
    page_size = 20

    page_size_query_param = (
        "page_size"
    )

    max_page_size = 100


class OwnerCategoryViewSet(
    viewsets.ModelViewSet
):
    authentication_classes = (
        OWNER_AUTHENTICATION
    )

    permission_classes = (
        OWNER_PERMISSIONS
    )

    serializer_class = (
        OwnerCategorySerializer
    )

    pagination_class = None

    queryset = (
        Category.objects
        .select_related(
            "parent"
        )
        .all()
        .order_by(
            "display_order",
            "name",
        )
    )

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        instance = self.get_object()

        try:
            self.perform_destroy(
                instance
            )

        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "Cette catégorie est "
                        "encore utilisée. "
                        "Désactivez-la plutôt "
                        "que de la supprimer."
                    )
                },
                status=(
                    status
                    .HTTP_409_CONFLICT
                ),
            )

        return Response(
            status=(
                status
                .HTTP_204_NO_CONTENT
            )
        )


class OwnerBrandViewSet(
    viewsets.ModelViewSet
):
    authentication_classes = (
        OWNER_AUTHENTICATION
    )

    permission_classes = (
        OWNER_PERMISSIONS
    )

    serializer_class = (
        OwnerBrandSerializer
    )

    pagination_class = None

    queryset = (
        Brand.objects
        .all()
        .order_by(
            "display_order",
            "name",
        )
    )

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        instance = self.get_object()

        try:
            self.perform_destroy(
                instance
            )

        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "Cette marque est "
                        "encore utilisée. "
                        "Désactivez-la plutôt "
                        "que de la supprimer."
                    )
                },
                status=(
                    status
                    .HTTP_409_CONFLICT
                ),
            )

        return Response(
            status=(
                status
                .HTTP_204_NO_CONTENT
            )
        )


class OwnerProductViewSet(
    viewsets.ModelViewSet
):
    authentication_classes = (
        OWNER_AUTHENTICATION
    )

    permission_classes = (
        OWNER_PERMISSIONS
    )

    serializer_class = (
        OwnerProductSerializer
    )

    pagination_class = (
        OwnerProductPagination
    )

    def get_queryset(self):
        queryset = (
            Product.objects
            .select_related(
                "category",
                "brand",
            )
            .all()
            .order_by(
                "-updated_at",
                "-id",
            )
        )

        q = (
            self.request
            .query_params
            .get(
                "q",
                "",
            )
            .strip()
        )

        status_value = (
            self.request
            .query_params
            .get(
                "status",
                "",
            )
            .strip()
        )

        category = (
            self.request
            .query_params
            .get(
                "category",
                "",
            )
            .strip()
        )

        brand = (
            self.request
            .query_params
            .get(
                "brand",
                "",
            )
            .strip()
        )

        if q:
            queryset = queryset.filter(
                Q(
                    name__icontains=q
                )
                |
                Q(
                    sku__icontains=q
                )
                |
                Q(
                    barcode__icontains=q
                )
            )

        if status_value:
            queryset = queryset.filter(
                status=status_value
            )

        if category:
            queryset = queryset.filter(
                category_id=category
            )

        if brand:
            queryset = queryset.filter(
                brand_id=brand
            )

        return queryset

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        instance = self.get_object()

        try:
            self.perform_destroy(
                instance
            )

        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "Ce produit possède "
                        "déjà des données liées "
                        "(commande, stock, etc.). "
                        "Changez son statut "
                        "plutôt que de le supprimer."
                    )
                },
                status=(
                    status
                    .HTTP_409_CONFLICT
                ),
            )

        return Response(
            status=(
                status
                .HTTP_204_NO_CONTENT
            )
        )

    @action(
        detail=True,
        methods=[
            "get",
        ],
        url_path="images",
    )
    def images(
        self,
        request,
        pk=None,
    ):
        product = (
            self.get_object()
        )

        images = (
            ProductImage.objects
            .filter(
                product=product
            )
            .order_by(
                "display_order",
                "id",
            )
        )

        serializer = (
            OwnerProductImageSerializer(
                images,
                many=True,
                context={
                    "request": request
                },
            )
        )

        return Response(
            serializer.data
        )


class OwnerProductImageViewSet(
    viewsets.ModelViewSet
):
    authentication_classes = (
        OWNER_AUTHENTICATION
    )

    permission_classes = (
        OWNER_PERMISSIONS
    )

    serializer_class = (
        OwnerProductImageSerializer
    )

    pagination_class = None

    queryset = (
        ProductImage.objects
        .select_related(
            "product"
        )
        .all()
        .order_by(
            "product_id",
            "display_order",
            "id",
        )
    )

    @action(
        detail=True,
        methods=[
            "post",
        ],
        url_path="make-primary",
    )
    @transaction.atomic
    def make_primary(
        self,
        request,
        pk=None,
    ):
        image = (
            self.get_object()
        )

        ProductImage.objects.filter(
            product=image.product,
            is_primary=True,
        ).exclude(
            pk=image.pk
        ).update(
            is_primary=False
        )

        if not image.is_primary:
            image.is_primary = True

            image.save(
                update_fields=[
                    "is_primary",
                ]
            )

        serializer = (
            self.get_serializer(
                image
            )
        )

        return Response(
            serializer.data
        )

    @transaction.atomic
    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        image = (
            self.get_object()
        )

        product = (
            image.product
        )

        was_primary = (
            image.is_primary
        )

        storage = None
        image_name = None

        if image.image:
            storage = (
                image.image.storage
            )

            image_name = (
                image.image.name
            )

        image.delete()

        if was_primary:
            next_image = (
                ProductImage.objects
                .filter(
                    product=product
                )
                .order_by(
                    "display_order",
                    "id",
                )
                .first()
            )

            if next_image:
                ProductImage.objects.filter(
                    product=product,
                    is_primary=True,
                ).exclude(
                    pk=next_image.pk
                ).update(
                    is_primary=False
                )

                if not next_image.is_primary:
                    next_image.is_primary = True

                    next_image.save(
                        update_fields=[
                            "is_primary",
                        ]
                    )

        transaction.on_commit(
            lambda: (
                storage.delete(
                    image_name
                )
                if (
                    storage
                    and
                    image_name
                )
                else None
            )
        )

        return Response(
            status=(
                status
                .HTTP_204_NO_CONTENT
            )
        )


@api_view([
    "GET",
])
@authentication_classes(
    OWNER_AUTHENTICATION
)
@permission_classes(
    OWNER_PERMISSIONS
)
def owner_catalog_metadata(
    request,
):
    product_status_field = (
        Product
        ._meta
        .get_field(
            "status"
        )
    )

    status_choices = [
        {
            "value": value,
            "label": label,
        }
        for (
            value,
            label,
        )
        in product_status_field.choices
    ]

    return Response(
        {
            "product_statuses": (
                status_choices
            ),

            "categories": [
                {
                    "id": category.pk,
                    "name": category.name,
                    "parent_id": (
                        category.parent_id
                    ),
                    "is_active": (
                        category.is_active
                    ),
                }
                for category
                in (
                    Category.objects
                    .all()
                    .order_by(
                        "name"
                    )
                )
            ],

            "brands": [
                {
                    "id": brand.pk,
                    "name": brand.name,
                    "is_active": (
                        brand.is_active
                    ),
                }
                for brand
                in (
                    Brand.objects
                    .all()
                    .order_by(
                        "name"
                    )
                )
            ],
        }
    )