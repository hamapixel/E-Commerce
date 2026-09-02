from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models.deletion import ProtectedError
from django.utils.text import slugify

from rest_framework import permissions, serializers, status, viewsets
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsOwner
from catalog.models import Attribute, AttributeValue, Product, ProductAttribute, ProductVariant
from inventory.models import InventoryItem
from inventory.services import adjust_stock


OWNER_AUTHENTICATION = [TokenAuthentication, SessionAuthentication]
OWNER_PERMISSIONS = [permissions.IsAuthenticated, IsOwner]


def _clean(value):
    return str(value or "").strip()


def _sku(value):
    return _clean(value).upper()


def _attribute_type(name, color_hex=""):
    key = slugify(_clean(name))
    if color_hex or key in {"couleur", "color", "colour"}:
        return "COLOR"
    return "TEXT"


def _get_attribute(name, color_hex=""):
    name = _clean(name)
    if not name:
        raise serializers.ValidationError({"attributes": "Nom d'attribut obligatoire."})

    attr_slug = slugify(name) or "attribut"
    attribute = Attribute.objects.filter(slug=attr_slug).first()

    if attribute is None:
        attribute = Attribute.objects.create(
            name=name,
            slug=attr_slug,
            data_type=_attribute_type(name, color_hex),
        )

    return attribute


def _get_attribute_value(attribute, display_value, color_hex=""):
    display_value = _clean(display_value)
    if not display_value:
        raise serializers.ValidationError({"attributes": "Valeur d'attribut obligatoire."})

    existing = AttributeValue.objects.filter(
        attribute=attribute,
        display_value__iexact=display_value,
    ).first()

    if existing:
        if color_hex and existing.color_hex != color_hex:
            existing.color_hex = color_hex
            existing.save(update_fields=["color_hex"])
        return existing

    base = slugify(display_value) or display_value.lower()
    key = base
    counter = 2

    while AttributeValue.objects.filter(attribute=attribute, value=key).exists():
        key = f"{base}-{counter}"
        counter += 1

    return AttributeValue.objects.create(
        attribute=attribute,
        value=key,
        display_value=display_value,
        color_hex=_clean(color_hex),
    )


def _variant_attributes(variant):
    selections = (
        variant.selections
        .select_related("attribute_value__attribute")
        .all()
        .order_by(
            "attribute_value__attribute__name",
            "attribute_value__display_order",
            "id",
        )
    )

    return [
        {
            "attribute_id": s.attribute_value.attribute_id,
            "attribute": s.attribute_value.attribute.name,
            "attribute_slug": s.attribute_value.attribute.slug,
            "value_id": s.attribute_value_id,
            "value": s.attribute_value.display_value,
            "color_hex": s.attribute_value.color_hex or "",
        }
        for s in selections
    ]


def _inventory(variant):
    try:
        return variant.inventory
    except Exception:
        return None


def _ensure_inventory(product, variant, first_variant):
    """
    Garantit une ligne InventoryItem pour la variante.

    Cas particulier de la premiÃ¨re variante :
    on rÃ©utilise la ligne de stock du produit simple afin de
    conserver son stock, ses rÃ©servations et son historique.

    IMPORTANT PostgreSQL :
    InventoryItem possÃ¨de une relation variant nullable.
    Avec un SELECT FOR UPDATE classique, Django/PostgreSQL peut
    tenter de verrouiller aussi le cÃ´tÃ© nullable d'une jointure
    externe, ce que PostgreSQL refuse.

    On supprime donc tout select_related implicite Ã©ventuel et
    on demande explicitement de verrouiller uniquement la ligne
    InventoryItem elle-mÃªme avec of=("self",).
    """

    item = (
        InventoryItem.objects
        .filter(
            variant_id=variant.pk,
        )
        .first()
    )

    if item:
        return item

    if first_variant:
        base = (
            InventoryItem.objects
            .select_related(None)
            .select_for_update(
                of=("self",),
            )
            .filter(
                product_id=product.pk,
                variant_id__isnull=True,
            )
            .first()
        )

        if base:
            if (
                base.quantity_reserved
                > 0
            ):
                raise serializers.ValidationError(
                    {
                        "stock": (
                            "Impossible de créer la première "
                            "variante pendant qu'une réservation "
                            "checkout existe sur le stock simple. "
                            "Attendez sa conversion, son annulation "
                            "ou son expiration."
                        )
                    }
                )

            base.variant = variant

            base.save(
                update_fields=[
                    "variant",
                    "updated_at",
                ]
            )

            return base

    item, _ = (
        InventoryItem.objects
        .get_or_create(
            product=product,
            variant=variant,
            defaults={
                "quantity_on_hand": 0,
                "quantity_reserved": 0,
                "low_stock_threshold": 5,
            },
        )
    )

    return item


