"use client";

import {
  Boxes,
  ImagePlus,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  OwnerVariantMetadata,
} from "@/types/catalogue";


interface VariantAttributeDraft {
  id: string;

  name: string;

  value: string;

  color_hex: string;
}


interface VariantDraft {
  client_key: string;

  sku: string;

  barcode: string;

  price: string;

  stock_quantity: string;

  is_active: boolean;

  attributes: VariantAttributeDraft[];
}


interface ProductVariantBuilderProps {
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


function createAttribute(
  name = "",
): VariantAttributeDraft {
  return {
    id: uid("attr"),
    name,
    value: "",
    color_hex: "",
  };
}


function createVariant(): VariantDraft {
  return {
    client_key:
      uid("variant"),

    sku: "",

    barcode: "",

    price: "",

    stock_quantity: "0",

    is_active: true,

    attributes: [
      createAttribute(
        "Stockage",
      ),
      createAttribute(
        "Couleur",
      ),
    ],
  };
}


export default function ProductVariantBuilder({
  metadata,
}: ProductVariantBuilderProps) {
  const [
    enabled,
    setEnabled,
  ] = useState(false);

  const [
    variants,
    setVariants,
  ] = useState<
    VariantDraft[]
  >([]);


  const allKnownValues =
    useMemo(
      () => (
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
        )
      ),
      [
        metadata.attributes,
      ],
    );


  function toggleVariants(
    checked: boolean,
  ) {
    setEnabled(
      checked,
    );

    if (
      checked
      &&
      variants.length === 0
    ) {
      setVariants([
        createVariant(),
      ]);
    }
  }


  function addVariant() {
    setVariants(
      (
        current,
      ) => [
        ...current,
        createVariant(),
      ],
    );
  }


  function removeVariant(
    clientKey: string,
  ) {
    setVariants(
      (
        current,
      ) =>
        current.filter(
          (
            variant,
          ) =>
            variant.client_key !==
            clientKey,
        ),
    );
  }


