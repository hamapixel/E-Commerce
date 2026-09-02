import {
  BadgePlus,
  Tags,
} from "lucide-react";

import {
  createBrandAction,
} from "@/actions/catalogue";

import {
  ownerFetch,
} from "@/lib/backend";

import type {
  OwnerBrand,
} from "@/types/catalogue";


export default async function BrandsPage() {
  const brands =
    await ownerFetch<
      OwnerBrand[]
    >(
      "/owner/catalog/brands/"
    );


  return (
    <>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
          Catalogue
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Marques
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Gérez Samsung, Apple et toutes
          vos futures marques.
        </p>
      </div>


      <section className="mt-7 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <BadgePlus
            className="text-[#ff6b00]"
          />

          <h2 className="font-black">
            Nouvelle marque
          </h2>
        </div>

        <form
          action={
            createBrandAction
          }
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <label>
            <span className="text-xs font-black">
              Nom *
            </span>

            <input
              name="name"
              required
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label>
            <span className="text-xs font-black">
              Site web
            </span>

            <input
              name="website"
              type="url"
              placeholder="https://..."
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
            />
          </label>

          <label className="md:col-span-2">
            <span className="text-xs font-black">
              Description
            </span>

            <textarea
              name="description"
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 p-4"
            />
          </label>

          <label>
            <span className="text-xs font-black">
              Logo
            </span>

            <input
              name="logo"
              type="file"
              accept="image/*"
              className="mt-2 block w-full rounded-xl border border-slate-200 p-3 text-xs"
            />
          </label>

          <label>
            <span className="text-xs font-black">
              Ordre
            </span>

            <input
              name="display_order"
              type="number"
              min="0"
              defaultValue="0"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
            />
          </label>

          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked
            />

            <span className="text-xs font-black">
              Marque active
            </span>
          </label>

          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4">
            <input
              name="is_featured"
              type="checkbox"
            />

            <span className="text-xs font-black">
              Mettre en avant
            </span>
          </label>

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

          <div className="md:col-span-2">
            <button
              type="submit"
              className="min-h-12 w-full rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white sm:w-auto"
            >
              Enregistrer la marque
            </button>
          </div>
        </form>
      </section>


      <section className="mt-7">
        <div className="flex items-center gap-2">
          <Tags
            size={19}
            className="text-[#0b4da2]"
          />

          <h2 className="text-xl font-black">
            Marques existantes
          </h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {brands.map(
            (
              brand,
            ) => (
              <article
                key={
                  brand.id
                }
                className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <strong>
                    {
                      brand.name
                    }
                  </strong>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                      brand.is_active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {brand.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  {
                    brand.products_count
                  }{" "}
                  produit(s)
                </p>

                {brand.is_featured && (
                  <p className="mt-2 text-[10px] font-black text-[#ff6b00]">
                    ⭐ Mise en avant
                  </p>
                )}
              </article>
            ),
          )}
        </div>
      </section>
    </>
  );
}