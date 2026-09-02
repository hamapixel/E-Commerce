from io import BytesIO
from pathlib import Path
from uuid import uuid4

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError


MAX_IMAGE_SIZE = 12 * 1024 * 1024

MAX_IMAGE_WIDTH = 1800
MAX_IMAGE_HEIGHT = 1800

WEBP_QUALITY = 88


def validate_catalog_image(uploaded_file):
    """
    Vérifie qu'un fichier envoyé est réellement une image
    exploitable par SUGU KURA.

    Taille maximale :
    12 Mo.
    """

    if not uploaded_file:
        return

    if uploaded_file.size > MAX_IMAGE_SIZE:
        raise ValidationError(
            "L'image ne doit pas dépasser 12 Mo."
        )

    try:
        uploaded_file.seek(0)

        image = Image.open(uploaded_file)
        image.verify()

    except (
        UnidentifiedImageError,
        OSError,
        ValueError,
    ) as exc:
        raise ValidationError(
            "Le fichier envoyé n'est pas une image valide."
        ) from exc

    finally:
        try:
            uploaded_file.seek(0)
        except Exception:
            pass


def optimize_uploaded_image(uploaded_file):
    """
    Convertit une image produit en WebP.

    - aucune découpe ;
    - conservation du ratio ;
    - orientation EXIF corrigée ;
    - taille maximale 1800 x 1800 ;
    - qualité WebP 88.

    L'objectif est de garder le produit entièrement visible.
    """

    uploaded_file.seek(0)

    image = Image.open(uploaded_file)

    image = ImageOps.exif_transpose(image)

    if image.mode in (
        "RGBA",
        "LA",
    ):
        image = image.convert("RGBA")

    elif image.mode == "P":
        if "transparency" in image.info:
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")

    elif image.mode != "RGB":
        image = image.convert("RGB")

    image.thumbnail(
        (
            MAX_IMAGE_WIDTH,
            MAX_IMAGE_HEIGHT,
        ),
        Image.Resampling.LANCZOS,
    )

    output = BytesIO()

    image.save(
        output,
        format="WEBP",
        quality=WEBP_QUALITY,
        method=6,
    )

    output.seek(0)

    original_stem = Path(
        getattr(
            uploaded_file,
            "name",
            "product",
        )
    ).stem

    safe_stem = "".join(
        char
        if char.isalnum() or char in "-_"
        else "-"
        for char in original_stem
    ).strip("-_")

    if not safe_stem:
        safe_stem = "product"

    filename = (
        f"{safe_stem}-"
        f"{uuid4().hex[:12]}.webp"
    )

    return ContentFile(
        output.read(),
        name=filename,
    )