"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  ownerFetch,
} from "@/lib/backend";


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


export async function updateProductPromotionAction(
  productId: number,
  formData: FormData,
) {
  const enabled =
    formData.get(
      "promotion_enabled",
    ) === "on";

  const price = value(
    formData,
    "promotion_price",
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
      throw new Error(
        "Saisissez le prix promotionnel.",
      );
    }

    if (!startAt || !endAt) {
      throw new Error(
        "Choisissez la date de début et la date de fin.",
      );
    }
  }

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

  revalidatePath(
    `/catalogue/produits/${productId}`,
  );

  revalidatePath(
    `/catalogue/produits/${productId}/modifier`,
  );

  redirect(
    `/catalogue/produits/${productId}/modifier?promo=1`,
  );
}
