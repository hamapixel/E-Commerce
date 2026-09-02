from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Utilisateur principal de SUGU KURA.

    Les rôles métier sont séparés des permissions techniques
    Django (is_staff / is_superuser).
    """

    class Role(models.TextChoices):
        OWNER = "OWNER", "Propriétaire"
        MANAGER = "MANAGER", "Manager"
        CLIENT = "CLIENT", "Client"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CLIENT,
        db_index=True,
        verbose_name="Rôle",
    )

    email = models.EmailField(
        unique=True,
        verbose_name="Adresse e-mail",
    )

    phone = models.CharField(
        max_length=30,
        unique=True,
        null=True,
        blank=True,
        verbose_name="Téléphone",
    )

    whatsapp = models.CharField(
        max_length=30,
        blank=True,
        verbose_name="WhatsApp",
    )

    REQUIRED_FIELDS = [
        "email",
    ]

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = [
            "username",
        ]

    def __str__(self):
        return self.get_full_name() or self.username

    @property
    def is_owner(self):
        return self.role == self.Role.OWNER

    @property
    def is_manager(self):
        return self.role == self.Role.MANAGER

    @property
    def is_client(self):
        return self.role == self.Role.CLIENT

    @property
    def display_name(self):
        return self.get_full_name() or self.username
