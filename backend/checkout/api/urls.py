from rest_framework.routers import (
    DefaultRouter,
)

from .views import (
    CheckoutSessionViewSet,
    DeliveryZoneViewSet,
)


router = DefaultRouter()

router.register(
    r"delivery-zones",
    DeliveryZoneViewSet,
    basename="delivery-zone",
)

router.register(
    r"sessions",
    CheckoutSessionViewSet,
    basename="checkout-session",
)


urlpatterns = router.urls