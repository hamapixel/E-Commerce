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


function getText(
  formData: FormData,
  name: string,
) {
  const value =
    formData.get(name);

  if (value === null) {
    return "";
  }

  return String(value).trim();
}


function getPositiveInteger(
  formData: FormData,
  name: string,
) {
  const value =
    Number(
      formData.get(name),
    );

  if (
    !Number.isInteger(value)
    ||
    value <= 0
  ) {
    throw new Error(
      "La quantité doit être un entier supérieur à zéro.",
    );
  }

  return value;
}


function getNonNegativeInteger(
  formData: FormData,
  name: string,
) {
  const value =
    Number(
      formData.get(name),
    );

  if (
    !Number.isInteger(value)
    ||
    value < 0
  ) {
    throw new Error(
      "La valeur doit être un entier positif ou zéro.",
    );
  }

  return value;
}


function safeReturnTo(
  formData: FormData,
) {
  const returnTo =
    getText(
      formData,
      "return_to",
    );

  if (
    returnTo.startsWith(
      "/stock",
    )
  ) {
    return returnTo;
  }

  return "/stock";
}


function successUrl(
  returnTo: string,
  operation: string,
) {
  const separator =
    returnTo.includes("?")
      ? "&"
      : "?";

  return (
    `${returnTo}${separator}` +
    `stock_updated=1&operation=${operation}`
  );
}


// ============================================================
// ENTRÉE DE STOCK
// ============================================================

export async function receiveStockAction(
  itemId: number,
  formData: FormData,
) {
  const quantity =
    getPositiveInteger(
      formData,
      "quantity",
    );

  const reference =
    getText(
      formData,
      "reference",
    );

  const note =
    getText(
      formData,
      "note",
    );

  const returnTo =
    safeReturnTo(
      formData,
    );


  await ownerFetch(
    `/owner/inventory/${itemId}/action/`,
    {
      method: "POST",

      body: JSON.stringify({
        operation: "RECEIVE",
        quantity,
        reference,
        note,
      }),
    },
  );


  revalidatePath(
    "/stock",
  );

  revalidatePath(
    "/",
  );

  revalidatePath(
    "/catalogue/produits",
  );


  redirect(
    successUrl(
      returnTo,
      "receive",
    ),
  );
}


// ============================================================
// SORTIE DE STOCK
// ============================================================

export async function removeStockAction(
  itemId: number,
  formData: FormData,
) {
  const quantity =
    getPositiveInteger(
      formData,
      "quantity",
    );

  const reference =
    getText(
      formData,
      "reference",
    );

  const note =
    getText(
      formData,
      "note",
    );

  const returnTo =
    safeReturnTo(
      formData,
    );


  await ownerFetch(
    `/owner/inventory/${itemId}/action/`,
    {
      method: "POST",

      body: JSON.stringify({
        operation: "REMOVE",
        quantity,
        reference,
        note,
      }),
    },
  );


  revalidatePath(
    "/stock",
  );

  revalidatePath(
    "/",
  );

  revalidatePath(
    "/catalogue/produits",
  );


  redirect(
    successUrl(
      returnTo,
      "remove",
    ),
  );
}


// ============================================================
// AJUSTEMENT APRÈS INVENTAIRE
// ============================================================

export async function adjustStockAction(
  itemId: number,
  formData: FormData,
) {
  const newQuantity =
    getNonNegativeInteger(
      formData,
      "new_quantity",
    );

  const reference =
    getText(
      formData,
      "reference",
    );

  const note =
    getText(
      formData,
      "note",
    );

  const returnTo =
    safeReturnTo(
      formData,
    );


  await ownerFetch(
    `/owner/inventory/${itemId}/action/`,
    {
      method: "POST",

      body: JSON.stringify({
        operation: "ADJUST",
        new_quantity:
          newQuantity,
        reference,
        note,
      }),
    },
  );


  revalidatePath(
    "/stock",
  );

  revalidatePath(
    "/",
  );

  revalidatePath(
    "/catalogue/produits",
  );


  redirect(
    successUrl(
      returnTo,
      "adjust",
    ),
  );
}


// ============================================================
// SEUIL D'ALERTE
// ============================================================

export async function updateStockThresholdAction(
  itemId: number,
  formData: FormData,
) {
  const threshold =
    getNonNegativeInteger(
      formData,
      "low_stock_threshold",
    );

  const returnTo =
    safeReturnTo(
      formData,
    );


  await ownerFetch(
    `/owner/inventory/${itemId}/action/`,
    {
      method: "POST",

      body: JSON.stringify({
        operation: "THRESHOLD",

        low_stock_threshold:
          threshold,
      }),
    },
  );


  revalidatePath(
    "/stock",
  );

  revalidatePath(
    "/",
  );


  redirect(
    successUrl(
      returnTo,
      "threshold",
    ),
  );
}