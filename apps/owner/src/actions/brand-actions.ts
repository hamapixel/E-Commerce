"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  ownerFetch,
} from "@/lib/backend";


function checkbox(
  formData: FormData,
  name: string,
) {
  return (
    formData.get(name) ===
    "on"
  );
}


function cleanFile(
  formData: FormData,
  name: string,
) {
  const value =
    formData.get(name);

  if (
    value instanceof File
    &&
    value.size === 0
  ) {
    formData.delete(name);
  }
}


function revalidateBrands() {
  revalidatePath(
    "/catalogue",
  );

  revalidatePath(
    "/catalogue/marques",
  );

  revalidatePath(
    "/catalogue/produits",
  );
}


export async function updateBrandAction(
  brandId: number,
  formData: FormData,
) {
  cleanFile(
    formData,
    "logo",
  );

  formData.set(
    "is_active",
    String(
      checkbox(
        formData,
        "is_active",
      ),
    ),
  );

  formData.set(
    "is_featured",
    String(
      checkbox(
        formData,
        "is_featured",
      ),
    ),
  );

  await ownerFetch(
    `/owner/catalog/brands/${brandId}/`,
    {
      method: "PATCH",
      body: formData,
    },
  );

  revalidateBrands();
}


export async function toggleBrandAction(
  brandId: number,
  currentState: boolean,
) {
  await ownerFetch(
    `/owner/catalog/brands/${brandId}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        is_active:
          !currentState,
      }),
    },
  );

  revalidateBrands();
}


export async function deleteBrandAction(
  brandId: number,
) {
  await ownerFetch(
    `/owner/catalog/brands/${brandId}/`,
    {
      method: "DELETE",
    },
  );

  revalidateBrands();
}
