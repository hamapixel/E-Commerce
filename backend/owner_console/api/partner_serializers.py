from rest_framework import serializers

from promotions.models import Partner


class OwnerPartnerSerializer(serializers.ModelSerializer):
    effective_link = serializers.CharField(
        read_only=True,
    )

    class Meta:
        model = Partner
        fields = (
            "id",
            "name",
            "logo",
            "description",
            "website",
            "page_url",
            "effective_link",
            "display_order",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "effective_link",
            "created_at",
            "updated_at",
        )
        extra_kwargs = {
            "logo": {
                "required": False,
            },
        }

    def validate(self, attrs):
        if self.instance is None and not attrs.get("logo"):
            raise serializers.ValidationError(
                {
                    "logo": (
                        "Ajoutez le logo du partenaire."
                    )
                }
            )

        return attrs
