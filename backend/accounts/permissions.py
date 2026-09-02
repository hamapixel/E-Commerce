from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """
    Autorise uniquement le propriétaire SUGU KURA.
    """

    message = "Accès réservé au propriétaire."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role == user.Role.OWNER
        )


class IsOwnerOrManager(BasePermission):
    """
    Autorise OWNER et MANAGER.
    """

    message = "Accès réservé au propriétaire ou à un manager."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role
            in {
                user.Role.OWNER,
                user.Role.MANAGER,
            }
        )


class IsClient(BasePermission):
    """
    Autorise uniquement un utilisateur ayant le rôle CLIENT.
    """

    message = "Accès réservé aux clients."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role == user.Role.CLIENT
        )
