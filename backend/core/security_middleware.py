from datetime import timedelta

from django.conf import settings
from django.core.cache import cache
from django.http import (
    HttpResponse,
    JsonResponse,
)
from django.utils import timezone


class AdminLoginRateLimitMiddleware:
    """
    Limite les échecs de connexion Django Admin.
    """

    cache_prefix = (
        "sugu_kura:admin_login:"
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def _is_admin_login(self, request):
        return (
            request.method == "POST"
            and request.path.rstrip("/")
            == "/admin/login"
        )

    def _cache_key(self, request):
        remote_addr = (
            request.META.get(
                "REMOTE_ADDR",
                "unknown",
            )
            or "unknown"
        )

        return (
            f"{self.cache_prefix}"
            f"{remote_addr}"
        )

    def __call__(self, request):
        if not self._is_admin_login(
            request
        ):
            return self.get_response(
                request
            )

        key = self._cache_key(
            request
        )

        max_attempts = max(
            1,
            int(
                getattr(
                    settings,
                    "ADMIN_LOGIN_MAX_ATTEMPTS",
                    5,
                )
            ),
        )

        window = max(
            60,
            int(
                getattr(
                    settings,
                    "ADMIN_LOGIN_WINDOW_SECONDS",
                    300,
                )
            ),
        )

        attempts = int(
            cache.get(
                key,
                0,
            )
            or 0
        )

        if attempts >= max_attempts:
            return HttpResponse(
                (
                    "Trop de tentatives de connexion. "
                    "Réessayez dans quelques minutes."
                ),
                status=429,
                content_type=(
                    "text/plain; charset=utf-8"
                ),
            )

        response = self.get_response(
            request
        )

        if (
            300
            <= response.status_code
            < 400
        ):
            cache.delete(
                key
            )
            return response

        cache.set(
            key,
            attempts + 1,
            timeout=window,
        )

        return response


class OwnerTokenExpiryMiddleware:
    """
    Expiration absolue des tokens OWNER.

    Le frontend OWNER stocke déjà le token dans un cookie
    HttpOnly ; cette vérification ajoute l'expiration côté
    Django afin qu'un ancien token copié ne reste pas valide
    indéfiniment.
    """

    owner_prefix = (
        "/api/v1/owner/"
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.path.startswith(
            self.owner_prefix
        ):
            return self.get_response(
                request
            )

        authorization = (
            request.META.get(
                "HTTP_AUTHORIZATION",
                "",
            )
            or ""
        ).strip()

        if not authorization.startswith(
            "Token "
        ):
            return self.get_response(
                request
            )

        token_key = (
            authorization[
                len("Token "):
            ]
            .strip()
        )

        if not token_key:
            return self.get_response(
                request
            )

        from rest_framework.authtoken.models import Token

        token = (
            Token.objects
            .filter(
                key=token_key
            )
            .only(
                "key",
                "created",
            )
            .first()
        )

        if token is None:
            return self.get_response(
                request
            )

        max_age_seconds = max(
            1,
            int(
                getattr(
                    settings,
                    "OWNER_TOKEN_MAX_AGE_SECONDS",
                    60 * 60 * 12,
                )
            ),
        )

        expires_at = (
            token.created
            + timedelta(
                seconds=max_age_seconds
            )
        )

        if timezone.now() < expires_at:
            return self.get_response(
                request
            )

        token.delete()

        return JsonResponse(
            {
                "detail": (
                    "Session expirée. "
                    "Reconnectez-vous."
                )
            },
            status=401,
        )
