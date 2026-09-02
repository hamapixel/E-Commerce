from getpass import getpass

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import (
    validate_password,
)
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction


User = get_user_model()


class Command(BaseCommand):
    help = "Crée le compte OWNER principal de SUGU KURA."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            type=str,
            help="Nom d'utilisateur du propriétaire.",
        )

        parser.add_argument(
            "--email",
            type=str,
            help="Adresse e-mail du propriétaire.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        username = options.get("username")

        if not username:
            username = input(
                "Nom d'utilisateur OWNER : "
            ).strip()

        if not username:
            raise CommandError(
                "Le nom d'utilisateur est obligatoire."
            )

        email = options.get("email")

        if not email:
            email = input(
                "Adresse e-mail OWNER : "
            ).strip()

        if not email:
            raise CommandError(
                "L'adresse e-mail est obligatoire."
            )

        existing_username = User.objects.filter(
            username__iexact=username
        ).first()

        if existing_username:
            raise CommandError(
                "Ce nom d'utilisateur existe déjà."
            )

        existing_email = User.objects.filter(
            email__iexact=email
        ).first()

        if existing_email:
            raise CommandError(
                "Cette adresse e-mail existe déjà."
            )

        password = getpass(
            "Mot de passe OWNER : "
        )

        password_confirmation = getpass(
            "Confirmer le mot de passe : "
        )

        if not password:
            raise CommandError(
                "Le mot de passe est obligatoire."
            )

        if password != password_confirmation:
            raise CommandError(
                "Les mots de passe ne correspondent pas."
            )

        user = User(
            username=username,
            email=email,
            role=User.Role.OWNER,
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )

        try:
            validate_password(
                password,
                user=user,
            )

        except ValidationError as exc:
            raise CommandError(
                "Mot de passe refusé : "
                + " ".join(
                    exc.messages
                )
            ) from exc

        user.set_password(password)

        user.full_clean(
            exclude=[
                "password",
            ]
        )

        user.save()

        self.stdout.write(
            self.style.SUCCESS(
                "OWNER SUGU KURA créé avec succès."
            )
        )

        self.stdout.write(
            f"Username : {user.username}"
        )

        self.stdout.write(
            f"Email    : {user.email}"
        )

        self.stdout.write(
            f"Role     : {user.role}"
        )
