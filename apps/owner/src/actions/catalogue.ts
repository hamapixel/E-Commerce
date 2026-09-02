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


// ============================================================
// TYPES INTERNES
// ============================================================

interface CreatedProductResponse {
  id: number;
}


interface ProductVariantDraftPayload {
  client_key: string;
  sku: string;
  barcode?: string;
  price?: string;
  stock_quantity?: string;
  is_active?: boolean;
  attributes?: Array<{
    name: string;
    value: string;
    color_hex?: string;
  }>;
}


// ============================================================
// UTILITAIRES
// ============================================================

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


function cleanOptionalField(
  formData: FormData,
  name: string,
) {
  const value =
    formData.get(name);

  if (
    value === null
    ||
    String(value).trim() === ""
  ) {
    formData.delete(name);
  }
}


function getUploadedFiles(
  formData: FormData,
  name: string,
) {
  const files: File[] = [];

  const values =
    formData.getAll(name);

  for (
    const value
    of values
  ) {
    if (
      value instanceof File
      &&
      value.size > 0
    ) {
      files.push(value);
    }
  }

  return files;
}


function getStringValue(
  formData: FormData,
  name: string,
) {
  const value =
    formData.get(name);

  if (
    value === null
  ) {
    return "";
  }

  return String(
    value,
  ).trim();
}



function parseVariantPayloads(
  value: FormDataEntryValue | null,
): ProductVariantDraftPayload[] {
  if (
    value === null
    ||
    typeof value !== "string"
    ||
    value.trim() === ""
  ) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (
        item,
      ): item is ProductVariantDraftPayload => (
        Boolean(item)
        &&
        typeof item === "object"
        &&
        typeof (
          item as ProductVariantDraftPayload
        ).client_key === "string"
        &&
        typeof (
          item as ProductVariantDraftPayload
        ).sku === "string"
      ),
    );
  }
  catch {
    throw new Error(
      "Les variantes envoyées sont invalides.",
    );
  }
}


function buildVariantFormData(
  productId: number,
  variant: ProductVariantDraftPayload,
  image?: File,
) {
  const payload =
    new FormData();

  payload.set(
    "product",
    String(productId),
  );

  payload.set(
    "sku",
    variant.sku.trim(),
  );

  if (
    variant.barcode?.trim()
  ) {
    payload.set(
      "barcode",
      variant.barcode.trim(),
    );
  }

  if (
    variant.price?.trim()
  ) {
    payload.set(
      "price",
      variant.price.trim(),
    );
  }

  if (
    variant.stock_quantity !==
    undefined
    &&
    String(
      variant.stock_quantity,
    ).trim() !== ""
  ) {
    payload.set(
      "stock_quantity",
      String(
        variant.stock_quantity,
      ).trim(),
    );
  }

  payload.set(
    "is_active",
    String(
      variant.is_active !== false,
    ),
  );

  payload.set(
    "attributes",
    JSON.stringify(
      (
        variant.attributes ??
        []
      ).filter(
        (attribute) => (
          attribute.name.trim()
          &&
          attribute.value.trim()
        ),
      ),
    ),
  );

  if (
    image
    &&
    image.size > 0
  ) {
    payload.set(
      "image",
      image,
    );
  }

  return payload;
}


function getSafeOrder(
  formData: FormData,
) {
  const rawValue =
    Number(
      formData.get(
        "display_order",
      ) ?? 0,
    );

  if (
    !Number.isFinite(
      rawValue,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.trunc(
      rawValue,
    ),
  );
}


function revalidateCatalogue() {
  revalidatePath(
    "/catalogue",
  );

  revalidatePath(
    "/catalogue/produits",
  );
}


function revalidateProduct(
  productId: number,
) {
  revalidateCatalogue();

  revalidatePath(
    `/catalogue/produits/${productId}`,
  );

  revalidatePath(
    `/catalogue/produits/${productId}/modifier`,
  );
}


// ============================================================
// CATÉGORIES
// ============================================================

export async function createCategoryAction(
  formData: FormData,
) {
  cleanFile(
    formData,
    "image",
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
    "is_featured_home",
    String(
      checkbox(
        formData,
        "is_featured_home",
      ),
    ),
  );

  cleanOptionalField(
    formData,
    "parent",
  );

  await ownerFetch(
    "/owner/catalog/categories/",
    {
      method: "POST",
      body: formData,
    },
  );

  revalidatePath(
    "/catalogue",
  );

  revalidatePath(
    "/catalogue/categories",
  );

  redirect(
    "/catalogue/categories?created=1",
  );
}


// ============================================================
// MARQUES
// ============================================================

export async function createBrandAction(
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
    "/owner/catalog/brands/",
    {
      method: "POST",
      body: formData,
    },
  );

  revalidatePath(
    "/catalogue",
  );

  revalidatePath(
    "/catalogue/marques",
  );

  redirect(
    "/catalogue/marques?created=1",
  );
}


