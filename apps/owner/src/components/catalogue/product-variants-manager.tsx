"use client";

import {
  Boxes,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  useActionState,
  useMemo,
  useState,
} from "react";

import {
  createProductVariantAction,
  deleteProductVariantAction,
  updateProductVariantAction,
} from "@/actions/catalogue";

import type {
  OwnerProductVariant,
  OwnerVariantMetadata,
} from "@/types/catalogue";


interface EditableAttribute {
  id: string;

  name: string;

  value: string;

  color_hex: string;
}


interface EditableVariant {
  id: number;

  sku: string;

  barcode: string;

  price: string;

  stock_on_hand: number;

  stock_reserved: number;

  stock_available: number;

  is_active: boolean;

  image_url: string | null;

  attributes: EditableAttribute[];
}


interface NewVariantDraft {
  sku: string;

  barcode: string;

  price: string;

  stock_quantity: string;

  is_active: boolean;

  attributes: EditableAttribute[];
}


interface ProductVariantsManagerProps {
  productId: number;

  productBasePrice: string;

  initialVariants: OwnerProductVariant[];

  metadata: OwnerVariantMetadata;
}


function uid(
  prefix: string,
) {
  return (
    `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`
  );
}


function attributeDraft(
  name = "",
): EditableAttribute {
  return {
    id: uid("attr"),
    name,
    value: "",
    color_hex: "",
  };
}


function newVariantDraft(
  basePrice: string,
): NewVariantDraft {
  return {
    sku: "",

    barcode: "",

    price: basePrice,

    stock_quantity: "0",

    is_active: true,

    attributes: [
      {
        id: "draft-attribute-storage",
        name: "Stockage",
        value: "",
        color_hex: "",
      },
      {
        id: "draft-attribute-color",
        name: "Couleur",
        value: "",
        color_hex: "",
      },
    ],
  };
}


function serializeAttributes(
  attributes: EditableAttribute[],
) {
  return JSON.stringify(
    attributes.map(
      (
        attribute,
      ) => ({
        name:
          attribute.name,

        value:
          attribute.value,

        color_hex:
          attribute.color_hex,
      }),
    ),
  );
}


