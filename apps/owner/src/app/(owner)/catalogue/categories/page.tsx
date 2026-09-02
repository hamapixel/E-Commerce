import {
  FolderPlus,
  FolderTree,
} from "lucide-react";

import {
  createCategoryAction,
} from "@/actions/catalogue";

import {
  ownerFetch,
} from "@/lib/backend";

import type {
  OwnerCategory,
} from "@/types/catalogue";


export default async function CategoriesPage() {
  const categories =
    await ownerFetch<
      OwnerCategory[]
    >(
      "/owner/catalog/categories/"
    );


  return (
    <>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
          Catalogue
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Catégories
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Créez librement vos catégories
          et sous-catégories.
        </p>
      </div>


      <section className="mt-7 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00]">
            <FolderPlus
              size={20}
            />
          </div>

          <div>
            <h2 className="font-black">
              Nouvelle catégorie
            </h2>

            <p className="text-xs text-slate-500">
              Les champs SEO sont
              facultatifs.
            </p>
          </div>
        </div>

        <form
          action={
            createCategoryAction
          }
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <label className="block">
            <span className="text-xs font-black text-slate-600">
              Nom *
            </span>

            <input
              name="name"
              required
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">
              Catégorie parente
            </span>

            <select
              name="parent"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none"
            >
              <option value="">
                Aucune
              </option>

              {categories.map(
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

          <label className="block md:col-span-2">
            <span className="text-xs font-black text-slate-600">
              Description
            </span>

            <textarea
              name="description"
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">
              Image
            </span>

            <input
              name="image"
              type="file"
              accept="image/*"
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-xs"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">
              Icône
            </span>

            <input
              name="icon"
              placeholder="Ex: smartphone"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">
              Ordre affichage
            </span>

            <input
              name="display_order"
              type="number"
              min="0"
              defaultValue="0"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4">
              <input
                name="is_active"
                type="checkbox"
                defaultChecked
              />

              <span className="text-xs font-black">
                Active
              </span>
            </label>

            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4">
              <input
                name="is_featured_home"
                type="checkbox"
              />

              <span className="text-xs font-black">
                Accueil
              </span>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-black text-slate-600">
              Titre SEO
            </span>

            <input
              name="seo_title"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black text-slate-600">
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
              Enregistrer la catégorie
            </button>
          </div>
        </form>
      </section>


      <section className="mt-7">
        <div className="flex items-center gap-2">
          <FolderTree
            size={19}
            className="text-[#0b4da2]"
          />

          <h2 className="text-xl font-black">
            Catégories existantes
          </h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map(
            (
              category,
            ) => (
              <article
                key={
                  category.id
                }
                className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block truncate text-slate-950">
                      {
                        category.name
                      }
                    </strong>

                    {category.parent_name && (
                      <p className="mt-1 text-[10px] font-bold text-[#0b4da2]">
                        Sous-catégorie de{" "}
                        {
                          category.parent_name
                        }
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black ${
                      category.is_active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {category.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  {
                    category.products_count
                  }{" "}
                  produit(s)
                </p>

                <p className="mt-1 truncate text-[10px] text-slate-400">
                  /{
                    category.slug
                  }
                </p>
              </article>
            ),
          )}
        </div>
      </section>
    </>
  );
}