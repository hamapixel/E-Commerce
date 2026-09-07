from django.urls import path

from .views import product_reviews


urlpatterns = [
    path(
        "products/<slug:slug>/",
        product_reviews,
        name="product-reviews",
    ),
]
