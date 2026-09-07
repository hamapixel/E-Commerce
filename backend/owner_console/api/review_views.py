from django.core.paginator import Paginator
from django.db.models import Avg, Q

from rest_framework import permissions, status
from rest_framework.authentication import (
    SessionAuthentication,
    TokenAuthentication,
)
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response

from accounts.permissions import IsOwner
from reviews.models import ProductReview


OWNER_AUTHENTICATION = [
    TokenAuthentication,
    SessionAuthentication,
]

OWNER_PERMISSIONS = [
    permissions.IsAuthenticated,
    IsOwner,
]


def _serialize_review(review):
    return {
        "id": review.id,
        "product": {
            "id": review.product_id,
            "name": review.product.name,
            "slug": review.product.slug,
        },
        "customer_name": review.customer_name,
        "rating": review.rating,
        "comment": review.comment,
        "is_approved": review.is_approved,
        "created_at": review.created_at,
    }


@api_view(["GET"])
@authentication_classes(OWNER_AUTHENTICATION)
@permission_classes(OWNER_PERMISSIONS)
def owner_reviews(request):
    queryset = (
        ProductReview.objects
        .select_related("product")
        .all()
        .order_by("-created_at", "-id")
    )

    review_status = (
        request.query_params
        .get("status", "all")
        .strip()
        .lower()
    )

    if review_status == "published":
        queryset = queryset.filter(
            is_approved=True
        )
    elif review_status == "hidden":
        queryset = queryset.filter(
            is_approved=False
        )

    search = (
        request.query_params
        .get("q", "")
        .strip()
    )

    if search:
        queryset = queryset.filter(
            Q(customer_name__icontains=search)
            | Q(comment__icontains=search)
            | Q(product__name__icontains=search)
            | Q(product__sku__icontains=search)
        )

    try:
        page_number = max(
            int(
                request.query_params
                .get("page", "1")
            ),
            1,
        )
    except (TypeError, ValueError):
        page_number = 1

    try:
        page_size = int(
            request.query_params
            .get("page_size", "20")
        )
    except (TypeError, ValueError):
        page_size = 20

    page_size = min(
        max(page_size, 1),
        50,
    )

    paginator = Paginator(
        queryset,
        page_size,
    )

    page_obj = paginator.get_page(
        page_number
    )

    all_reviews = ProductReview.objects.all()
    average = all_reviews.aggregate(
        value=Avg("rating")
    )["value"]

    return Response(
        {
            "summary": {
                "total": all_reviews.count(),
                "published": all_reviews.filter(
                    is_approved=True
                ).count(),
                "hidden": all_reviews.filter(
                    is_approved=False
                ).count(),
                "average_rating": (
                    round(float(average), 1)
                    if average is not None
                    else 0.0
                ),
            },
            "count": paginator.count,
            "page": page_obj.number,
            "pages": paginator.num_pages,
            "results": [
                _serialize_review(review)
                for review in page_obj.object_list
            ],
        }
    )


@api_view(["PATCH", "DELETE"])
@authentication_classes(OWNER_AUTHENTICATION)
@permission_classes(OWNER_PERMISSIONS)
def owner_review_detail(
    request,
    review_id,
):
    try:
        review = (
            ProductReview.objects
            .select_related("product")
            .get(pk=review_id)
        )
    except ProductReview.DoesNotExist:
        return Response(
            {
                "detail": "Avis introuvable."
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "DELETE":
        review.delete()
        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

    if "is_approved" not in request.data:
        return Response(
            {
                "is_approved": (
                    "Ce champ est obligatoire."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    review.is_approved = bool(
        request.data.get("is_approved")
    )
    review.save(
        update_fields=["is_approved"]
    )

    return Response(
        _serialize_review(review)
    )