export default function ProductVariantsManager({
  productId,
  productBasePrice,
  initialVariants,
  metadata,
}: ProductVariantsManagerProps) {
  const [
    variants,
    setVariants,
  ] = useState<
    EditableVariant[]
  >(
    () =>
      initialVariants.map(
        (
          variant,
        ) => ({
          id:
            variant.id,

          sku:
            variant.sku,

          barcode:
            variant.barcode ??
            "",

          price:
            variant.price,

          stock_on_hand:
            variant.stock_on_hand,

          stock_reserved:
            variant.stock_reserved,

          stock_available:
            variant.stock_available,

          is_active:
            variant.is_active,

          image_url:
            variant.image_url,

          attributes:
            variant.attributes.map(
              (
                attribute,
                attributeIndex,
              ) => ({
                id:
                  `variant-${variant.id}-attr-${attributeIndex}`,

                name:
                  attribute.attribute,

                value:
                  attribute.value,

                color_hex:
                  attribute.color_hex ??
                  "",
              }),
            ),
        }),
      ),
  );


  const [
    showCreate,
    setShowCreate,
  ] = useState(
    initialVariants.length ===
    0,
  );


  const [
    draft,
    setDraft,
  ] = useState<
    NewVariantDraft
  >(
    () =>
      newVariantDraft(
        productBasePrice,
      ),
  );


  const [
    createVariantState,
    createVariantFormAction,
    isCreatingVariant,
  ] = useActionState(
    createProductVariantAction,
    {
      error: "",
      success: false,
    },
  );


  const allKnownValues =
    useMemo(
      () =>
        Array.from(
          new Set(
            metadata.attributes.flatMap(
              (
                attribute,
              ) =>
                attribute.values.map(
                  (
                    value,
                  ) =>
                    value.display_value,
                ),
            ),
          ),
        ),
      [
        metadata.attributes,
      ],
    );


  function patchVariant(
    variantId: number,
    patch:
      Partial<
        Omit<
          EditableVariant,
          "id" |
          "attributes"
        >
      >,
  ) {
    setVariants(
      (
        current,
      ) =>
        current.map(
          (
            variant,
          ) =>
            variant.id ===
            variantId
              ? {
                  ...variant,
                  ...patch,
                }
              : variant,
        ),
    );
  }


  function patchVariantAttribute(
    variantId: number,
    attributeId: string,
    patch:
      Partial<
        Omit<
          EditableAttribute,
          "id"
        >
      >,
  ) {
    setVariants(
      (
        current,
      ) =>
        current.map(
          (
            variant,
          ) => {
            if (
              variant.id !==
              variantId
            ) {
              return variant;
            }

            return {
              ...variant,

              attributes:
                variant.attributes.map(
                  (
                    attribute,
                  ) =>
                    attribute.id ===
                    attributeId
                      ? {
                          ...attribute,
                          ...patch,
                        }
                      : attribute,
                ),
            };
          },
        ),
    );
  }


  function addVariantAttribute(
    variantId: number,
  ) {
    setVariants(
      (
        current,
      ) =>
        current.map(
          (
            variant,
          ) =>
            variant.id ===
            variantId
              ? {
                  ...variant,

                  attributes: [
                    ...variant.attributes,
                    attributeDraft(),
                  ],
                }
              : variant,
        ),
    );
  }


  function removeVariantAttribute(
    variantId: number,
    attributeId: string,
  ) {
    setVariants(
      (
        current,
      ) =>
        current.map(
          (
            variant,
          ) =>
            variant.id ===
            variantId
              ? {
                  ...variant,

                  attributes:
                    variant.attributes.filter(
                      (
                        attribute,
                      ) =>
                        attribute.id !==
                        attributeId,
                    ),
                }
              : variant,
        ),
    );
  }


  function patchDraft(
    patch:
      Partial<
        Omit<
          NewVariantDraft,
          "attributes"
        >
      >,
  ) {
    setDraft(
      (
        current,
      ) => ({
        ...current,
        ...patch,
      }),
    );
  }


  function patchDraftAttribute(
    attributeId: string,
    patch:
      Partial<
        Omit<
          EditableAttribute,
          "id"
        >
      >,
  ) {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        attributes:
          current.attributes.map(
            (
              attribute,
            ) =>
              attribute.id ===
              attributeId
                ? {
                    ...attribute,
                    ...patch,
                  }
                : attribute,
          ),
      }),
    );
  }


  function addDraftAttribute() {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        attributes: [
          ...current.attributes,
          attributeDraft(),
        ],
      }),
    );
  }


  function removeDraftAttribute(
    attributeId: string,
  ) {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        attributes:
          current.attributes.filter(
            (
              attribute,
            ) =>
              attribute.id !==
              attributeId,
          ),
      }),
    );
  }


  return (
    <section className="mt-8 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <datalist id="sk-edit-variant-attribute-names">
        {metadata.attributes.map(
          (
            attribute,
          ) => (
            <option
              key={
                attribute.id
              }
              value={
                attribute.name
              }
            />
          ),
        )}
      </datalist>

      <datalist id="sk-edit-variant-values">
        {allKnownValues.map(
          (
            value,
          ) => (
            <option
              key={
                value
              }
              value={
                value
              }
            />
          ),
        )}
      </datalist>


      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b4da2] text-white">
            <Boxes
              size={20}
            />
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b4da2]">
              Options
            </p>

            <h2 className="mt-1 text-xl font-black">
              Variantes du produit
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {initialVariants.length} variante(s).
              Chaque variante possède son propre
              stock.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            () =>
              setShowCreate(
                (
                  current,
                ) =>
                  !current,
              )
          }
          className="flex min-h-11 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-xs font-black text-white"
        >
          <Plus
            size={15}
          />

          Ajouter une variante
        </button>
      </div>


      {variants.length ===
      0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={
                showCreate
              }
              onChange={
                (
                  event,
                ) =>
                  setShowCreate(
                    event.target.checked,
                  )
              }
            />

            <span className="text-xs font-black text-[#0b4da2]">
              Ce produit possède des variantes
            </span>
          </label>

          <p className="mt-2 text-[10px] leading-5 text-slate-500">
            En créant la première variante,
            la ligne de stock simple existante
            sera reprise par cette variante.
          </p>
        </div>
      )}


      {variants.length >
      0 && (
        <div className="mt-6 grid gap-5">
          {variants.map(
            (
              variant,
              index,
            ) => (
              <article
                key={
                  variant.id
                }
                className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
              >
                <div className="grid gap-4 border-b border-slate-200 bg-white p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                  <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                    {variant.image_url ? (
                      <div
                        role="img"
                        aria-label={
                          variant.sku
                        }
                        className="h-full w-full bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage:
                            `url("${variant.image_url}")`,
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] font-bold text-slate-400">
                        Sans image
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff6b00]">
                      Variante {
                        index +
                        1
                      }
                    </span>

                    <h3 className="mt-1 font-black">
                      {
                        variant.attributes
                          .map(
                            (
                              attribute,
                            ) =>
                              attribute.value,
                          )
                          .filter(
                            Boolean,
                          )
                          .join(
                            " / ",
                          )
                        ||
                        variant.sku
                      }
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      SKU : {
                        variant.sku
                      }
                    </p>
                  </div>

                  <span
                    className={
                      variant.is_active
                        ? "w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-700"
                        : "w-fit rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-black text-slate-500"
                    }
                  >
                    {
                      variant.is_active
                        ? "Active"
                        : "Inactive"
                    }
                  </span>
                </div>


                <form
                  action={
                    updateProductVariantAction
                  }
                  className="grid gap-4 p-4 sm:p-5"
                >
                  <input
                    type="hidden"
                    name="product_id"
                    value={
                      productId
                    }
                  />

                  <input
                    type="hidden"
                    name="variant_id"
                    value={
                      variant.id
                    }
                  />

                  <input
                    type="hidden"
                    name="attributes_json"
                    value={
                      serializeAttributes(
                        variant.attributes,
                      )
                    }
                  />


                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label>
                      <span className="text-xs font-black">
                        SKU *
                      </span>

                      <input
                        name="sku"
                        required
                        value={
                          variant.sku
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            patchVariant(
                              variant.id,
                              {
                                sku:
                                  event.target.value,
                              },
                            )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs uppercase"
                      />
                    </label>


                    <label>
                      <span className="text-xs font-black">
                        Code-barres
                      </span>

                      <input
                        name="barcode"
                        value={
                          variant.barcode
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            patchVariant(
                              variant.id,
                              {
                                barcode:
                                  event.target.value,
                              },
                            )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs"
                      />
                    </label>


                    <label>
                      <span className="text-xs font-black">
                        Prix
                      </span>

                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="1"
                        value={
                          variant.price
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            patchVariant(
                              variant.id,
                              {
                                price:
                                  event.target.value,
                              },
                            )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs"
                      />
                    </label>


                    <label>
                      <span className="text-xs font-black">
                        Stock physique
                      </span>

                      <input
                        name="stock_quantity"
                        type="number"
                        min={
                          variant.stock_reserved
                        }
                        step="1"
                        defaultValue={
                          variant.stock_on_hand
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs"
                      />

                      <span className="mt-1 block text-[9px] text-slate-400">
                        Réservé : {
                          variant.stock_reserved
                        } • Disponible : {
                          variant.stock_available
                        }
                      </span>
                    </label>
                  </div>


                  <div className="rounded-2xl border border-blue-100 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <strong className="text-xs text-[#0b4da2]">
                        Attributs
                      </strong>

                      <button
                        type="button"
                        onClick={
                          () =>
                            addVariantAttribute(
                              variant.id,
                            )
                        }
                        className="flex min-h-9 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-[10px] font-black text-[#0b4da2]"
                      >
                        <Plus
                          size={13}
                        />

                        Ajouter
                      </button>
                    </div>

                    <div className="mt-3 grid gap-2">
                      {variant.attributes.map(
                        (
                          attribute,
                        ) => (
                          <div
                            key={
                              attribute.id
                            }
                            className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_120px_auto]"
                          >
                            <input
                              list="sk-edit-variant-attribute-names"
                              value={
                                attribute.name
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  patchVariantAttribute(
                                    variant.id,
                                    attribute.id,
                                    {
                                      name:
                                        event.target.value,
                                    },
                                  )
                              }
                              placeholder="Attribut"
                              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs"
                            />

                            <input
                              list="sk-edit-variant-values"
                              value={
                                attribute.value
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  patchVariantAttribute(
                                    variant.id,
                                    attribute.id,
                                    {
                                      value:
                                        event.target.value,
                                    },
                                  )
                              }
                              placeholder="Valeur"
                              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs"
                            />

                            <input
                              value={
                                attribute.color_hex
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  patchVariantAttribute(
                                    variant.id,
                                    attribute.id,
                                    {
                                      color_hex:
                                        event.target.value,
                                    },
                                  )
                              }
                              placeholder="#000000"
                              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs"
                            />

                            <button
                              type="button"
                              onClick={
                                () =>
                                  removeVariantAttribute(
                                    variant.id,
                                    attribute.id,
                                  )
                              }
                              className="flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-red-600"
                            >
                              <Trash2
                                size={14}
                              />
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>


                  <div className="grid gap-3 md:grid-cols-2">
                    <label>
                      <span className="text-xs font-black">
                        Remplacer l&apos;image de la variante
                      </span>

                      <input
                        name="image"
                        type="file"
                        accept="image/*"
                        className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs"
                      />
                    </label>

                    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 md:self-end">
                      <input
                        name="is_active"
                        type="checkbox"
                        checked={
                          variant.is_active
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            patchVariant(
                              variant.id,
                              {
                                is_active:
                                  event.target.checked,
                              },
                            )
                        }
                      />

                      <span className="text-xs font-black">
                        Variante active
                      </span>
                    </label>
                  </div>


                  <button
                    type="submit"
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0b4da2] px-4 text-xs font-black text-white sm:w-fit"
                  >
                    <Save
                      size={15}
                    />

                    Enregistrer la variante
                  </button>
                </form>


                <form
                  action={
                    deleteProductVariantAction
                  }
                  className="border-t border-slate-200 bg-white p-4"
                >
                  <input
                    type="hidden"
                    name="product_id"
                    value={
                      productId
                    }
                  />

                  <input
                    type="hidden"
                    name="variant_id"
                    value={
                      variant.id
                    }
                  />

                  <button
                    type="submit"
                    className="flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-[10px] font-black text-red-600"
                  >
                    <Trash2
                      size={14}
                    />

                    Supprimer cette variante
                  </button>

                  <p className="mt-2 text-[9px] leading-4 text-slate-400">
                    La suppression est bloquée si
                    la variante possède encore du
                    stock ou des données protégées.
                    Dans ce cas, désactivez-la.
                  </p>
                </form>
              </article>
            ),
          )}
        </div>
      )}


      {showCreate && (
        <form
          action={
            createVariantFormAction
          }
          className="mt-6 grid gap-4 rounded-2xl border border-dashed border-[#0b4da2] bg-blue-50/40 p-4 sm:p-5"
        >
          <input
            type="hidden"
            name="product_id"
            value={
              productId
            }
          />

          <input
            type="hidden"
            name="attributes_json"
            value={
              serializeAttributes(
                draft.attributes,
              )
            }
          />


          {createVariantState.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">
              {
                createVariantState.error
              }
            </div>
          )}


          {createVariantState.success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
              Variante créée avec succès.
            </div>
          )}


          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6b00] text-white">
              <Plus
                size={18}
              />
            </div>

            <div>
              <strong className="block text-sm">
                Nouvelle variante
              </strong>

              <span className="text-[10px] text-slate-500">
                Créez une configuration
                supplémentaire.
              </span>
            </div>
          </div>


          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label>
              <span className="text-xs font-black">
                SKU *
              </span>

              <input
                name="sku"
                required
                value={
                  draft.sku
                }
                onChange={
                  (
                    event,
                  ) =>
                    patchDraft({
                      sku:
                        event.target.value,
                    })
                }
                placeholder="Ex: IP12PM-256-NOIR"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs uppercase"
              />

              <span className="mt-1 block text-[9px] leading-4 text-slate-400">
                Chaque variante doit avoir un SKU unique.
                N&apos;utilisez pas le SKU d&apos;une variante déjà existante.
              </span>
            </label>


            <label>
              <span className="text-xs font-black">
                Code-barres
              </span>

              <input
                name="barcode"
                value={
                  draft.barcode
                }
                onChange={
                  (
                    event,
                  ) =>
                    patchDraft({
                      barcode:
                        event.target.value,
                    })
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Prix
              </span>

              <input
                name="price"
                type="number"
                min="0"
                step="1"
                value={
                  draft.price
                }
                onChange={
                  (
                    event,
                  ) =>
                    patchDraft({
                      price:
                        event.target.value,
                    })
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Stock initial
              </span>

              <input
                name="stock_quantity"
                type="number"
                min="0"
                step="1"
                value={
                  draft.stock_quantity
                }
                onChange={
                  (
                    event,
                  ) =>
                    patchDraft({
                      stock_quantity:
                        event.target.value,
                    })
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs"
              />
            </label>
          </div>


          <div className="rounded-2xl bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <strong className="text-xs text-[#0b4da2]">
                Attributs
              </strong>

              <button
                type="button"
                onClick={
                  addDraftAttribute
                }
                className="flex min-h-9 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-[10px] font-black text-[#0b4da2]"
              >
                <Plus
                  size={13}
                />

                Ajouter
              </button>
            </div>

            <div className="mt-3 grid gap-2">
              {draft.attributes.map(
                (
                  attribute,
                ) => (
                  <div
                    key={
                      attribute.id
                    }
                    className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_120px_auto]"
                  >
                    <input
                      list="sk-edit-variant-attribute-names"
                      value={
                        attribute.name
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          patchDraftAttribute(
                            attribute.id,
                            {
                              name:
                                event.target.value,
                            },
                          )
                      }
                      placeholder="Attribut"
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs"
                    />

                    <input
                      list="sk-edit-variant-values"
                      value={
                        attribute.value
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          patchDraftAttribute(
                            attribute.id,
                            {
                              value:
                                event.target.value,
                            },
                          )
                      }
                      placeholder="Valeur"
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs"
                    />

                    <input
                      value={
                        attribute.color_hex
                      }
                      onChange={
                        (
                          event,
                        ) =>
                          patchDraftAttribute(
                            attribute.id,
                            {
                              color_hex:
                                event.target.value,
                            },
                          )
                      }
                      placeholder="#000000"
                      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs"
                    />

                    <button
                      type="button"
                      onClick={
                        () =>
                          removeDraftAttribute(
                            attribute.id,
                          )
                      }
                      className="flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-red-600"
                    >
                      <Trash2
                        size={14}
                      />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>


          <div className="grid gap-3 md:grid-cols-2">
            <label>
              <span className="text-xs font-black">
                Image de la variante
              </span>

              <input
                name="image"
                type="file"
                accept="image/*"
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs"
              />
            </label>

            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 md:self-end">
              <input
                name="is_active"
                type="checkbox"
                checked={
                  draft.is_active
                }
                onChange={
                  (
                    event,
                  ) =>
                    patchDraft({
                      is_active:
                        event.target.checked,
                    })
                }
              />

              <span className="text-xs font-black">
                Variante active
              </span>
            </label>
          </div>


          <button
            type="submit"
            disabled={
              isCreatingVariant
            }
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
          >
            <ImagePlus
              size={15}
            />

            {
              isCreatingVariant
                ? "Création..."
                : "Créer la variante"
            }
          </button>
        </form>
      )}
    </section>
  );
}