def _parse_attributes(raw):
    if isinstance(raw, str):
        import json
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            raw = []

    return raw if isinstance(raw, list) else []


def _sync_attributes(product, variant, raw_attributes):
    values = []

    for index, item in enumerate(_parse_attributes(raw_attributes), start=1):
        if not isinstance(item, dict):
            continue

        name = _clean(item.get("name"))
        display_value = _clean(item.get("value"))
        color_hex = _clean(item.get("color_hex"))

        if not name or not display_value:
            continue

        attribute = _get_attribute(name, color_hex)

        product_attribute, _ = ProductAttribute.objects.get_or_create(
            product=product,
            attribute=attribute,
            defaults={
                "is_required": False,
                "is_variant_axis": True,
                "display_order": index,
            },
        )

        if not product_attribute.is_variant_axis:
            product_attribute.is_variant_axis = True
            product_attribute.save(update_fields=["is_variant_axis"])

        values.append(
            _get_attribute_value(attribute, display_value, color_hex)
        )

    variant.attribute_values.set(values)


class OwnerProductVariantSerializer(serializers.ModelSerializer):
    attributes = serializers.SerializerMethodField()
    label = serializers.SerializerMethodField()
    stock_on_hand = serializers.SerializerMethodField()
    stock_reserved = serializers.SerializerMethodField()
    stock_available = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "product",
            "sku",
            "barcode",
            "price",
            "image",
            "image_url",
            "is_active",
            "attributes",
            "label",
            "stock_on_hand",
            "stock_reserved",
            "stock_available",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "product",
            "image_url",
            "attributes",
            "label",
            "stock_on_hand",
            "stock_reserved",
            "stock_available",
            "created_at",
            "updated_at",
        )
        extra_kwargs = {
            "image": {
                "write_only": True,
                "required": False,
                "allow_null": True,
            }
        }

    def get_attributes(self, obj):
        return _variant_attributes(obj)

    def get_label(self, obj):
        return " / ".join(
            item["value"]
            for item in _variant_attributes(obj)
            if item["value"]
        )

    def get_stock_on_hand(self, obj):
        item = _inventory(obj)
        return item.quantity_on_hand if item else 0

    def get_stock_reserved(self, obj):
        item = _inventory(obj)
        return item.quantity_reserved if item else 0

    def get_stock_available(self, obj):
        item = _inventory(obj)
        return item.quantity_available if item else 0

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url


