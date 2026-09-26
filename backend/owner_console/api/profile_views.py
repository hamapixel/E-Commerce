from rest_framework import (
    permissions,
    status,
)
from rest_framework.authentication import (
    SessionAuthentication,
    TokenAuthentication,
)
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response

from accounts.permissions import IsOwner

from .serializers import (
    OwnerPasswordChangeSerializer,
    OwnerProfileSerializer,
)


OWNER_AUTHENTICATION = [
    TokenAuthentication,
    SessionAuthentication,
]


@api_view([
    "GET",
    "PATCH",
])
@authentication_classes(
    OWNER_AUTHENTICATION
)
@permission_classes([
    permissions.IsAuthenticated,
    IsOwner,
])
def owner_profile(
    request,
):
    user = request.user

    if request.method == "GET":
        return Response(
            OwnerProfileSerializer(
                user,
                context={
                    "request": request,
                },
            ).data
        )

    serializer = OwnerProfileSerializer(
        user,
        data=request.data,
        partial=True,
        context={
            "request": request,
        },
    )

    serializer.is_valid(
        raise_exception=True
    )

    serializer.save()

    return Response(
        OwnerProfileSerializer(
            user,
            context={
                "request": request,
            },
        ).data
    )


@api_view([
    "POST",
])
@authentication_classes(
    OWNER_AUTHENTICATION
)
@permission_classes([
    permissions.IsAuthenticated,
    IsOwner,
])
def owner_change_password(
    request,
):
    serializer = OwnerPasswordChangeSerializer(
        data=request.data,
        context={
            "request": request,
        },
    )

    serializer.is_valid(
        raise_exception=True
    )

    user = request.user

    user.set_password(
        serializer.validated_data[
            "new_password"
        ]
    )
    user.save(
        update_fields=[
            "password",
        ]
    )

    Token.objects.filter(
        user=user
    ).delete()

    token = Token.objects.create(
        user=user
    )

    return Response(
        {
            "detail": (
                "Mot de passe modifié avec succès."
            ),
            "token": token.key,
        },
        status=(
            status.HTTP_200_OK
        ),
    )
