import Link from "next/link";

import {
  Eye,
  PackagePlus,
  Pencil,
  Search,
} from "lucide-react";

import {
  ownerFetch,
} from "@/lib/backend";

import {
  formatMoney,
} from "@/lib/format";

import type {
  CatalogMetadata,
  OwnerPaginatedProducts,
} from "@/types/catalogue";


interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    status?: string;
    page?: string;
  }>;
}


export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params =
    await searchParams;

  const query =
    new URLSearchParams();


  query.set(
    "page",
    params.page ?? "1",
  );


  if (params.q) {
    query.set(
      "q",
      params.q,
    );
  }


  if (params.category) {
    query.set(
      "category",
      params.category,
    );
  }


  if (params.brand) {
    query.set(
      "brand",
      params.brand,
    );
  }


  if (params.status) {
    query.set(
      "status",
      params.status,
    );
  }


  const [
    data,
    metadata,
  ] = await Promise.all([
    ownerFetch<
      OwnerPaginatedProducts
    >(
      `/owner/catalog/products/?${query.toString()}`,
    ),

    ownerFetch<
      CatalogMetadata
    >(
      "/owner/catalog/metadata/",
    ),
  ]);


  return (
    <>
      {/* =========================================
          EN-TÊTE
      ========================================= */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Catalogue
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Produits
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {data.count} produit(s)
            dans votre catalogue.
          </p>
        </div>


        <Link
          href="/catalogue/produits/nouveau"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-xs font-black text-white transition hover:bg-[#e65f00]"
        >
          <PackagePlus
            size={16}
          />

          Nouveau produit
        </Link>
      </div>


      {/* =========================================
          FILTRES
      ========================================= */}
      <form className="mt-7 grid gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-5">

        {/* RECHERCHE */}
        <label className="relative sm:col-span-2 xl:col-span-2">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            name="q"
            defaultValue={
              params.q ?? ""
            }
            placeholder="Nom, SKU ou code-barres..."
            className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-[#ff6b00]"
          />
        </label>


        {/* CATÉGORIE */}
        <select
          name="category"
          defaultValue={
            params.category ?? ""
          }
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-[#ff6b00]"
        >
          <option value="">
            Toutes catégories
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


        {/* MARQUE */}
        <select
          name="brand"
          defaultValue={
            params.brand ?? ""
          }
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-[#ff6b00]"
        >
          <option value="">
            Toutes marques
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


        {/* RECHERCHER */}
        <button
          type="submit"
          className="h-11 rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-slate-800"
        >
          Rechercher
        </button>
      </form>


      {/* =========================================
          LISTE PRODUITS
      ========================================= */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

        {data.results.map(
          (
            product,
          ) => (
            <article
              key={
                product.id
              }
              className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >

              {/* =================================
                  PHOTO
              ================================= */}
              <div className="aspect-[16/8] bg-slate-100">

                {product.primary_image_url ? (
                  <div
                    role="img"
                    aria-label={
                      product.name
                    }
                    className="h-full w-full bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        `url("${product.primary_image_url}")`,
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">
                    Aucune photo
                  </div>
                )}
              </div>


              {/* =================================
                  INFORMATIONS
              ================================= */}
              <div className="p-4">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="text-[10px] font-black uppercase tracking-wider text-[#0b4da2]">
                      {
                        product.category_name
                      }
                    </p>

                    <h2 className="mt-1 line-clamp-2 font-black text-slate-950">
                      {
                        product.name
                      }
                    </h2>

                    <p className="mt-1 text-[10px] text-slate-400">
                      SKU :{" "}
                      {
                        product.sku
                      }
                    </p>

                    {product.brand_name && (
                      <p className="mt-1 text-[10px] font-bold text-slate-500">
                        Marque :{" "}
                        {
                          product.brand_name
                        }
                      </p>
                    )}
                  </div>


                  {/* STATUT */}
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black">
                    {
                      product.status
                    }
                  </span>
                </div>


                {/* =================================
                    PRIX
                ================================= */}
                <strong className="mt-4 block text-xl text-[#ff6b00]">
                  {formatMoney(
                    product.base_price,
                  )}
                </strong>


                {/* =================================
                    STATISTIQUES
                ================================= */}
                <div className="mt-4 grid grid-cols-3 gap-2">

                  {/* STOCK */}
                  <div className="rounded-xl bg-slate-50 p-2 text-center">
                    <span className="block text-[9px] text-slate-400">
                      Dispo
                    </span>

                    <strong className="text-sm">
                      {
                        product.stock_available
                      }
                    </strong>
                  </div>


                  {/* VARIANTES */}
                  <div className="rounded-xl bg-slate-50 p-2 text-center">
                    <span className="block text-[9px] text-slate-400">
                      Variantes
                    </span>

                    <strong className="text-sm">
                      {
                        product.variants_count
                      }
                    </strong>
                  </div>


                  {/* PHOTOS */}
                  <div className="rounded-xl bg-slate-50 p-2 text-center">
                    <span className="block text-[9px] text-slate-400">
                      Photos
                    </span>

                    <strong className="text-sm">
                      {
                        product.images_count
                      }
                    </strong>
                  </div>
                </div>


                {/* =================================
                    ACTIONS
                ================================= */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href={`/catalogue/produits/${product.id}`}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <Eye
                      size={15}
                    />

                    Voir détails
                  </Link>

                  <Link
                    href={`/catalogue/produits/${product.id}/modifier`}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-black text-[#0b4da2] transition hover:bg-blue-100"
                  >
                    <Pencil
                      size={15}
                    />

                    Modifier
                  </Link>
                </div>
              </div>
            </article>
          ),
        )}
      </section>


      {/* =========================================
          AUCUN PRODUIT
      ========================================= */}
      {data.results.length === 0 && (
        <div className="mt-5 rounded-[20px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Aucun produit trouvé.
        </div>
      )}
    </>
  );
}