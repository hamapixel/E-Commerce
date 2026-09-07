"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  ownerFetch,
} from "@/lib/backend";


export interface ProductPromotionActionState {
  error: string;
  success: string;
}


function value(
  formData: FormData,
  name: string,
) {
  const entry =
    formData.get(name);

  return entry === null
    ? ""
    : String(entry).trim();
}


function isNextRedirectError(
  error: unknown,
) {
  if (
    !error
    ||
    typeof error !== "object"
    ||
    !("digest" in error)
  ) {
    return false;
  }

  return String(
    (
      error as {
        digest?: unknown;
      }
    ).digest ?? "",
  ).startsWith(
    "NEXT_REDIRECT",
  );
}


export async function updateProductPromotionAction(
  productId: number,
  previousState: ProductPromotionActionState,
  formData: FormData,
): Promise<ProductPromotionActionState> {
  void previousState;

  const enabled =
    formData.get(
      "promotion_enabled",
    ) === "on";

  const price = value(
    formData,
    "promotion_price",
  );

  const normalPrice = value(
    formData,
    "promotion_normal_price",
  );

  const startAt = value(
    formData,
    "promotion_start_at",
  );

  const endAt = value(
    formData,
    "promotion_end_at",
  );

  if (enabled) {
    if (!price) {
      return {
        error:
          "Saisissez le nouveau prix promotionnel.",
        success: "",
      };
    }

    const parsedPrice =
      Number(price);

    const parsedNormalPrice =
      Number(normalPrice);

    if (
      !Number.isFinite(parsedPrice)
      ||
      parsedPrice <= 0
    ) {
      return {
        error:
          "Le prix promotionnel doit être supérieur à 0.",
        success: "",
      };
    }

    if (
      Number.isFinite(
        parsedNormalPrice,
      )
      &&
      parsedNormalPrice > 0
      &&
      parsedPrice >= parsedNormalPrice
    ) {
      return {
        error:
          "Le nouveau prix doit être inférieur au prix normal.",
        success: "",
      };
    }

    if (!startAt || !endAt) {
      return {
        error:
          "Choisissez la date de début et la date de fin.",
        success: "",
      };
    }

    const startTime =
      new Date(startAt).getTime();

    const endTime =
      new Date(endAt).getTime();

    if (
      !Number.isFinite(startTime)
      ||
      !Number.isFinite(endTime)
    ) {
      return {
        error:
          "Les dates de promotion sont invalides.",
        success: "",
      };
    }

    if (endTime <= startTime) {
      return {
        error:
          "La date de fin doit être après la date de début.",
        success: "",
      };
    }
  }

  try {
    await ownerFetch(
      `/owner/catalog/products/${productId}/promotion/`,
      {
        method: "PUT",
        body: JSON.stringify({
          enabled,
          price:
            enabled
              ? price
              : null,
          start_at:
            enabled
              ? startAt
              : null,
          end_at:
            enabled
              ? endAt
              : null,
        }),
      },
    );
  }
  catch (error) {
    if (
      isNextRedirectError(
        error,
      )
    ) {
      throw error;
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer la promotion.",
      success: "",
    };
  }

  revalidatePath(
    `/catalogue/produits/${productId}`,
  );

  revalidatePath(
    `/catalogue/produits/${productId}/modifier`,
  );

  return {
    error: "",
    success:
      enabled
        ? "Promotion enregistrée avec succès."
        : "Promotion désactivée. Le prix normal est de nouveau actif.",
  };
}
