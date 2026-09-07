from django.db.models import Avg
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from catalog.models import Product
from reviews.models import ProductReview

from .serializers import ProductReviewSerializer


def _public_reviews(product):
    return (
        ProductReview.objects
        .filter(
            product=product,
            is_approved=True,
        )
        .order_by(
            "-created_at",
            "-id",
        )
    )


def _summary(product):
    reviews = _public_reviews(
        product
    )

    average = (
        reviews.aggregate(
            value=Avg("rating")
        )["value"]
    )

    return {
        "count": reviews.count(),
        "average_rating": (
            round(float(average), 1)
            if average is not None
            else 0.0
        ),
        "results": (
            ProductReviewSerializer(
                reviews[:20],
                many=True,
            ).data
        ),
    }


@api_view([
    "GET",
    "POST",
])
@authentication_classes([])
@permission_classes([
    AllowAny,
])
def product_reviews(
    request,
    slug,
):
    product = get_object_or_404(
        Product,
        slug=slug,
        status=Product.Status.ACTIVE,
    )

    if request.method == "GET":
        return Response(
            _summary(product)
        )

    serializer = ProductReviewSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    review = serializer.save(
        product=product,
        is_approved=True,
    )

    return Response(
        {
            "message": (
                "Merci pour votre avis."
            ),
            "review": (
                ProductReviewSerializer(
                    review
                ).data
            ),
            "summary": (
                _summary(product)
            ),
        },
        status=status.HTTP_201_CREATED,
    )
