from rest_framework.routers import DefaultRouter

from .views import (
    ActivePromotionViewSet,
    AdvertisementViewSet,
    PartnerViewSet,
)


router = DefaultRouter()

router.register(
    r"promotions",
    ActivePromotionViewSet,
    basename="active-promotion",
)

router.register(
    r"advertisements",
    AdvertisementViewSet,
    basename="advertisement",
)

router.register(
    r"partners",
    PartnerViewSet,
    basename="partner",
)


urlpatterns = router.urls