import {
  FolderPlus,
  FolderTree,
  Pencil,
  Power,
} from "lucide-react";

import {
  createCategoryAction,
  toggleCategoryAction,
  updateCategoryAction,
} from "@/actions/catalogue";

import {
  CategoryDeleteButton,
} from "@/components/catalogue/category-delete-button";

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

  const roots =
    categories.filter(
      (category) =>
        category.parent === null,
    );

  const activeCount =
    categories.filter(
      (category) =>
        category.is_active,
    ).length;


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
          Gérez les catégories et
          sous-catégories de SUGU KURA.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-[#0b4da2]">
            {categories.length} catégorie(s)
          </span>

          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-[#ff6b00]">
            {roots.length} principale(s)
          </span>

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
            {activeCount} active(s)
          </span>
        </div>
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
              Catégorie principale
              ou sous-catégorie.
            </p>
          </div>
        </div>


        <form
          action={
            createCategoryAction
          }
          className="mt-6 grid gap-4 md:grid-cols-2"
        >
          <label>
            <span className="text-xs font-black text-slate-600">
              Nom *
            </span>

            <input
              name="name"
              required
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
            />
          </label>


          <label>
            <span className="text-xs font-black text-slate-600">
              Catégorie parente
            </span>

            <select
              name="parent"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"
            >
              <option value="">
                Aucune
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.parent_name
                        ? `${category.parent_name} > ${category.name}`
                        : category.name
                    }
                  </option>
                ),
              )}
            </select>
          </label>


          <label className="md:col-span-2">
            <span className="text-xs font-black text-slate-600">
              Description
            </span>

            <textarea
              name="description"
              rows={3}
              className="mt-2 w-full rounded-xl border border-slate-200 p-4"
            />
          </label>


          <label>
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


          <label>
            <span className="text-xs font-black text-slate-600">
              Icône
            </span>

            <input
              name="icon"
              placeholder="Ex: smartphone"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
            />
          </label>


          <label>
            <span className="text-xs font-black text-slate-600">
              Ordre d&apos;affichage
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
                Afficher sur l&apos;accueil
              </span>
            </label>
          </div>


          <label>
            <span className="text-xs font-black text-slate-600">
              Titre SEO
            </span>

            <input
              name="seo_title"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
            />
          </label>


          <label>
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
              className="h-12 rounded-xl bg-[#ff6b00] px-6 text-sm font-black text-white transition hover:bg-[#e85f00]"
            >
              Enregistrer la catégorie
            </button>
          </div>
        </form>
      </section>


      <section className="mt-8">
        <div className="flex items-center gap-2">
          <FolderTree
            size={19}
            className="text-[#0b4da2]"
          />

          <h2 className="text-xl font-black">
            Catégories existantes
          </h2>
        </div>


        <div className="mt-4 space-y-4">
          {categories.map(
            (category) => {
              const updateAction =
                updateCategoryAction.bind(
                  null,
                  category.id,
                );

              const toggleAction =
                toggleCategoryAction.bind(
                  null,
                  category.id,
                  category.is_active,
                );


              return (
                <article
                  key={
                    category.id
                  }
                  className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-base text-slate-950">
                          {category.name}
                        </strong>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                            category.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {
                            category.is_active
                              ? "ACTIVE"
                              : "INACTIVE"
                          }
                        </span>

                        {
                          category.is_featured_home &&
                          (
                            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-black text-[#ff6b00]">
                              ACCUEIL
                            </span>
                          )
                        }
                      </div>


                      {
                        category.parent_name &&
                        (
                          <p className="mt-1 text-[11px] font-bold text-[#0b4da2]">
                            Sous-catégorie de{" "}
                            {
                              category.parent_name
                            }
                          </p>
                        )
                      }


                      <p className="mt-2 text-xs text-slate-500">
                        {
                          category.products_count
                        } produit(s)
                        {" · "}
                        /{category.slug}
                      </p>
                    </div>


                    <form
                      action={
                        toggleAction
                      }
                    >
                      <button
                        type="submit"
                        className={`flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-black ${
                          category.is_active
                            ? "bg-slate-100 text-slate-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        <Power
                          size={15}
                        />

                        {
                          category.is_active
                            ? "Désactiver"
                            : "Activer"
                        }
                      </button>
                    </form>
                  </div>


                  <details className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-xs font-black text-[#0b4da2]">
                      <Pencil
                        size={15}
                      />

                      Modifier cette catégorie
                    </summary>


                    <form
                      action={
                        updateAction
                      }
                      className="grid gap-4 border-t border-slate-200 p-4 md:grid-cols-2"
                    >
                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Nom
                        </span>

                        <input
                          name="name"
                          required
                          defaultValue={
                            category.name
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                        />
                      </label>


                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Catégorie parente
                        </span>

                        <select
                          name="parent"
                          defaultValue={
                            category.parent ??
                            ""
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
                        >
                          <option value="">
                            Aucune
                          </option>

                          {
                            categories
                              .filter(
                                (candidate) =>
                                  candidate.id !==
                                  category.id,
                              )
                              .map(
                                (candidate) => (
                                  <option
                                    key={
                                      candidate.id
                                    }
                                    value={
                                      candidate.id
                                    }
                                  >
                                    {
                                      candidate.parent_name
                                        ? `${candidate.parent_name} > ${candidate.name}`
                                        : candidate.name
                                    }
                                  </option>
                                ),
                              )
                          }
                        </select>
                      </label>


                      <label className="md:col-span-2">
                        <span className="text-xs font-black text-slate-600">
                          Description
                        </span>

                        <textarea
                          name="description"
                          rows={3}
                          defaultValue={
                            category.description
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 p-3"
                        />
                      </label>


                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Nouvelle image
                        </span>

                        <input
                          name="image"
                          type="file"
                          accept="image/*"
                          className="mt-2 block w-full rounded-xl border border-slate-200 p-3 text-xs"
                        />
                      </label>


                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Icône
                        </span>

                        <input
                          name="icon"
                          defaultValue={
                            category.icon
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
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
                          defaultValue={
                            category.display_order
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                        />
                      </label>


                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3">
                          <input
                            name="is_active"
                            type="checkbox"
                            defaultChecked={
                              category.is_active
                            }
                          />

                          <span className="text-xs font-black">
                            Active
                          </span>
                        </label>


                        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3">
                          <input
                            name="is_featured_home"
                            type="checkbox"
                            defaultChecked={
                              category.is_featured_home
                            }
                          />

                          <span className="text-xs font-black">
                            Accueil
                          </span>
                        </label>
                      </div>


                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Titre SEO
                        </span>

                        <input
                          name="seo_title"
                          defaultValue={
                            category.seo_title
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                        />
                      </label>


                      <label>
                        <span className="text-xs font-black text-slate-600">
                          Description SEO
                        </span>

                        <input
                          name="seo_description"
                          defaultValue={
                            category.seo_description
                          }
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

                        <CategoryDeleteButton
                          categoryId={
                            category.id
                          }
                          categoryName={
                            category.name
                          }
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
