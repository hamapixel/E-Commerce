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


function messageOf(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Une erreur est survenue.";
}


function redirectWith(
  kind: "success" | "error",
  message: string,
): never {
  const params =
    new URLSearchParams({
      [kind]: message,
    });

  redirect(
    `/livraison?${params.toString()}`,
  );
}


function deliveryZoneData(
  source: FormData,
) {
  const name = String(
    source.get("name") ?? "",
  ).trim();

  const city = String(
    source.get("city") ?? "Bamako",
  ).trim() || "Bamako";

  const fee = String(
    source.get("fee") ?? "0",
  ).trim() || "0";

  const estimatedDelivery = String(
    source.get(
      "estimated_delivery",
    ) ?? "",
  ).trim();

  const displayOrder = String(
    source.get(
      "display_order",
    ) ?? "0",
  ).trim() || "0";

  if (!name) {
    throw new Error(
      "Le nom de la zone est obligatoire.",
    );
  }

  const amount = Number(fee);

  if (
    !Number.isFinite(amount)
    || amount < 0
  ) {
    throw new Error(
      "Le tarif de livraison doit être un montant positif ou zéro.",
    );
  }

  return {
    name,
    city,
    fee,
    estimated_delivery:
      estimatedDelivery,
    display_order:
      Number(displayOrder) || 0,
    is_active:
      source.get("is_active")
        ? true
        : false,
  };
}


export async function createDeliveryZoneAction(
  formData: FormData,
) {
  let errorMessage = "";

  try {
    await ownerFetch(
      "/owner/delivery-zones/",
      {
        method: "POST",
        body: JSON.stringify(
          deliveryZoneData(
            formData,
          ),
        ),
      },
    );
  }
  catch (error) {
    errorMessage = messageOf(error);
  }

  if (errorMessage) {
    redirectWith(
      "error",
      errorMessage,
    );
  }

  revalidatePath("/livraison");

  redirectWith(
    "success",
    "Zone de livraison ajoutée.",
  );
}


export async function updateDeliveryZoneAction(
  zoneId: number,
  formData: FormData,
) {
  let errorMessage = "";

  try {
    await ownerFetch(
      `/owner/delivery-zones/${zoneId}/`,
      {
        method: "PATCH",
        body: JSON.stringify(
          deliveryZoneData(
            formData,
          ),
        ),
      },
    );
  }
  catch (error) {
    errorMessage = messageOf(error);
  }

  if (errorMessage) {
    redirectWith(
      "error",
      errorMessage,
    );
  }

  revalidatePath("/livraison");

  redirectWith(
    "success",
    "Zone de livraison modifiée.",
  );
}


export async function toggleDeliveryZoneAction(
  zoneId: number,
  currentState: boolean,
) {
  let errorMessage = "";

  try {
    await ownerFetch(
      `/owner/delivery-zones/${zoneId}/`,
      {
        method: "PATCH",
        body: JSON.stringify({
          is_active:
            !currentState,
        }),
      },
    );
  }
  catch (error) {
    errorMessage = messageOf(error);
  }

  if (errorMessage) {
    redirectWith(
      "error",
      errorMessage,
    );
  }

  revalidatePath("/livraison");

  redirectWith(
    "success",
    "Statut de la zone mis à jour.",
  );
}


export async function deleteDeliveryZoneAction(
  zoneId: number,
) {
  let errorMessage = "";

  try {
    await ownerFetch(
      `/owner/delivery-zones/${zoneId}/`,
      {
        method: "DELETE",
      },
    );
  }
  catch (error) {
    errorMessage = messageOf(error);
  }

  if (errorMessage) {
    redirectWith(
      "error",
      errorMessage,
    );
  }

  revalidatePath("/livraison");

  redirectWith(
    "success",
    "Zone de livraison supprimée.",
  );
}
