from rest_framework.routers import (
    DefaultRouter,
)

from .views import (
    CheckoutSessionViewSet,
)


router = DefaultRouter()

router.register(
    r"sessions",
    CheckoutSessionViewSet,
    basename="checkout-session",
)


urlpatterns = router.urls