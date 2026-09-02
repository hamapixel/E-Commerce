from django.conf import settings
from django.db import connection
from django.utils import timezone

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckAPIView(APIView):
    """
    Endpoint public permettant de vérifier que :

    - Django fonctionne ;
    - l'API fonctionne ;
    - PostgreSQL est joignable.
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        database_status = "ok"

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1;")
                cursor.fetchone()

        except Exception:
            database_status = "error"

        status_code = (
            200
            if database_status == "ok"
            else 503
        )

        return Response(
            {
                "service": "SUGU KURA API",
                "status": (
                    "ok"
                    if database_status == "ok"
                    else "degraded"
                ),
                "database": database_status,
                "timezone": settings.TIME_ZONE,
                "timestamp": timezone.now(),
            },
            status=status_code,
        )
