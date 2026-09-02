"use client";

import Image from "next/image";

import {
  ImagePlus,
  Save,
} from "lucide-react";

import {
  useActionState,
  useState,
} from "react";

import {
  createAdvertisementAction,
  updateAdvertisementAction,
} from "@/actions/advertisements";

import type {
  AdvertisementActionState,
} from "@/actions/advertisements";

import type {
  AdvertisementMetadata,
  AdvertisementRecord,
} from "@/types/owner";


interface AdvertisementFormProps {
  metadata:
    AdvertisementMetadata;

  advertisement?:
    AdvertisementRecord;

  compact?:
    boolean;
}


const INITIAL_STATE:
  AdvertisementActionState = {
  success: false,
  error: "",
};


function datetimeLocal(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const pad =
    (
      number: number,
    ) =>
      String(
        number,
      ).padStart(
        2,
        "0",
      );

  return (
    `${date.getFullYear()}-`
    + `${pad(
      date.getMonth() + 1,
    )}-`
    + `${pad(
      date.getDate(),
    )}T`
    + `${pad(
      date.getHours(),
    )}:`
    + `${pad(
      date.getMinutes(),
    )}`
  );
}


function defaultStart() {
  return datetimeLocal(
    new Date()
      .toISOString(),
  );
}


function defaultEnd() {
  const date =
    new Date();

  date.setDate(
    date.getDate() +
    7,
  );

  return datetimeLocal(
    date.toISOString(),
  );
}


