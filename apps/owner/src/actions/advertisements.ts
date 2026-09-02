"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  ownerFetch,
} from "@/lib/backend";


export interface AdvertisementActionState {
  success: boolean;
  error: string;
}


const INITIAL_STATE:
  AdvertisementActionState = {
  success: false,
  error: "",
};


function cleanFile(
  formData: FormData,
  name: string,
) {
  const value =
    formData.get(
      name,
    );

  if (
    value instanceof File
    &&
    value.size === 0
  ) {
    formData.delete(
      name,
    );
  }
}


function cleanOptional(
  formData: FormData,
  name: string,
) {
  const value =
    formData.get(
      name,
    );

  if (
    value === null
    ||
    String(
      value,
    ).trim() === ""
  ) {
    formData.delete(
      name,
    );
  }
}


function prepareAdvertisementFormData(
  formData: FormData,
) {
  cleanFile(
    formData,
    "company_logo",
  );

  cleanFile(
    formData,
    "desktop_image",
  );

  cleanFile(
    formData,
    "mobile_image",
  );


  for (
    const field
    of [
      "promotion",
      "display_old_price",
      "display_price",
      "destination_product",
      "destination_category",
      "destination_brand",
    ]
  ) {
    cleanOptional(
      formData,
      field,
    );
  }


  formData.set(
    "is_active",
    String(
      formData.get(
        "is_active",
      ) === "on",
    ),
  );

  formData.set(
    "hide_after_expiry",
    String(
      formData.get(
        "hide_after_expiry",
      ) === "on",
    ),
  );


  const categories =
    formData
      .getAll(
        "target_categories",
      )
      .filter(
        (
          value,
        ) =>
          String(
            value,
          ).trim() !== "",
      );

  formData.set(
    "clear_target_categories",
    String(
      categories.length ===
      0,
    ),
  );

  return formData;
}


function errorMessage(
  error: unknown,
) {
  if (
    error instanceof Error
    &&
    error.message
  ) {
    return error.message;
  }

  return (
    "Impossible d'enregistrer "
    + "la publicité."
  );
}


function revalidateAdvertisements() {
  revalidatePath(
    "/publicites",
  );

  revalidatePath(
    "/",
  );
}


export async function createAdvertisementAction(
  previousState:
    AdvertisementActionState =
      INITIAL_STATE,
  formData: FormData,
): Promise<
  AdvertisementActionState
> {
  void previousState;

  try {
    await ownerFetch(
      "/owner/advertisements/",
      {
        method:
          "POST",

        body:
          prepareAdvertisementFormData(
            formData,
          ),
      },
    );

    revalidateAdvertisements();

    return {
      success: true,
      error: "",
    };
  }
  catch (
    error
  ) {
    return {
      success: false,
      error:
        errorMessage(
          error,
        ),
    };
  }
}


export async function updateAdvertisementAction(
  advertisementId: number,
  previousState:
    AdvertisementActionState,
  formData: FormData,
): Promise<
  AdvertisementActionState
> {
  void previousState;

  try {
    await ownerFetch(
      `/owner/advertisements/${advertisementId}/`,
      {
        method:
          "PATCH",

        body:
          prepareAdvertisementFormData(
            formData,
          ),
      },
    );

    revalidateAdvertisements();

    return {
      success: true,
      error: "",
    };
  }
  catch (
    error
  ) {
    return {
      success: false,
      error:
        errorMessage(
          error,
        ),
    };
  }
}


export async function toggleAdvertisementAction(
  formData: FormData,
) {
  const advertisementId =
    Number(
      formData.get(
        "advertisement_id",
      ),
    );

  if (
    !Number.isFinite(
      advertisementId,
    )
  ) {
    throw new Error(
      "Publicité invalide.",
    );
  }

  await ownerFetch(
    `/owner/advertisements/${advertisementId}/toggle/`,
    {
      method:
        "POST",
    },
  );

  revalidateAdvertisements();
}


export async function deleteAdvertisementAction(
  formData: FormData,
) {
  const advertisementId =
    Number(
      formData.get(
        "advertisement_id",
      ),
    );

  if (
    !Number.isFinite(
      advertisementId,
    )
  ) {
    throw new Error(
      "Publicité invalide.",
    );
  }

  await ownerFetch(
    `/owner/advertisements/${advertisementId}/`,
    {
      method:
        "DELETE",
    },
  );

  revalidateAdvertisements();
}
