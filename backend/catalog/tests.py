from decimal import Decimal
from io import BytesIO

from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image

from .models import (
    Attribute,
    AttributeValue,
    Brand,
    Category,
    Product,
    ProductAttribute,
    ProductImage,
    ProductVariant,
    VariantAttributeSelection,
)


class CatalogBaseTestCase(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name="Smartphones",
        )

        self.brand = Brand.objects.create(
            name="Samsung",
        )

    def create_product(self, **kwargs):
        data = {
            "name": "Samsung Galaxy A26",
            "sku": "SAM-A26",
            "category": self.category,
            "brand": self.brand,
            "base_price": Decimal(
                "150000.00"
            ),
            "status": Product.Status.ACTIVE,
        }

        data.update(kwargs)

        return Product.objects.create(
            **data
        )


class CategoryModelTests(TestCase):
    def test_create_root_category(self):
        category = Category.objects.create(
            name="Téléphones",
        )

        self.assertEqual(
            category.slug,
            "telephones",
        )

        self.assertTrue(
            category.is_root
        )

    def test_create_subcategory(self):
        parent = Category.objects.create(
            name="Téléphones",
        )

        child = Category.objects.create(
            name="Smartphones",
            parent=parent,
        )

        self.assertEqual(
            child.parent,
            parent,
        )

    def test_category_slug_is_unique(self):
        first = Category.objects.create(
            name="Téléphones",
        )

        second = Category.objects.create(
            name="Téléphones",
        )

        self.assertEqual(
            first.slug,
            "telephones",
        )

        self.assertEqual(
            second.slug,
            "telephones-2",
        )

    def test_category_cannot_be_its_own_parent(
        self
    ):
        category = Category.objects.create(
            name="Électricité",
        )

        category.parent = category

        with self.assertRaises(
            ValidationError
        ):
            category.full_clean()


class BrandModelTests(TestCase):
    def test_create_brand(self):
        brand = Brand.objects.create(
            name="Samsung",
        )

        self.assertEqual(
            brand.slug,
            "samsung",
        )

    def test_brand_name_must_be_unique(self):
        Brand.objects.create(
            name="Infinix",
        )

        duplicate = Brand(
            name="Infinix",
        )

        with self.assertRaises(
            ValidationError
        ):
            duplicate.full_clean()


class ProductModelTests(
    CatalogBaseTestCase
):
    def test_create_product(self):
        product = self.create_product()

        self.assertEqual(
            product.slug,
            "samsung-galaxy-a26",
        )

        self.assertEqual(
            product.sku,
            "SAM-A26",
        )

        self.assertTrue(
            product.is_public
        )

    def test_sku_is_normalized_uppercase(self):
        product = self.create_product(
            sku=" sam-a26-5g ",
        )

        self.assertEqual(
            product.sku,
            "SAM-A26-5G",
        )

    def test_duplicate_product_slug_is_unique(
        self
    ):
        first = self.create_product()

        second = self.create_product(
            sku="SAM-A26-B",
        )

        self.assertEqual(
            first.slug,
            "samsung-galaxy-a26",
        )

        self.assertEqual(
            second.slug,
            "samsung-galaxy-a26-2",
        )

    def test_negative_price_is_rejected(self):
        with self.assertRaises(
            ValidationError
        ):
            self.create_product(
                sku="BAD-PRICE",
                base_price=Decimal(
                    "-100.00"
                ),
            )


class AttributeModelTests(
    CatalogBaseTestCase
):
    def test_create_attribute_and_values(self):
        color = Attribute.objects.create(
            name="Couleur",
            data_type=Attribute.DataType.COLOR,
        )

        black = AttributeValue.objects.create(
            attribute=color,
            value="Noir",
            color_hex="#000000",
        )

        self.assertEqual(
            color.slug,
            "couleur",
        )

        self.assertEqual(
            black.display_value,
            "Noir",
        )


class ProductVariantTests(
    CatalogBaseTestCase
):
    def setUp(self):
        super().setUp()

        self.product = self.create_product()

        self.storage = (
            Attribute.objects.create(
                name="Stockage",
            )
        )

        self.color = (
            Attribute.objects.create(
                name="Couleur",
                data_type=(
                    Attribute.DataType.COLOR
                ),
            )
        )

        self.storage_128 = (
            AttributeValue.objects.create(
                attribute=self.storage,
                value="128 Go",
            )
        )

        self.black = (
            AttributeValue.objects.create(
                attribute=self.color,
                value="Noir",
                color_hex="#000000",
            )
        )

        ProductAttribute.objects.create(
            product=self.product,
            attribute=self.storage,
            is_required=True,
            is_variant_axis=True,
        )

        ProductAttribute.objects.create(
            product=self.product,
            attribute=self.color,
            is_required=True,
            is_variant_axis=True,
        )

    def test_variant_uses_product_price(self):
        variant = (
            ProductVariant.objects.create(
                product=self.product,
                sku="SAM-A26-128-BLK",
            )
        )

        self.assertEqual(
            variant.effective_price,
            Decimal("150000.00"),
        )

    def test_variant_can_have_custom_price(self):
        variant = (
            ProductVariant.objects.create(
                product=self.product,
                sku="SAM-A26-256-BLK",
                price=Decimal(
                    "165000.00"
                ),
            )
        )

        self.assertEqual(
            variant.effective_price,
            Decimal("165000.00"),
        )

    def test_variant_attributes(self):
        variant = (
            ProductVariant.objects.create(
                product=self.product,
                sku="SAM-A26-128-BLK",
            )
        )

        VariantAttributeSelection.objects.create(
            variant=variant,
            attribute_value=self.storage_128,
        )

        VariantAttributeSelection.objects.create(
            variant=variant,
            attribute_value=self.black,
        )

        self.assertEqual(
            variant.attribute_values.count(),
            2,
        )

        self.assertIn(
            "128 Go",
            variant.display_name,
        )

        self.assertIn(
            "Noir",
            variant.display_name,
        )

    def test_same_attribute_cannot_be_selected_twice(
        self
    ):
        storage_256 = (
            AttributeValue.objects.create(
                attribute=self.storage,
                value="256 Go",
            )
        )

        variant = (
            ProductVariant.objects.create(
                product=self.product,
                sku="SAM-A26-TEST",
            )
        )

        VariantAttributeSelection.objects.create(
            variant=variant,
            attribute_value=self.storage_128,
        )

        duplicate = VariantAttributeSelection(
            variant=variant,
            attribute_value=storage_256,
        )

        with self.assertRaises(
            ValidationError
        ):
            duplicate.full_clean()


class ProductImageTests(
    CatalogBaseTestCase
):
    def make_test_image(self):
        buffer = BytesIO()

        image = Image.new(
            "RGB",
            (
                600,
                600,
            ),
            "white",
        )

        image.save(
            buffer,
            format="PNG",
        )

        return SimpleUploadedFile(
            "galaxy-a26.png",
            buffer.getvalue(),
            content_type="image/png",
        )

    def test_product_image_becomes_webp(self):
        product = self.create_product()

        product_image = (
            ProductImage.objects.create(
                product=product,
                image=self.make_test_image(),
                is_primary=True,
            )
        )

        self.assertTrue(
            product_image.image.name.endswith(
                ".webp"
            )
        )

        self.assertEqual(
            product_image.alt_text,
            product.name,
        )

        product_image.image.delete(
            save=False
        )