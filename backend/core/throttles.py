from django.conf import settings

from rest_framework.throttling import (
    SimpleRateThrottle,
)


class ConfiguredIPThrottle(
    SimpleRateThrottle
):
    settings_name = ""
    default_rate = "60/minute"

    def get_rate(self):
        return getattr(
            settings,
            self.settings_name,
            self.default_rate,
        )

    def get_cache_key(
        self,
        request,
        view,
    ):
        ident = self.get_ident(
            request
        )

        return self.cache_format % {
            "scope": self.scope,
            "ident": ident,
        }


class OwnerLoginThrottle(
    ConfiguredIPThrottle
):
    scope = "owner_login"

    settings_name = (
        "OWNER_LOGIN_THROTTLE_RATE"
    )

    default_rate = "10/minute"

    def get_cache_key(
        self,
        request,
        view,
    ):
        ident = self.get_ident(
            request
        )

        username = str(
            request.data.get(
                "username",
                "",
            )
        ).strip().lower()

        if not username:
            username = "empty"

        return self.cache_format % {
            "scope": self.scope,
            "ident": (
                f"{ident}:{username}"
            ),
        }


class CheckoutCreateThrottle(
    ConfiguredIPThrottle
):
    scope = "checkout_create"

    settings_name = (
        "CHECKOUT_CREATE_THROTTLE_RATE"
    )

    default_rate = "30/hour"


class OrderCreateThrottle(
    ConfiguredIPThrottle
):
    scope = "order_create"

    settings_name = (
        "ORDER_CREATE_THROTTLE_RATE"
    )

    default_rate = "60/hour"