// ============================================================
// CRÉATION PRODUIT
// ============================================================

export async function createProductAction(
  formData: FormData,
) {
  const images =
    getUploadedFiles(
      formData,
      "images",
    );

  const productName =
    getStringValue(
      formData,
      "name",
    );

  const variants =
    parseVariantPayloads(
      formData.get(
        "variants_json",
      ),
    );

  const variantImages =
    new Map<
      string,
      File
    >();

  for (
    const variant
    of variants
  ) {
    const fieldName =
      `variant_image_${variant.client_key}`;

    const value =
      formData.get(
        fieldName,
      );

    if (
      value instanceof File
      &&
      value.size > 0
    ) {
      variantImages.set(
        variant.client_key,
        value,
      );
    }

    formData.delete(
      fieldName,
    );
  }

  /*
   * Ces champs appartiennent à l'interface OWNER,
   * pas au serializer Product Django.
   */
  formData.delete(
    "images",
  );

  formData.delete(
    "variants_json",
  );

  formData.delete(
    "has_variants",
  );

  /*
   * La première photo sélectionnée devient
   * automatiquement la photo principale.
   */
  if (
    images.length > 0
  ) {
    formData.set(
      "primary_image",
      images[0],
    );
  }
  else {
    cleanFile(
      formData,
      "primary_image",
    );
  }

  formData.set(
    "is_featured",
    String(
      checkbox(
        formData,
        "is_featured",
      ),
    ),
  );

  cleanOptionalField(
    formData,
    "brand",
  );

  cleanOptionalField(
    formData,
    "barcode",
  );

  cleanOptionalField(
    formData,
    "purchase_price",
  );

  const product =
    await ownerFetch<
      CreatedProductResponse
    >(
      "/owner/catalog/products/",
      {
        method: "POST",
        body: formData,
      },
    );

  /*
   * Galerie : la première image a déjà été créée
   * via primary_image. On ajoute les suivantes.
   */
  for (
    let index = 1;
    index < images.length;
    index += 1
  ) {
    const imageFormData =
      new FormData();

    imageFormData.set(
      "product",
      String(
        product.id,
      ),
    );

    imageFormData.set(
      "image",
      images[index],
    );

    if (productName) {
      imageFormData.set(
        "alt_text",
        productName,
      );
    }

    imageFormData.set(
      "is_primary",
      "false",
    );

    imageFormData.set(
      "display_order",
      String(index),
    );

    await ownerFetch(
      "/owner/catalog/product-images/",
      {
        method: "POST",
        body:
          imageFormData,
      },
    );
  }

  /*
   * Variantes optionnelles.
   *
   * Le backend transfère la ligne de stock simple
   * vers la première variante afin d'éviter les
   * doubles comptages.
   */
  for (
    const variant
    of variants
  ) {
    if (
      !variant.sku.trim()
    ) {
      continue;
    }

    const variantFormData =
      buildVariantFormData(
        product.id,
        variant,
        variantImages.get(
          variant.client_key,
        ),
      );

    await ownerFetch(
      "/owner/catalog/variants/",
      {
        method: "POST",
        body:
          variantFormData,
      },
    );
  }

  revalidateProduct(
    product.id,
  );

  redirect(
    `/catalogue/produits/${product.id}?created=1`,
  );
}


// ============================================================
// MODIFICATION PRODUIT
// ============================================================

