from django.db import transaction

from rest_framework import serializers

from catalog.models import (
    Brand,
    Category,
    Product,
    ProductImage,
    ProductVariant,
)

from inventory.models import InventoryItem


# ============================================================
# CATEGORY
# ============================================================


class OwnerCategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category

        fields = (
            "id",
            "name",
            "slug",
            "description",
            "parent",
            "parent_name",
            "image",
            "image_url",
            "icon",
            "display_order",
            "is_active",
            "is_featured_home",
            "seo_title",
            "seo_description",
            "products_count",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "slug",
            "parent_name",
            "image_url",
            "products_count",
            "created_at",
            "updated_at",
        )

        extra_kwargs = {
            "image": {
                "write_only": True,
                "required": False,
                "allow_null": True,
            },
        }

    def get_parent_name(self, obj):
        if not obj.parent_id:
            return None

        return obj.parent.name

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get("request")

        url = obj.image.url

        if request:
            return request.build_absolute_uri(url)

        return url

    def get_products_count(self, obj):
        return Product.objects.filter(
            category=obj
        ).count()

    def validate_parent(self, value):
        if not value:
            return value

        # Une catégorie ne peut pas être
        # son propre parent.
        if (
            self.instance
            and value.pk == self.instance.pk
        ):
            raise serializers.ValidationError(
                "Une catégorie ne peut pas "
                "être son propre parent."
            )

        # Empêche également les boucles :
        #
        # Téléphones -> Smartphones
        # Smartphones -> Téléphones
        #
        if self.instance:
            current = value

            visited = set()

            while current:
                if current.pk in visited:
                    break

                visited.add(current.pk)

                if current.pk == self.instance.pk:
                    raise serializers.ValidationError(
                        "Cette sélection créerait "
                        "une boucle entre les catégories."
                    )

                current = current.parent

        return value


# ============================================================
# BRAND
# ============================================================


class OwnerBrandSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand

        fields = (
            "id",
            "name",
            "slug",
            "logo",
            "logo_url",
            "description",
            "website",
            "display_order",
            "is_active",
            "is_featured",
            "seo_title",
            "seo_description",
            "products_count",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "slug",
            "logo_url",
            "products_count",
            "created_at",
            "updated_at",
        )

        extra_kwargs = {
            "logo": {
                "write_only": True,
                "required": False,
                "allow_null": True,
            },
        }

    def get_logo_url(self, obj):
        if not obj.logo:
            return None

        request = self.context.get("request")

        url = obj.logo.url

        if request:
            return request.build_absolute_uri(url)

        return url

    def get_products_count(self, obj):
        return Product.objects.filter(
            brand=obj
        ).count()


# ============================================================
# PRODUCT
# ============================================================


class OwnerProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    brand_name = serializers.SerializerMethodField()

    primary_image = serializers.ImageField(
        write_only=True,
        required=False,
        allow_null=True,
    )

    primary_image_url = serializers.SerializerMethodField()

    images_count = serializers.SerializerMethodField()
    variants_count = serializers.SerializerMethodField()

    stock_on_hand = serializers.SerializerMethodField()
    stock_reserved = serializers.SerializerMethodField()
    stock_available = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "barcode",
            "category",
            "category_name",
            "brand",
            "brand_name",
            "short_description",
            "description",
            "base_price",
            "purchase_price",
            "status",
            "is_featured",
            "seo_title",
            "seo_description",
            "primary_image",
            "primary_image_url",
            "images_count",
            "variants_count",
            "stock_on_hand",
            "stock_reserved",
            "stock_available",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "slug",
            "category_name",
            "brand_name",
            "primary_image_url",
            "images_count",
            "variants_count",
            "stock_on_hand",
            "stock_reserved",
            "stock_available",
            "created_at",
            "updated_at",
        )

    # --------------------------------------------------------
    # MARQUE
    # --------------------------------------------------------

    def get_brand_name(self, obj):
        if not obj.brand_id:
            return None

        return obj.brand.name

    # --------------------------------------------------------
    # PHOTO PRINCIPALE
    # --------------------------------------------------------

    def get_primary_image_url(self, obj):
        image = (
            ProductImage.objects
            .filter(
                product=obj,
                is_primary=True,
            )
            .order_by(
                "display_order",
                "id",
            )
            .first()
        )

        # Sécurité :
        # s'il n'existe aucune photo marquée principale,
        # on prend simplement la première photo.
        if image is None:
            image = (
                ProductImage.objects
                .filter(
                    product=obj
                )
                .order_by(
                    "display_order",
                    "id",
                )
                .first()
            )

        if (
            image is None
            or not image.image
        ):
            return None

        request = self.context.get("request")

        url = image.image.url

        if request:
            return request.build_absolute_uri(url)

        return url

    # --------------------------------------------------------
    # NOMBRE DE PHOTOS
    # --------------------------------------------------------

    def get_images_count(self, obj):
        return ProductImage.objects.filter(
            product=obj
        ).count()

    # --------------------------------------------------------
    # NOMBRE DE VARIANTES
    # --------------------------------------------------------

    def get_variants_count(self, obj):
        # On utilise volontairement le modèle directement.
        #
        # Ainsi nous ne dépendons pas d'un related_name
        # particulier comme :
        #
        # obj.variants
        #
        return ProductVariant.objects.filter(
            product=obj
        ).count()

    # --------------------------------------------------------
    # STOCK
    # --------------------------------------------------------

    def _stock_totals(self, obj):
        """
        Retourne :
            quantité physique
            quantité réservée

        Le résultat est mis en cache temporairement
        sur l'instance Product afin que les trois champs
        stock_on_hand / stock_reserved / stock_available
        ne déclenchent pas chacun une nouvelle requête SQL.
        """

        cache_attribute = (
            "_owner_serializer_stock_totals"
        )

        cached = getattr(
            obj,
            cache_attribute,
            None,
        )

        if cached is not None:
            return cached

        items = (
            InventoryItem.objects
            .filter(
                product=obj
            )
            .values(
                "quantity_on_hand",
                "quantity_reserved",
            )
        )

        quantity_on_hand = 0
        quantity_reserved = 0

        for item in items:
            quantity_on_hand += (
                item["quantity_on_hand"]
            )

            quantity_reserved += (
                item["quantity_reserved"]
            )

        result = (
            quantity_on_hand,
            quantity_reserved,
        )

        setattr(
            obj,
            cache_attribute,
            result,
        )

        return result

    def get_stock_on_hand(self, obj):
        quantity_on_hand, _ = (
            self._stock_totals(obj)
        )

        return quantity_on_hand

    def get_stock_reserved(self, obj):
        _, quantity_reserved = (
            self._stock_totals(obj)
        )

        return quantity_reserved

    def get_stock_available(self, obj):
        (
            quantity_on_hand,
            quantity_reserved,
        ) = self._stock_totals(obj)

        return max(
            quantity_on_hand
            - quantity_reserved,
            0,
        )

    # --------------------------------------------------------
    # VALIDATIONS
    # --------------------------------------------------------

    def validate_sku(self, value):
        value = value.strip().upper()

        if not value:
            raise serializers.ValidationError(
                "Le SKU est obligatoire."
            )

        return value

    # --------------------------------------------------------
    # CREATE
    # --------------------------------------------------------

    @transaction.atomic
    def create(self, validated_data):
        primary_image = validated_data.pop(
            "primary_image",
            None,
        )

        # ----------------------------------------------------
        # 1. Création du produit
        # ----------------------------------------------------
        product = super().create(
            validated_data
        )

        # ----------------------------------------------------
        # 2. Création automatique de la ligne de stock
        #
        # Tout nouveau produit doit apparaître immédiatement
        # dans la gestion du stock, même avec une quantité 0.
        #
        # Si le produit reçoit ensuite une première variante,
        # la gestion des variantes pourra transférer cette
        # ligne de stock vers cette variante.
        # ----------------------------------------------------
        InventoryItem.objects.get_or_create(
            product=product,
            variant=None,
            defaults={
                "quantity_on_hand": 0,
                "quantity_reserved": 0,
                "low_stock_threshold": 5,
            },
        )

        # ----------------------------------------------------
        # 3. Photo principale éventuelle
        # ----------------------------------------------------
        if primary_image:
            ProductImage.objects.create(
                product=product,
                image=primary_image,
                alt_text=product.name,
                is_primary=True,
                display_order=0,
            )

        return product

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    @transaction.atomic
    def update(
        self,
        instance,
        validated_data,
    ):
        primary_image = validated_data.pop(
            "primary_image",
            None,
        )

        product = super().update(
            instance,
            validated_data,
        )

        # ----------------------------------------------------
        # Sécurité stock :
        #
        # Un produit simple doit toujours posséder une ligne
        # InventoryItem. En revanche, si le produit possède
        # déjà des variantes, on ne crée surtout pas une ligne
        # générale supplémentaire afin d'éviter de compter le
        # stock deux fois.
        # ----------------------------------------------------
        if not ProductVariant.objects.filter(
            product=product
        ).exists():
            InventoryItem.objects.get_or_create(
                product=product,
                variant=None,
                defaults={
                    "quantity_on_hand": 0,
                    "quantity_reserved": 0,
                    "low_stock_threshold": 5,
                },
            )

        if primary_image:
            # L'ancienne photo principale
            # reste dans la galerie mais n'est
            # plus principale.
            ProductImage.objects.filter(
                product=product,
                is_primary=True,
            ).update(
                is_primary=False
            )

            ProductImage.objects.create(
                product=product,
                image=primary_image,
                alt_text=product.name,
                is_primary=True,
                display_order=0,
            )

        return product


