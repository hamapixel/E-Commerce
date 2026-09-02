import {
  Images,
  PackagePlus,
} from "lucide-react";

import {
  createProductAction,
} from "@/actions/catalogue";

import ProductVariantBuilder from "@/components/catalogue/product-variant-builder";

import {
  ownerFetch,
} from "@/lib/backend";

import type {
  CatalogMetadata,
  OwnerVariantMetadata,
} from "@/types/catalogue";


export default async function NewProductPage() {
  const [
    metadata,
    variantMetadata,
  ] = await Promise.all([
    ownerFetch<
      CatalogMetadata
    >(
      "/owner/catalog/metadata/",
    ),

    ownerFetch<
      OwnerVariantMetadata
    >(
      "/owner/catalog/variants/metadata/",
    ),
  ]);


  return (
    <>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
          Catalogue
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Nouveau produit
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Ajoutez un produit complet
          depuis votre téléphone,
          tablette ou ordinateur.
        </p>
      </div>


      <form
        action={
          createProductAction
        }
        className="mt-7 grid gap-5"
      >

        {/* =========================================
            INFORMATIONS PRINCIPALES
        ========================================= */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-3">
            <PackagePlus
              className="text-[#ff6b00]"
            />

            <h2 className="font-black">
              Informations principales
            </h2>
          </div>


          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <label>
              <span className="text-xs font-black">
                Nom du produit *
              </span>

              <input
                name="name"
                required
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                SKU *
              </span>

              <input
                name="sku"
                required
                placeholder="Ex: SAM-A26"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 uppercase outline-none"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Catégorie *
              </span>

              <select
                name="category"
                required
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"
              >
                <option value="">
                  Choisir
                </option>

                {metadata.categories.map(
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
                      {
                        category.name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              <span className="text-xs font-black">
                Marque
              </span>

              <select
                name="brand"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"
              >
                <option value="">
                  Sans marque
                </option>

                {metadata.brands.map(
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
                      {
                        brand.name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              <span className="text-xs font-black">
                Code-barres
              </span>

              <input
                name="barcode"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Statut *
              </span>

              <select
                name="status"
                required
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"
              >
                {metadata.product_statuses.map(
                  (
                    item,
                  ) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {
                        item.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
        </section>


        {/* =========================================
            PRIX
        ========================================= */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <h2 className="font-black">
            Prix
          </h2>


          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <label>
              <span className="text-xs font-black">
                Prix de vente *
              </span>

              <input
                name="base_price"
                type="number"
                min="0"
                step="1"
                required
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Prix d&apos;achat
              </span>

              <input
                name="purchase_price"
                type="number"
                min="0"
                step="1"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>
          </div>
        </section>


        {/* =========================================
            PRÉSENTATION
        ========================================= */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <h2 className="font-black">
            Présentation
          </h2>


          <div className="mt-5 grid gap-4">

            <label>
              <span className="text-xs font-black">
                Description courte
              </span>

              <input
                name="short_description"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Description complète
              </span>

              <textarea
                name="description"
                rows={7}
                className="mt-2 w-full rounded-xl border border-slate-200 p-4"
              />
            </label>


            {/* =====================================
                PHOTOS MULTIPLES
            ===================================== */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0b4da2] text-white">
                  <Images
                    size={19}
                  />
                </div>


                <div>
                  <h3 className="text-sm font-black text-slate-950">
                    Photos du produit
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Vous pouvez sélectionner
                    plusieurs photos en une
                    seule fois.
                  </p>
                </div>
              </div>


              <label className="mt-4 block">
                <span className="text-xs font-black">
                  Sélectionner les photos
                </span>

                <input
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-2 block w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-xs"
                />
              </label>


              <div className="mt-3 rounded-xl bg-white p-3 text-[10px] leading-5 text-slate-500">
                <strong className="text-[#0b4da2]">
                  Important :
                </strong>{" "}
                la première photo
                sélectionnée sera utilisée
                comme photo principale.
                Toutes les autres seront
                automatiquement ajoutées
                à la galerie.
              </div>
            </div>


            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4">
              <input
                name="is_featured"
                type="checkbox"
              />

              <span className="text-xs font-black">
                Mettre ce produit en avant
              </span>
            </label>
          </div>
        </section>


        {/* =========================================
            VARIANTES
        ========================================= */}
        <ProductVariantBuilder
          metadata={
            variantMetadata
          }
        />


        {/* =========================================
            SEO
        ========================================= */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <h2 className="font-black">
            SEO
          </h2>


          <div className="mt-5 grid gap-4">

            <label>
              <span className="text-xs font-black">
                Titre SEO
              </span>

              <input
                name="seo_title"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Description SEO
              </span>

              <input
                name="seo_description"
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>
          </div>
        </section>


        <button
          type="submit"
          className="min-h-13 w-full rounded-xl bg-[#ff6b00] px-6 text-sm font-black text-white transition hover:bg-[#e86100] sm:w-fit"
        >
          Créer le produit
        </button>
      </form>
    </>
  );
}