export async function updateProductAction(
  productId: number,
  formData: FormData,
) {
  cleanFile(
    formData,
    "primary_image",
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

  cleanOptionalField(
    formData,
    "brand",
  );

  cleanOptionalField(
    formData,
    "barcode",
  );

  cleanOptionalField(
    formData,
    "purchase_price",
  );

  await ownerFetch(
    `/owner/catalog/products/${productId}/`,
    {
      method: "PATCH",
      body: formData,
    },
  );

  revalidateProduct(
    productId,
  );

  redirect(
    `/catalogue/produits/${productId}/modifier?updated=1`,
  );
}


// ============================================================
// ARCHIVER PRODUIT
// ============================================================

export async function archiveProductAction(
  productId: number,
  formData: FormData,
) {
  void formData;

  await ownerFetch(
    `/owner/catalog/products/${productId}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: "ARCHIVED",
      }),
    },
  );

  revalidateProduct(
    productId,
  );

  redirect(
    `/catalogue/produits/${productId}/modifier?archived=1`,
  );
}


// ============================================================
// AJOUTER PLUSIEURS IMAGES PRODUIT
// ============================================================

export async function addProductImageAction(
  productId: number,
  formData: FormData,
) {
  const images =
    getUploadedFiles(
      formData,
      "images",
    );


  if (
    images.length === 0
  ) {
    throw new Error(
      "Veuillez sélectionner au moins une image.",
    );
  }


  const altText =
    getStringValue(
      formData,
      "alt_text",
    );

  const baseOrder =
    getSafeOrder(
      formData,
    );

  const makeFirstPrimary =
    checkbox(
      formData,
      "is_primary",
    );


  /*
   * Chaque photo est envoyée séparément
   * à l'API Django ProductImage.
   *
   * Cela permet de sélectionner 2, 5,
   * 10 photos ou davantage en une fois.
   */
  for (
    let index = 0;
    index < images.length;
    index += 1
  ) {
    const imageFormData =
      new FormData();

    imageFormData.set(
      "product",
      String(
        productId,
      ),
    );

    imageFormData.set(
      "image",
      images[index],
    );


    if (altText) {
      imageFormData.set(
        "alt_text",
        altText,
      );
    }


    imageFormData.set(
      "display_order",
      String(
        baseOrder +
          index,
      ),
    );


    /*
     * Si l'utilisateur coche
     * "photo principale", seule
     * la première photo sélectionnée
     * devient principale.
     */
    imageFormData.set(
      "is_primary",
      String(
        makeFirstPrimary &&
          index === 0,
      ),
    );


    await ownerFetch(
      "/owner/catalog/product-images/",
      {
        method: "POST",
        body:
          imageFormData,
      },
    );
  }


  /*
   * IMPORTANT :
   *
   * PAS DE REDIRECT ICI.
   *
   * La page reste exactement là
   * où l'utilisateur travaille.
   */
  revalidateProduct(
    productId,
  );
}


// ============================================================
// PHOTO PRINCIPALE
// ============================================================

export async function makePrimaryProductImageAction(
  productId: number,
  imageId: number,
  formData: FormData,
) {
  void formData;

  await ownerFetch(
    `/owner/catalog/product-images/${imageId}/make-primary/`,
    {
      method: "POST",
    },
  );

  /*
   * Pas de redirect :
   * pas de saut de page.
   */
  revalidateProduct(
    productId,
  );
}


// ============================================================
// SUPPRIMER UNE PHOTO
// ============================================================

export async function deleteProductImageAction(
  productId: number,
  imageId: number,
  formData: FormData,
) {
  void formData;

  await ownerFetch(
    `/owner/catalog/product-images/${imageId}/`,
    {
      method: "DELETE",
    },
  );

  /*
   * Pas de redirect :
   * la position de la page reste stable.
   */
  revalidateProduct(
    productId,
  );
}

// ============================================================
// VARIANTES PRODUIT
// ============================================================

export async function createProductVariantAction(
  previousState: {
    error: string;
    success: boolean;
  },
  formData: FormData,
): Promise<{
  error: string;
  success: boolean;
}> {
  void previousState;

  const productId =
    Number(
      formData.get(
        "product_id",
      ),
    );

  if (
    !Number.isFinite(
      productId,
    )
    ||
    productId <= 0
  ) {
    return {
      error:
        "Produit invalide.",
      success: false,
    };
  }

  const sku =
    getStringValue(
      formData,
      "sku",
    )
      .toUpperCase();

  if (!sku) {
    return {
      error:
        "Le SKU de la variante est obligatoire.",
      success: false,
    };
  }

  const imageValue =
    formData.get(
      "image",
    );

  const attributesRaw =
    formData.get(
      "attributes_json",
    );

  const attributes =
    typeof attributesRaw ===
    "string"
      ? attributesRaw
      : "[]";

  const payload =
    new FormData();

  payload.set(
    "product",
    String(productId),
  );

  payload.set(
    "sku",
    sku,
  );

  const barcode =
    getStringValue(
      formData,
      "barcode",
    );

  if (barcode) {
    payload.set(
      "barcode",
      barcode,
    );
  }

  const price =
    getStringValue(
      formData,
      "price",
    );

  if (price) {
    payload.set(
      "price",
      price,
    );
  }

  const stock =
    getStringValue(
      formData,
      "stock_quantity",
    );

  if (stock) {
    payload.set(
      "stock_quantity",
      stock,
    );
  }

  payload.set(
    "is_active",
    String(
      checkbox(
        formData,
        "is_active",
      ),
    ),
  );

  payload.set(
    "attributes",
    attributes,
  );

  if (
    imageValue instanceof File
    &&
    imageValue.size > 0
  ) {
    payload.set(
      "image",
      imageValue,
    );
  }

  try {
    await ownerFetch(
      "/owner/catalog/variants/",
      {
        method: "POST",
        body: payload,
      },
    );
  }
  catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de créer la variante.";

    if (
      message.includes(
        "Une variante avec ce SKU existe déjà",
      )
    ) {
      return {
        error:
          `Le SKU "${sku}" est déjà utilisé. `
          + "Une nouvelle variante doit avoir son propre SKU, "
          + "par exemple SAM-A26-128-NOIR ou SAM-A26-256-BLEU.",
        success: false,
      };
    }

    return {
      error: message,
      success: false,
    };
  }

  revalidateProduct(
    productId,
  );

  return {
    error: "",
    success: true,
  };
}


export async function updateProductVariantAction(
  formData: FormData,
) {
  const productId =
    Number(
      formData.get(
        "product_id",
      ),
    );

  const variantId =
    Number(
      formData.get(
        "variant_id",
      ),
    );

  if (
    !Number.isFinite(
      productId,
    )
    ||
    !Number.isFinite(
      variantId,
    )
  ) {
    throw new Error(
      "Variante invalide.",
    );
  }

  const payload =
    new FormData();

  payload.set(
    "sku",
    getStringValue(
      formData,
      "sku",
    ),
  );

  const barcode =
    getStringValue(
      formData,
      "barcode",
    );

  payload.set(
    "barcode",
    barcode,
  );

  const price =
    getStringValue(
      formData,
      "price",
    );

  payload.set(
    "price",
    price,
  );

  const stock =
    getStringValue(
      formData,
      "stock_quantity",
    );

  if (stock) {
    payload.set(
      "stock_quantity",
      stock,
    );
  }

  payload.set(
    "is_active",
    String(
      checkbox(
        formData,
        "is_active",
      ),
    ),
  );

  const attributesRaw =
    formData.get(
      "attributes_json",
    );

  payload.set(
    "attributes",
    typeof attributesRaw ===
      "string"
      ? attributesRaw
      : "[]",
  );

  const image =
    formData.get(
      "image",
    );

  if (
    image instanceof File
    &&
    image.size > 0
  ) {
    payload.set(
      "image",
      image,
    );
  }

  await ownerFetch(
    `/owner/catalog/variants/${variantId}/`,
    {
      method: "PATCH",
      body: payload,
    },
  );

  revalidateProduct(
    productId,
  );
}


export async function deleteProductVariantAction(
  formData: FormData,
) {
  const productId =
    Number(
      formData.get(
        "product_id",
      ),
    );

  const variantId =
    Number(
      formData.get(
        "variant_id",
      ),
    );

  if (
    !Number.isFinite(
      productId,
    )
    ||
    !Number.isFinite(
      variantId,
    )
  ) {
    throw new Error(
      "Variante invalide.",
    );
  }

  await ownerFetch(
    `/owner/catalog/variants/${variantId}/`,
    {
      method: "DELETE",
    },
  );

  revalidateProduct(
    productId,
  );
}