# ============================================================
# PRODUCT IMAGE
# ============================================================


class OwnerProductImageSerializer(
    serializers.ModelSerializer
):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage

        fields = (
            "id",
            "product",
            "image",
            "image_url",
            "alt_text",
            "is_primary",
            "display_order",
            "created_at",
        )

        read_only_fields = (
            "id",
            "image_url",
            "created_at",
        )

        extra_kwargs = {
            "image": {
                "write_only": True,
            },
        }

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get("request")

        url = obj.image.url

        if request:
            return request.build_absolute_uri(url)

        return url

    # --------------------------------------------------------
    # CREATE IMAGE
    # --------------------------------------------------------

    @transaction.atomic
    def create(self, validated_data):
        product = validated_data["product"]

        is_primary = validated_data.get(
            "is_primary",
            False,
        )

        # Si cette nouvelle photo doit être
        # principale, on retire ce statut
        # aux anciennes.
        if is_primary:
            ProductImage.objects.filter(
                product=product,
                is_primary=True,
            ).update(
                is_primary=False
            )

        image = super().create(
            validated_data
        )

        # Si c'est la toute première photo du produit,
        # elle devient automatiquement principale.
        has_another_image = (
            ProductImage.objects
            .filter(
                product=product
            )
            .exclude(
                pk=image.pk
            )
            .exists()
        )

        if (
            not has_another_image
            and not image.is_primary
        ):
            image.is_primary = True

            image.save(
                update_fields=[
                    "is_primary",
                ]
            )

        return image

    # --------------------------------------------------------
    # UPDATE IMAGE
    # --------------------------------------------------------

    @transaction.atomic
    def update(
        self,
        instance,
        validated_data,
    ):
        requested_primary = (
            validated_data.get(
                "is_primary",
                instance.is_primary,
            )
        )

        product = (
            validated_data.get(
                "product",
                instance.product,
            )
        )

        # Une photo principale doit être unique
        # pour un produit.
        if requested_primary:
            ProductImage.objects.filter(
                product=product,
                is_primary=True,
            ).exclude(
                pk=instance.pk
            ).update(
                is_primary=False
            )

        image = super().update(
            instance,
            validated_data,
        )

        return image