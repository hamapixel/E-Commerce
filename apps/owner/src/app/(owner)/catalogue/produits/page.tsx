import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  Eye,
  PackagePlus,
  Pencil,
} from "lucide-react";

import {
  ProductCatalogFilters,
} from "@/components/catalogue/product-catalog-filters";

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
          <Link
            href="/catalogue"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-black text-[#0b4da2] shadow-sm transition hover:bg-blue-100"
          >
            <ArrowLeft
              size={15}
            />

            Retour au catalogue
          </Link>

          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
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
          RECHERCHE ET FILTRES INSTANTANES
      ========================================= */}
      <ProductCatalogFilters
        metadata={metadata}
        initialQuery={
          params.q ?? ""
        }
        initialCategory={
          params.category ?? ""
        }
        initialBrand={
          params.brand ?? ""
        }
        initialStatus={
          params.status ?? ""
        }
      />


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
              <div className="relative aspect-[16/8] bg-slate-100">

                {product.primary_image_url ? (
                  <Image
                    src={
                      product.primary_image_url
                    }
                    alt={
                      product.name
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-contain p-2"
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