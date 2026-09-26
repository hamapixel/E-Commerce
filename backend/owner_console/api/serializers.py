from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from promotions.models import (
    Advertisement,
)


User = get_user_model()

MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024


class OwnerLoginSerializer(
    serializers.Serializer
):
    username = serializers.CharField(
        max_length=150
    )

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )


class OwnerProfileSerializer(
    serializers.ModelSerializer
):
    profile_photo = serializers.ImageField(
        write_only=True,
        required=False,
        allow_null=True,
    )

    store_logo = serializers.ImageField(
        write_only=True,
        required=False,
        allow_null=True,
    )

    profile_photo_url = serializers.SerializerMethodField()
    store_logo_url = serializers.SerializerMethodField()
    display_name = serializers.CharField(
        read_only=True
    )
    role = serializers.CharField(
        read_only=True
    )

    remove_profile_photo = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
    )

    remove_store_logo = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
    )

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "whatsapp",
            "role",
            "display_name",
            "profile_photo",
            "profile_photo_url",
            "store_logo",
            "store_logo_url",
            "remove_profile_photo",
            "remove_store_logo",
        )
        read_only_fields = (
            "id",
            "role",
            "display_name",
            "profile_photo_url",
            "store_logo_url",
        )

    def _validate_image_size(
        self,
        image,
    ):
        if (
            image
            and image.size
            > MAX_PROFILE_IMAGE_SIZE
        ):
            raise serializers.ValidationError(
                "L'image ne doit pas dépasser 5 Mo."
            )

        return image

    def validate_profile_photo(
        self,
        value,
    ):
        return self._validate_image_size(
            value
        )

    def validate_store_logo(
        self,
        value,
    ):
        return self._validate_image_size(
            value
        )

    def get_profile_photo_url(
        self,
        obj,
    ):
        if not obj.profile_photo:
            return None

        try:
            return obj.profile_photo.url
        except ValueError:
            return None

    def get_store_logo_url(
        self,
        obj,
    ):
        if not obj.store_logo:
            return None

        try:
            return obj.store_logo.url
        except ValueError:
            return None

    def update(
        self,
        instance,
        validated_data,
    ):
        remove_profile_photo = validated_data.pop(
            "remove_profile_photo",
            False,
        )
        remove_store_logo = validated_data.pop(
            "remove_store_logo",
            False,
        )

        if remove_profile_photo:
            instance.profile_photo.delete(
                save=False
            )
            instance.profile_photo = None

        if remove_store_logo:
            instance.store_logo.delete(
                save=False
            )
            instance.store_logo = None

        new_profile_photo = validated_data.get(
            "profile_photo"
        )
        if (
            new_profile_photo
            and instance.profile_photo
        ):
            instance.profile_photo.delete(
                save=False
            )

        new_store_logo = validated_data.get(
            "store_logo"
        )
        if (
            new_store_logo
            and instance.store_logo
        ):
            instance.store_logo.delete(
                save=False
            )

        return super().update(
            instance,
            validated_data,
        )


class OwnerPasswordChangeSerializer(
    serializers.Serializer
):
    current_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    new_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    confirm_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate_current_password(
        self,
        value,
    ):
        user = self.context[
            "request"
        ].user

        if not user.check_password(
            value
        ):
            raise serializers.ValidationError(
                "Le mot de passe actuel est incorrect."
            )

        return value

    def validate(
        self,
        attrs,
    ):
        if (
            attrs["new_password"]
            != attrs["confirm_password"]
        ):
            raise serializers.ValidationError(
                {
                    "confirm_password": (
                        "Les deux nouveaux mots de passe ne correspondent pas."
                    )
                }
            )

        validate_password(
            attrs["new_password"],
            user=self.context[
                "request"
            ].user,
        )

        return attrs


class AdvertisementOwnerSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = Advertisement

        fields = "__all__"

        read_only_fields = (
            "id",
        )