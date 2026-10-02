import Link from "next/link";

import {
  ArrowLeft,
  BadgePlus,
  ChevronDown,
  Pencil,
  Power,
  Tags,
} from "lucide-react";

import {
  createBrandAction,
} from "@/actions/catalogue";

import {
  toggleBrandAction,
  updateBrandAction,
} from "@/actions/brand-actions";

import {
  BrandDeleteButton,
} from "@/components/catalogue/brand-delete-button";

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

  const activeCount =
    brands.filter(
      (brand) =>
        brand.is_active,
    ).length;

  const featuredCount =
    brands.filter(
      (brand) =>
        brand.is_featured,
    ).length;


  return (
    <>
      <div>
        <Link
          href="/catalogue"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-black text-[#0b4da2] shadow-sm transition hover:bg-blue-100"
        >
          <ArrowLeft size={15} />
          Retour au catalogue
        </Link>

        <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
          Catalogue
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Marques
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Créez, modifiez, activez ou désactivez
          les marques de votre boutique.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-[#0b4da2]">
            {brands.length} marque(s)
          </span>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
            {activeCount} active(s)
          </span>

          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-[#ff6b00]">
            {featuredCount} mise(s) en avant
          </span>
        </div>
      </div>


      <details className="group mt-7 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00]">
              <BadgePlus size={20} />
            </div>

            <div>
              <h2 className="font-black">
                Ajouter une marque
              </h2>

              <p className="text-xs text-slate-500">
                Ouvrir le formulaire de création.
              </p>
            </div>
          </div>

          <ChevronDown
            size={19}
            className="shrink-0 text-slate-400 transition group-open:rotate-180"
          />
        </summary>

        <form
          action={
            createBrandAction
          }
          className="grid gap-4 border-t border-slate-200 p-5 sm:p-6 md:grid-cols-2"
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

          <div className="flex flex-wrap gap-2 md:col-span-2">
            <button
              type="submit"
              className="min-h-12 w-full rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white transition hover:bg-[#e65f00] sm:w-auto"
            >
              Enregistrer la marque
            </button>

            <Link
              href="/catalogue"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              <ArrowLeft size={16} />
              Retour
            </Link>
          </div>
        </form>
      </details>


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

        <div className="mt-4 space-y-4">
          {brands.map(
            (brand) => {
              const updateAction =
                updateBrandAction.bind(
                  null,
                  brand.id,
                );

              const toggleAction =
                toggleBrandAction.bind(
                  null,
                  brand.id,
                  brand.is_active,
                );

              return (
                <article
                  key={brand.id}
                  className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-base text-slate-950">
                          {brand.name}
                        </strong>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                            brand.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {brand.is_active
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>

                        {brand.is_featured && (
                          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-black text-[#ff6b00]">
                            MISE EN AVANT
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {brand.products_count} produit(s)
                        {" · "}
                        /{brand.slug}
                      </p>
                    </div>

                    <form
                      action={toggleAction}
                    >
                      <button
                        type="submit"
                        className={`flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black ${
                          brand.is_active
                            ? "bg-slate-100 text-slate-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <Power size={15} />

                        {brand.is_active
                          ? "Désactiver"
                          : "Activer"}
                      </button>
                    </form>
                  </div>

                  <details className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-xs font-black text-[#0b4da2]">
                      <Pencil size={15} />
                      Modifier cette marque
                    </summary>

                    <form
                      action={updateAction}
                      className="grid gap-4 border-t border-slate-200 p-4 md:grid-cols-2"
                    >
                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Nom
                        </span>

                        <input
                          name="name"
                          required
                          defaultValue={brand.name}
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Site web
                        </span>

                        <input
                          name="website"
                          type="url"
                          defaultValue={brand.website}
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                        />
                      </label>

                      <label className="md:col-span-2">
                        <span className="text-xs font-black text-slate-600">
                          Description
                        </span>

                        <textarea
                          name="description"
                          rows={3}
                          defaultValue={brand.description}
                          className="mt-2 w-full rounded-xl border border-slate-200 p-3"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Nouveau logo
                        </span>

                        <input
                          name="logo"
                          type="file"
                          accept="image/*"
                          className="mt-2 block w-full rounded-xl border border-slate-200 p-3 text-xs"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Ordre
                        </span>

                        <input
                          name="display_order"
                          type="number"
                          min="0"
                          defaultValue={brand.display_order}
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                        />
                      </label>

                      <div className="grid gap-2 sm:grid-cols-2 md:col-span-2">
                        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3">
                          <input
                            name="is_active"
                            type="checkbox"
                            defaultChecked={brand.is_active}
                          />

                          <span className="text-xs font-black">
                            Active
                          </span>
                        </label>

                        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3">
                          <input
                            name="is_featured"
                            type="checkbox"
                            defaultChecked={brand.is_featured}
                          />

                          <span className="text-xs font-black">
                            Mise en avant
                          </span>
                        </label>
                      </div>

                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Titre SEO
                        </span>

                        <input
                          name="seo_title"
                          defaultValue={brand.seo_title}
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Description SEO
                        </span>

                        <input
                          name="seo_description"
                          defaultValue={brand.seo_description}
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2 md:col-span-2">
                        <button
                          type="submit"
                          className="h-10 rounded-xl bg-[#0b4da2] px-5 text-xs font-black text-white transition hover:bg-[#083b7f]"
                        >
                          Enregistrer les modifications
                        </button>

                        <BrandDeleteButton
                          brandId={brand.id}
                          brandName={brand.name}
                        />
                      </div>
                    </form>
                  </details>
                </article>
              );
            },
          )}
        </div>
      </section>
    </>
  );
}