class OwnerProductVariantViewSet(viewsets.ViewSet):
    authentication_classes = OWNER_AUTHENTICATION
    permission_classes = OWNER_PERMISSIONS

    def _variant(self, pk):
        return (
            ProductVariant.objects
            .select_related("product")
            .prefetch_related("selections__attribute_value__attribute")
            .filter(pk=pk)
            .first()
        )

    def list(self, request):
        queryset = (
            ProductVariant.objects
            .select_related("product")
            .prefetch_related("selections__attribute_value__attribute")
            .all()
            .order_by("product_id", "id")
        )

        product_id = request.query_params.get("product")
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        return Response(
            OwnerProductVariantSerializer(
                queryset,
                many=True,
                context={"request": request},
            ).data
        )

    def retrieve(self, request, pk=None):
        variant = self._variant(pk)
        if not variant:
            return Response(
                {"detail": "Variante introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            OwnerProductVariantSerializer(
                variant,
                context={"request": request},
            ).data
        )

    @transaction.atomic
    def create(self, request):
        product = Product.objects.filter(pk=request.data.get("product")).first()
        if not product:
            return Response(
                {"detail": "Produit introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        sku = _sku(request.data.get("sku"))
        if not sku:
            return Response(
                {"sku": ["Le SKU de la variante est obligatoire."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ProductVariant.objects.filter(sku__iexact=sku).exists():
            return Response(
                {"sku": ["Une variante avec ce SKU existe dÃ©jÃ ."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_price = request.data.get("price")
        if raw_price is None or _clean(raw_price) == "":
            price = product.base_price
        else:
            try:
                price = Decimal(str(raw_price))
            except (InvalidOperation, TypeError, ValueError):
                return Response(
                    {"price": ["Prix invalide."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if price < 0:
                return Response(
                    {"price": ["Le prix ne peut pas Ãªtre nÃ©gatif."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        previous_count = ProductVariant.objects.filter(product=product).count()

        variant = ProductVariant.objects.create(
            product=product,
            sku=sku,
            barcode=_clean(request.data.get("barcode")),
            price=price,
            image=request.FILES.get("image"),
            is_active=str(request.data.get("is_active", "true")).lower()
            not in {"false", "0", "off", "no"},
        )

        _sync_attributes(
            product,
            variant,
            request.data.get("attributes", []),
        )

        item = _ensure_inventory(
            product,
            variant,
            first_variant=(previous_count == 0),
        )

        raw_stock = request.data.get("stock_quantity")
        if raw_stock is not None and _clean(raw_stock) != "":
            try:
                quantity = int(raw_stock)
            except (TypeError, ValueError):
                transaction.set_rollback(True)
                return Response(
                    {"stock_quantity": ["Le stock doit Ãªtre un entier."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if quantity < 0:
                transaction.set_rollback(True)
                return Response(
                    {"stock_quantity": ["Le stock ne peut pas Ãªtre nÃ©gatif."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if quantity != item.quantity_on_hand:
                adjust_stock(
                    item.pk,
                    quantity,
                    reference="OWNER-VARIANT",
                    note="Stock dÃ©fini depuis la gestion des variantes.",
                    user=request.user,
                )

        variant = self._variant(variant.pk)

        return Response(
            OwnerProductVariantSerializer(
                variant,
                context={"request": request},
            ).data,
            status=status.HTTP_201_CREATED,
        )

    @transaction.atomic
    def partial_update(self, request, pk=None):
        variant = self._variant(pk)
        if not variant:
            return Response(
                {"detail": "Variante introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if "sku" in request.data:
            sku = _sku(request.data.get("sku"))
            if not sku:
                return Response(
                    {"sku": ["Le SKU est obligatoire."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if (
                ProductVariant.objects
                .filter(sku__iexact=sku)
                .exclude(pk=variant.pk)
                .exists()
            ):
                return Response(
                    {"sku": ["Une autre variante utilise dÃ©jÃ  ce SKU."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            variant.sku = sku

        if "barcode" in request.data:
            variant.barcode = _clean(request.data.get("barcode"))

        if "price" in request.data:
            raw_price = request.data.get("price")
            try:
                variant.price = (
                    variant.product.base_price
                    if _clean(raw_price) == ""
                    else Decimal(str(raw_price))
                )
            except (InvalidOperation, TypeError, ValueError):
                return Response(
                    {"price": ["Prix invalide."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if variant.price < 0:
                return Response(
                    {"price": ["Le prix ne peut pas Ãªtre nÃ©gatif."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if "is_active" in request.data:
            variant.is_active = str(request.data.get("is_active")).lower() not in {
                "false",
                "0",
                "off",
                "no",
            }

        image = request.FILES.get("image")
        if image:
            variant.image = image

        variant.save()

        if "attributes" in request.data:
            _sync_attributes(
                variant.product,
                variant,
                request.data.get("attributes", []),
            )

        item = _inventory(variant)
        if item is None:
            item = _ensure_inventory(
                variant.product,
                variant,
                first_variant=False,
            )

        if "stock_quantity" in request.data:
            try:
                quantity = int(request.data.get("stock_quantity"))
            except (TypeError, ValueError):
                return Response(
                    {"stock_quantity": ["Le stock doit Ãªtre un entier."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if quantity < 0:
                return Response(
                    {"stock_quantity": ["Le stock ne peut pas Ãªtre nÃ©gatif."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if quantity != item.quantity_on_hand:
                adjust_stock(
                    item.pk,
                    quantity,
                    reference="OWNER-VARIANT",
                    note="Ajustement depuis la fiche variante.",
                    user=request.user,
                )

        variant = self._variant(variant.pk)

        return Response(
            OwnerProductVariantSerializer(
                variant,
                context={"request": request},
            ).data
        )

    def update(self, request, pk=None):
        return self.partial_update(request, pk=pk)

    @transaction.atomic
    def destroy(self, request, pk=None):
        variant = self._variant(pk)

        if not variant:
            return Response(
                status=(
                    status.HTTP_204_NO_CONTENT
                )
            )

        item = _inventory(
            variant
        )

        if (
            item
            and (
                item.quantity_on_hand > 0
                or item.quantity_reserved > 0
            )
        ):
            return Response(
                {
                    "detail": (
                        "Impossible de supprimer une variante "
                        "qui possède encore du stock. "
                        "Mettez son stock à 0 ou désactivez-la."
                    )
                },
                status=(
                    status.HTTP_409_CONFLICT
                ),
            )

        has_history = (
            variant.checkout_items.exists()
            or variant.order_items.exists()
            or (
                item is not None
                and (
                    item.checkout_items.exists()
                    or item.order_items.exists()
                    or item.movements.exists()
                )
            )
        )

        if has_history:
            return Response(
                {
                    "detail": (
                        "Cette variante possède déjà un historique "
                        "(checkout, commande ou mouvement de stock). "
                        "Désactivez-la au lieu de la supprimer."
                    )
                },
                status=(
                    status.HTTP_409_CONFLICT
                ),
            )

        product = variant.product

        try:
            # InventoryItem est en CASCADE depuis ProductVariant.
            # La variante est donc supprimée en premier.
            variant.delete()

        except ProtectedError:
            transaction.set_rollback(
                True
            )

            return Response(
                {
                    "detail": (
                        "Cette variante possède déjà des données "
                        "liées. Désactivez-la au lieu de la supprimer."
                    )
                },
                status=(
                    status.HTTP_409_CONFLICT
                ),
            )

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

        return Response(
            status=(
                status.HTTP_204_NO_CONTENT
            )
        )

    @action(detail=False, methods=["get"], url_path="metadata")
    def metadata(self, request):
        attributes = (
            Attribute.objects
            .prefetch_related("values")
            .all()
            .order_by("name")
        )

        return Response(
            {
                "attributes": [
                    {
                        "id": attribute.pk,
                        "name": attribute.name,
                        "slug": attribute.slug,
                        "data_type": attribute.data_type,
                        "values": [
                            {
                                "id": value.pk,
                                "value": value.value,
                                "display_value": value.display_value,
                                "color_hex": value.color_hex or "",
                            }
                            for value in attribute.values.all().order_by(
                                "display_order",
                                "id",
                            )
                        ],
                    }
                    for attribute in attributes
                ]
            }
        )
