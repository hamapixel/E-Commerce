from django.urls import path

from .views import (
    notification_history,
    public_key,
    subscribe,
    test_push,
    unsubscribe,
)


app_name = "notifications_api"


urlpatterns = [
    path(
        "public-key/",
        public_key,
        name="public-key",
    ),

    path(
        "subscribe/",
        subscribe,
        name="subscribe",
    ),

    path(
        "unsubscribe/",
        unsubscribe,
        name="unsubscribe",
    ),

    path(
        "test/",
        test_push,
        name="test",
    ),

    path(
        "history/",
        notification_history,
        name="history",
    ),
]