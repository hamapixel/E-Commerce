from io import BytesIO
from pathlib import Path
from uuid import uuid4

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from PIL import (
    Image,
    ImageOps,
    UnidentifiedImageError,
)


MAX_AD_IMAGE_SIZE = 15 * 1024 * 1024

WEBP_QUALITY = 90


def validate_ad_image(uploaded_file):
    """
    Vérifie qu'un fichier publicitaire est une vraie image.

    Limite :
    15 Mo.
    """

    if not uploaded_file:
        return

    if uploaded_file.size > MAX_AD_IMAGE_SIZE:
        raise ValidationError(
            "L'image ne doit pas dépasser 15 Mo."
        )

    try:
        uploaded_file.seek(0)

        image = Image.open(
            uploaded_file
        )

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


def optimize_ad_image(
    uploaded_file,
    *,
    max_width,
    max_height,
):
    """
    Optimise une image sans la découper.

    Important pour SUGU KURA :

    - aucun crop automatique ;
    - conservation du ratio ;
    - correction EXIF ;
    - conversion WebP ;
    - bonne qualité.

    Desktop :
    dimensions plus larges.

    Mobile :
    composition potentiellement carrée/verticale.
    """

    validate_ad_image(
        uploaded_file
    )

    uploaded_file.seek(0)

    image = Image.open(
        uploaded_file
    )

    image = ImageOps.exif_transpose(
        image
    )

    if image.mode in (
        "RGBA",
        "LA",
    ):
        image = image.convert(
            "RGBA"
        )

    elif image.mode == "P":
        if "transparency" in image.info:
            image = image.convert(
                "RGBA"
            )
        else:
            image = image.convert(
                "RGB"
            )

    elif image.mode != "RGB":
        image = image.convert(
            "RGB"
        )

    image.thumbnail(
        (
            max_width,
            max_height,
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
            "advertisement",
        )
    ).stem

    safe_stem = "".join(
        char
        if char.isalnum()
        or char in "-_"
        else "-"
        for char in original_stem
    ).strip("-_")

    if not safe_stem:
        safe_stem = "advertisement"

    filename = (
        f"{safe_stem}-"
        f"{uuid4().hex[:12]}.webp"
    )

    return ContentFile(
        output.read(),
        name=filename,
    )