export function AdvertisementForm({
  metadata,
  advertisement,
  compact = false,
}: AdvertisementFormProps) {
  const isEditing =
    Boolean(
      advertisement,
    );

  const action:
    (
      state:
        AdvertisementActionState,
      formData:
        FormData,
    ) => Promise<
      AdvertisementActionState
    > =
      isEditing
        ? updateAdvertisementAction
            .bind(
              null,
              advertisement!.id,
            )
        : createAdvertisementAction;

  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    action,
    INITIAL_STATE,
  );


  const [
    destinationType,
    setDestinationType,
  ] = useState(
    advertisement
      ?.destination_type ??
    "CUSTOM",
  );

  const [
    desktopPreview,
    setDesktopPreview,
  ] = useState<
    string | null
  >(
    advertisement
      ?.desktop_image ??
    null,
  );

  const [
    mobilePreview,
    setMobilePreview,
  ] = useState<
    string | null
  >(
    advertisement
      ?.mobile_image ??
    null,
  );


  function previewFile(
    file:
      File
      | undefined,
    setter:
      (
        value:
          string
          | null,
      ) => void,
  ) {
    if (!file) {
      return;
    }

    setter(
      URL.createObjectURL(
        file,
      ),
    );
  }


  const currentCategories =
    new Set(
      advertisement
        ?.target_categories ??
      [],
    );


  return (
    <form
      action={
        formAction
      }
      className={`grid gap-5 ${
        compact
          ? ""
          : "rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      }`}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Entreprise *
          </span>

          <input
            name="company_name"
            required
            defaultValue={
              advertisement
                ?.company_name ??
              ""
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Titre *
          </span>

          <input
            name="title"
            required
            defaultValue={
              advertisement
                ?.title ??
              ""
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-black text-slate-700">
          Petit texte
        </span>

        <textarea
          name="text"
          rows={3}
          maxLength={500}
          defaultValue={
            advertisement
              ?.text ??
            ""
          }
          className="rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#ff6b00]"
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <span className="text-xs font-black text-slate-700">
            Image desktop
            {!isEditing
              ? " *"
              : ""}
          </span>

          <label className="relative flex min-h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
            {desktopPreview
              ? (
                <Image
                  src={
                    desktopPreview
                  }
                  alt="Aperçu publicité desktop"
                  fill
                  unoptimized={
                    desktopPreview
                      .startsWith(
                        "blob:",
                      )
                  }
                  className="object-contain p-2"
                />
              )
              : (
                <div className="text-center text-slate-400">
                  <ImagePlus
                    className="mx-auto"
                    size={28}
                  />

                  <span className="mt-2 block text-xs font-bold">
                    Choisir l&apos;image
                  </span>
                </div>
              )
            }

            <input
              type="file"
              name="desktop_image"
              accept="image/*"
              required={
                !isEditing
              }
              onChange={
                (
                  event,
                ) =>
                  previewFile(
                    event
                      .target
                      .files
                      ?.[0],
                    setDesktopPreview,
                  )
              }
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>

        <div className="grid gap-2">
          <span className="text-xs font-black text-slate-700">
            Image mobile
          </span>

          <label className="relative flex min-h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
            {mobilePreview
              ? (
                <Image
                  src={
                    mobilePreview
                  }
                  alt="Aperçu publicité mobile"
                  fill
                  unoptimized={
                    mobilePreview
                      .startsWith(
                        "blob:",
                      )
                  }
                  className="object-contain p-2"
                />
              )
              : (
                <div className="text-center text-slate-400">
                  <ImagePlus
                    className="mx-auto"
                    size={28}
                  />

                  <span className="mt-2 block text-xs font-bold">
                    Optionnelle
                  </span>
                </div>
              )
            }

            <input
              type="file"
              name="mobile_image"
              accept="image/*"
              onChange={
                (
                  event,
                ) =>
                  previewFile(
                    event
                      .target
                      .files
                      ?.[0],
                    setMobilePreview,
                  )
              }
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-black text-slate-700">
          Logo entreprise
        </span>

        <input
          type="file"
          name="company_logo"
          accept="image/*"
          className="block w-full rounded-xl border border-slate-200 bg-white p-2 text-xs"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Emplacement *
          </span>

          <select
            name="placement"
            required
            defaultValue={
              advertisement
                ?.placement ??
              "HOME_HERO"
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            {metadata
              .placements
              .map(
                (
                  choice,
                ) => (
                  <option
                    key={
                      String(
                        choice.value,
                      )
                    }
                    value={
                      String(
                        choice.value,
                      )
                    }
                  >
                    {choice.label}
                  </option>
                ),
              )}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Niveau
          </span>

          <select
            name="priority_level"
            defaultValue={
              String(
                advertisement
                  ?.priority_level ??
                10,
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            {metadata
              .priorities
              .map(
                (
                  choice,
                ) => (
                  <option
                    key={
                      String(
                        choice.value,
                      )
                    }
                    value={
                      String(
                        choice.value,
                      )
                    }
                  >
                    {choice.label}
                  </option>
                ),
              )}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Ordre d&apos;affichage
          </span>

          <input
            type="number"
            name="display_priority"
            min="0"
            defaultValue={
              advertisement
                ?.display_priority ??
              0
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Début *
          </span>

          <input
            type="datetime-local"
            name="start_at"
            required
            defaultValue={
              advertisement
                ? datetimeLocal(
                    advertisement
                      .start_at,
                  )
                : defaultStart()
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Fin *
          </span>

          <input
            type="datetime-local"
            name="end_at"
            required
            defaultValue={
              advertisement
                ? datetimeLocal(
                    advertisement
                      .end_at,
                  )
                : defaultEnd()
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Type de destination *
          </span>

          <select
            name="destination_type"
            value={
              destinationType
            }
            onChange={
              (
                event,
              ) =>
                setDestinationType(
                  event
                    .target
                    .value,
                )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            {metadata
              .destination_types
              .map(
                (
                  choice,
                ) => (
                  <option
                    key={
                      String(
                        choice.value,
                      )
                    }
                    value={
                      String(
                        choice.value,
                      )
                    }
                  >
                    {choice.label}
                  </option>
                ),
              )}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Texte du bouton
          </span>

          <input
            name="button_text"
            defaultValue={
              advertisement
                ?.button_text ??
              "Voir l'offre"
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
      </div>

      {destinationType ===
        "PRODUCT" && (
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Produit de destination *
          </span>

          <select
            name="destination_product"
            required
            defaultValue={
              String(
                advertisement
                  ?.destination_product ??
                "",
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">
              Choisir un produit
            </option>

            {metadata
              .products
              .map(
                (
                  product,
                ) => (
                  <option
                    key={
                      product.id
                    }
                    value={
                      product.id
                    }
                  >
                    {product.name}
                    {product.sku
                      ? ` — ${product.sku}`
                      : ""}
                  </option>
                ),
              )}
          </select>
        </label>
      )}

      {destinationType ===
        "CATEGORY" && (
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Catégorie de destination *
          </span>

          <select
            name="destination_category"
            required
            defaultValue={
              String(
                advertisement
                  ?.destination_category ??
                "",
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">
              Choisir une catégorie
            </option>

            {metadata
              .categories
              .map(
                (
                  category,
                ) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {category.name}
                  </option>
                ),
              )}
          </select>
        </label>
      )}

      {destinationType ===
        "BRAND" && (
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Marque de destination *
          </span>

          <select
            name="destination_brand"
            required
            defaultValue={
              String(
                advertisement
                  ?.destination_brand ??
                "",
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">
              Choisir une marque
            </option>

            {metadata
              .brands
              .map(
                (
                  brand,
                ) => (
                  <option
                    key={
                      brand.id
                    }
                    value={
                      brand.id
                    }
                  >
                    {brand.name}
                  </option>
                ),
              )}
          </select>
        </label>
      )}

      {destinationType ===
        "WHATSAPP" && (
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Numéro WhatsApp *
          </span>

          <input
            name="whatsapp"
            required
            placeholder="223XXXXXXXX"
            defaultValue={
              advertisement
                ?.whatsapp ??
              ""
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
      )}

      {destinationType ===
        "WEBSITE" && (
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Site web *
          </span>

          <input
            type="url"
            name="website"
            required
            placeholder="https://..."
            defaultValue={
              advertisement
                ?.website ??
              ""
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
      )}

      {(destinationType ===
        "CUSTOM"
        ||
        destinationType ===
        "PAGE") && (
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Lien de destination *
          </span>

          <input
            name="button_url"
            required
            placeholder="/recherche ou https://..."
            defaultValue={
              advertisement
                ?.button_url ??
              ""
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Promotion associée
          </span>

          <select
            name="promotion"
            defaultValue={
              String(
                advertisement
                  ?.promotion ??
                "",
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">
              Aucune
            </option>

            {metadata
              .promotions
              .map(
                (
                  promotion,
                ) => (
                  <option
                    key={
                      promotion.id
                    }
                    value={
                      promotion.id
                    }
                  >
                    {promotion.name}
                    {promotion
                      .is_current
                      ? " — active"
                      : ""}
                  </option>
                ),
              )}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Ancien prix affiché
          </span>

          <input
            type="number"
            min="0"
            step="1"
            name="display_old_price"
            defaultValue={
              advertisement
                ?.display_old_price ??
              ""
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-black text-slate-700">
            Prix affiché
          </span>

          <input
            type="number"
            min="0"
            step="1"
            name="display_price"
            defaultValue={
              advertisement
                ?.display_price ??
              ""
            }
            className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
          />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-xs font-black text-slate-700">
          Catégories contextuelles
        </span>

        <select
          name="target_categories"
          multiple
          defaultValue={
            Array.from(
              currentCategories,
            ).map(
              (
                id,
              ) =>
                String(
                  id,
                ),
            )
          }
          className="min-h-32 rounded-xl border border-slate-200 bg-white p-3 text-sm"
        >
          {metadata
            .categories
            .map(
              (
                category,
              ) => (
                <option
                  key={
                    category.id
                  }
                  value={
                    category.id
                  }
                >
                  {category.name}
                </option>
              ),
            )}
        </select>

        <span className="text-[10px] leading-4 text-slate-400">
          Ctrl + clic sur PC pour sélectionner plusieurs catégories.
          Laissez vide pour afficher sans ciblage de catégorie.
        </span>
      </label>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-xs font-black text-slate-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={
              advertisement
                ?.is_active ??
              true
            }
            className="h-4 w-4"
          />

          Active
        </label>

        <label className="flex items-center gap-2 text-xs font-black text-slate-700">
          <input
            type="checkbox"
            name="hide_after_expiry"
            defaultChecked={
              advertisement
                ?.hide_after_expiry ??
              true
            }
            className="h-4 w-4"
          />

          Masquer après expiration
        </label>
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
          Publicité enregistrée avec succès.
        </p>
      )}

      <button
        type="submit"
        disabled={
          pending
        }
        className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white shadow-sm disabled:opacity-50"
      >
        <Save
          size={17}
        />

        {pending
          ? "Enregistrement..."
          : isEditing
            ? "Enregistrer les modifications"
            : "Créer la publicité"}
      </button>
    </form>
  );
}
