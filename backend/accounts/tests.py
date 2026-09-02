from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from .permissions import (
    IsClient,
    IsOwner,
    IsOwnerOrManager,
)


User = get_user_model()


class UserModelTests(TestCase):
    def test_default_role_is_client(self):
        user = User.objects.create_user(
            username="client_test",
            email="client@sugukura.test",
            password="StrongPassword123!",
        )

        self.assertEqual(
            user.role,
            User.Role.CLIENT,
        )

        self.assertTrue(
            user.is_client
        )

        self.assertFalse(
            user.is_owner
        )

    def test_owner_role(self):
        user = User.objects.create_user(
            username="owner_test",
            email="owner@sugukura.test",
            password="StrongPassword123!",
            role=User.Role.OWNER,
        )

        self.assertTrue(
            user.is_owner
        )

        self.assertFalse(
            user.is_client
        )

    def test_manager_role(self):
        user = User.objects.create_user(
            username="manager_test",
            email="manager@sugukura.test",
            password="StrongPassword123!",
            role=User.Role.MANAGER,
        )

        self.assertTrue(
            user.is_manager
        )


class RolePermissionTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        self.owner = User.objects.create_user(
            username="owner_permission",
            email="owner_permission@sugukura.test",
            password="StrongPassword123!",
            role=User.Role.OWNER,
        )

        self.manager = User.objects.create_user(
            username="manager_permission",
            email="manager_permission@sugukura.test",
            password="StrongPassword123!",
            role=User.Role.MANAGER,
        )

        self.client_user = User.objects.create_user(
            username="client_permission",
            email="client_permission@sugukura.test",
            password="StrongPassword123!",
            role=User.Role.CLIENT,
        )

    def make_request(self, user):
        request = self.factory.get("/")

        request.user = user

        return request

    def test_owner_permission_accepts_owner(self):
        request = self.make_request(
            self.owner
        )

        self.assertTrue(
            IsOwner().has_permission(
                request,
                None,
            )
        )

    def test_owner_permission_rejects_manager(self):
        request = self.make_request(
            self.manager
        )

        self.assertFalse(
            IsOwner().has_permission(
                request,
                None,
            )
        )

    def test_owner_or_manager_accepts_owner(self):
        request = self.make_request(
            self.owner
        )

        self.assertTrue(
            IsOwnerOrManager().has_permission(
                request,
                None,
            )
        )

    def test_owner_or_manager_accepts_manager(self):
        request = self.make_request(
            self.manager
        )

        self.assertTrue(
            IsOwnerOrManager().has_permission(
                request,
                None,
            )
        )

    def test_owner_or_manager_rejects_client(self):
        request = self.make_request(
            self.client_user
        )

        self.assertFalse(
            IsOwnerOrManager().has_permission(
                request,
                None,
            )
        )

    def test_client_permission_accepts_client(self):
        request = self.make_request(
            self.client_user
        )

        self.assertTrue(
            IsClient().has_permission(
                request,
                None,
            )
        )
