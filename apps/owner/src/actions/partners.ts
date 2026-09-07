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
    `/partenaires?${params.toString()}`,
  );
}


function normalizedFormData(
  source: FormData,
  options: {
    requireLogo: boolean;
  },
) {
  const {
    requireLogo,
  } = options;

  const data = new FormData();

  const name = String(
    source.get("name") ?? "",
  ).trim();

  const description = String(
    source.get("description") ?? "",
  ).trim();

  const website = String(
    source.get("website") ?? "",
  ).trim();

  const pageUrl = String(
    source.get("page_url") ?? "",
  ).trim();

  const displayOrder = String(
    source.get("display_order") ?? "0",
  ).trim() || "0";

  const logo = source.get("logo");

  data.set("name", name);
  data.set(
    "description",
    description,
  );
  data.set("website", website);
  data.set("page_url", pageUrl);
  data.set(
    "display_order",
    displayOrder,
  );
  data.set(
    "is_active",
    source.get("is_active")
      ? "true"
      : "false",
  );

  if (
    logo instanceof File
    && logo.size > 0
  ) {
    data.set("logo", logo);
  }
  else if (requireLogo) {
    throw new Error(
      "Ajoutez le logo du partenaire.",
    );
  }

  if (!name) {
    throw new Error(
      "Le nom du partenaire est obligatoire.",
    );
  }

  return data;
}


export async function createPartnerAction(
  formData: FormData,
) {
  let errorMessage = "";

  try {
    const body = normalizedFormData(
      formData,
      {
        requireLogo: true,
      },
    );

    await ownerFetch(
      "/owner/partners/",
      {
        method: "POST",
        body,
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

  revalidatePath("/partenaires");
  revalidatePath("/");

  redirectWith(
    "success",
    "Partenaire ajouté avec succès.",
  );
}


export async function updatePartnerAction(
  partnerId: number,
  formData: FormData,
) {
  let errorMessage = "";

  try {
    const body = normalizedFormData(
      formData,
      {
        requireLogo: false,
      },
    );

    await ownerFetch(
      `/owner/partners/${partnerId}/`,
      {
        method: "PATCH",
        body,
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

  revalidatePath("/partenaires");
  revalidatePath("/");

  redirectWith(
    "success",
    "Partenaire modifié avec succès.",
  );
}


export async function togglePartnerAction(
  partnerId: number,
) {
  let errorMessage = "";

  try {
    await ownerFetch(
      `/owner/partners/${partnerId}/toggle/`,
      {
        method: "POST",
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

  revalidatePath("/partenaires");
  revalidatePath("/");

  redirectWith(
    "success",
    "Statut du partenaire mis à jour.",
  );
}


export async function deletePartnerAction(
  partnerId: number,
) {
  let errorMessage = "";

  try {
    await ownerFetch(
      `/owner/partners/${partnerId}/`,
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

  revalidatePath("/partenaires");
  revalidatePath("/");

  redirectWith(
    "success",
    "Partenaire supprimé.",
  );
}