  function updateVariant(
    clientKey: string,
    patch:
      Partial<
        Omit<
          VariantDraft,
          "client_key" |
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
          ) => (
            variant.client_key ===
            clientKey
              ? {
                  ...variant,
                  ...patch,
                }
              : variant
          ),
        ),
    );
  }


  function addAttribute(
    clientKey: string,
  ) {
    setVariants(
      (
        current,
      ) =>
        current.map(
          (
            variant,
          ) => (
            variant.client_key ===
            clientKey
              ? {
                  ...variant,

                  attributes: [
                    ...variant.attributes,
                    createAttribute(),
                  ],
                }
              : variant
          ),
        ),
    );
  }


  function updateAttribute(
    clientKey: string,
    attributeId: string,
    patch:
      Partial<
        Omit<
          VariantAttributeDraft,
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
              variant.client_key !==
              clientKey
            ) {
              return variant;
            }

            return {
              ...variant,

              attributes:
                variant.attributes.map(
                  (
                    attribute,
                  ) => (
                    attribute.id ===
                    attributeId
                      ? {
                          ...attribute,
                          ...patch,
                        }
                      : attribute
                  ),
                ),
            };
          },
        ),
    );
  }


  function removeAttribute(
    clientKey: string,
    attributeId: string,
  ) {
    setVariants(
      (
        current,
      ) =>
        current.map(
          (
            variant,
          ) => (
            variant.client_key ===
            clientKey
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
              : variant
          ),
        ),
    );
  }


  const serialized =
    JSON.stringify(
      enabled
        ? variants.map(
            (
              variant,
            ) => ({
              client_key:
                variant.client_key,

              sku:
                variant.sku,

              barcode:
                variant.barcode,

              price:
                variant.price,

              stock_quantity:
                variant.stock_quantity,

              is_active:
                variant.is_active,

              attributes:
                variant.attributes.map(
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
            }),
          )
        : [],
    );


  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <input
        type="hidden"
        name="variants_json"
        value={
          serialized
        }
      />


      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b4da2] text-white">
            <Boxes
              size={20}
            />
          </div>

          <div>
            <h2 className="font-black">
              Variantes du produit
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              Activez cette option seulement si
              le produit existe en plusieurs
              configurations : stockage, couleur,
              RAM, taille ou toute autre valeur.
            </p>
          </div>
        </div>


        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4">
          <input
            name="has_variants"
            type="checkbox"
            checked={
              enabled
            }
            onChange={
              (
                event,
              ) =>
                toggleVariants(
                  event.target.checked,
                )
            }
          />

          <span className="text-xs font-black text-[#0b4da2]">
            Ce produit possède des variantes
          </span>
        </label>
      </div>


      {!enabled && (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
          Produit simple : une seule référence,
          un seul prix et une seule ligne de stock.
        </div>
      )}


      {enabled && (
        <>
          <datalist id="sk-variant-attribute-names">
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

          <datalist id="sk-variant-known-values">
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


          <div className="mt-6 grid gap-5">
            {variants.map(
              (
                variant,
                variantIndex,
              ) => (
                <article
                  key={
                    variant.client_key
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff6b00]">
                        Variante {
                          variantIndex +
                          1
                        }
                      </span>

                      <h3 className="mt-1 text-sm font-black text-slate-950">
                        Configuration
                        personnalisée
                      </h3>
                    </div>

                    {variants.length >
                    1 && (
                      <button
                        type="button"
                        onClick={
                          () =>
                            removeVariant(
                              variant.client_key,
                            )
                        }
                        className="flex min-h-9 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-[10px] font-black text-red-600"
                      >
                        <Trash2
                          size={13}
                        />

                        Retirer
                      </button>
                    )}
                  </div>


                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <label>
                      <span className="text-xs font-black">
                        SKU variante *
                      </span>

                      <input
                        value={
                          variant.sku
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateVariant(
                              variant.client_key,
                              {
                                sku:
                                  event.target.value,
                              },
                            )
                        }
                        required
                        placeholder="Ex: SAM-A26-256-NOIR"
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase outline-none focus:border-[#ff6b00]"
                      />
                    </label>


                    <label>
                      <span className="text-xs font-black">
                        Code-barres
                      </span>

                      <input
                        value={
                          variant.barcode
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateVariant(
                              variant.client_key,
                              {
                                barcode:
                                  event.target.value,
                              },
                            )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                      />
                    </label>


                    <label>
                      <span className="text-xs font-black">
                        Prix variante
                      </span>

                      <input
                        value={
                          variant.price
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateVariant(
                              variant.client_key,
                              {
                                price:
                                  event.target.value,
                              },
                            )
                        }
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Vide = prix du produit"
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                      />
                    </label>


                    <label>
                      <span className="text-xs font-black">
                        Stock initial
                      </span>

                      <input
                        value={
                          variant.stock_quantity
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateVariant(
                              variant.client_key,
                              {
                                stock_quantity:
                                  event.target.value,
                              },
                            )
                        }
                        type="number"
                        min="0"
                        step="1"
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                      />
                    </label>


                    <label className="md:col-span-2 xl:col-span-2">
                      <span className="text-xs font-black">
                        Image propre à la variante
                      </span>

                      <input
                        name={
                          `variant_image_${variant.client_key}`
                        }
                        type="file"
                        accept="image/*"
                        className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs"
                      />
                    </label>


                    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 md:col-span-2 xl:col-span-3">
                      <input
                        type="checkbox"
                        checked={
                          variant.is_active
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            updateVariant(
                              variant.client_key,
                              {
                                is_active:
                                  event.target.checked,
                              },
                            )
                        }
                      />

                      <span className="text-xs font-black">
                        Variante active et vendable
                      </span>
                    </label>
                  </div>


                  <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-black text-[#0b4da2]">
                          Attributs
                        </h4>

                        <p className="mt-1 text-[10px] leading-5 text-slate-500">
                          Exemples : Stockage = 256 Go,
                          Couleur = Noir, RAM = 8 Go.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          () =>
                            addAttribute(
                              variant.client_key,
                            )
                        }
                        className="flex min-h-9 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-[10px] font-black text-[#0b4da2]"
                      >
                        <Plus
                          size={13}
                        />

                        Ajouter un attribut
                      </button>
                    </div>


                    <div className="mt-4 grid gap-3">
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
                              list="sk-variant-attribute-names"
                              value={
                                attribute.name
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  updateAttribute(
                                    variant.client_key,
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
                              list="sk-variant-known-values"
                              value={
                                attribute.value
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  updateAttribute(
                                    variant.client_key,
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
                              type="text"
                              value={
                                attribute.color_hex
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  updateAttribute(
                                    variant.client_key,
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
                                  removeAttribute(
                                    variant.client_key,
                                    attribute.id,
                                  )
                              }
                              className="flex h-10 items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-red-600"
                              aria-label="Supprimer l'attribut"
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
                </article>
              ),
            )}
          </div>


          <button
            type="button"
            onClick={
              addVariant
            }
            className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#0b4da2] bg-blue-50 px-4 text-xs font-black text-[#0b4da2] sm:w-fit"
          >
            <Plus
              size={15}
            />

            Ajouter une autre variante
          </button>


          <div className="mt-4 flex items-start gap-2 rounded-xl border border-orange-100 bg-orange-50 p-3 text-[10px] leading-5 text-orange-700">
            <ImagePlus
              size={15}
              className="mt-0.5 shrink-0"
            />

            Chaque variante peut avoir sa propre
            image, son propre prix et son propre
            stock.
          </div>
        </>
      )}
    </section>
  );
}
