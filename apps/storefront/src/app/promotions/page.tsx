import type {
  Metadata,
} from "next";

import {
  BadgePercent,
  Sparkles,
} from "lucide-react";

import {
  ProductGrid,
} from "@/components/product/product-grid";

import {
  SearchPagination,
} from "@/components/search/search-pagination";

import {
  getProducts,
  getPromotions,
} from "@/lib/api";


const PRODUCTS_PER_PAGE = 20;


interface PageProps {
  searchParams: Promise<
    Record<
      string,
      string |
      string[] |
      undefined
    >
  >;
}


export const dynamic =
  "force-dynamic";


export const metadata:
  Metadata = {
  title:
    "Promotions et bonnes affaires",

  description:
    "Découvrez tous les produits actuellement en promotion sur SUGU KURA.",

  alternates: {
    canonical:
      "/promotions",
  },
};


function readPage(
  value:
    | string
    | string[]
    | undefined,
) {
  const raw =
    Array.isArray(value)
      ? value[0]
      : value;

  return Math.max(
    1,
    Number(
      raw || "1",
    ) || 1,
  );
}


export default async function PromotionsPage({
  searchParams,
}: PageProps) {
  const rawSearchParams =
    await searchParams;

  const page =
    readPage(
      rawSearchParams.page,
    );

  const [
    promotions,
    products,
  ] = await Promise.all([
    getPromotions(),

    getProducts(
      `promotion=true&page_size=${PRODUCTS_PER_PAGE}&page=${page}&ordering=-created_at`,
    ),
  ]);


  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8">
      <section className="overflow-hidden rounded-[26px] bg-gradient-to-br from-[#ff6b00] via-[#ff7a16] to-[#0b4da2] p-5 text-white shadow-xl shadow-orange-100 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <BadgePercent
              size={24}
            />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-100 sm:text-xs">
              Bonnes affaires
            </p>

            <h1 className="mt-1 break-words text-2xl font-black sm:text-4xl">
              Tous les produits en promotion
            </h1>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-orange-50 sm:text-sm sm:leading-6">
              Retrouvez ici toutes les réductions actuellement actives sur SUGU KURA.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black backdrop-blur sm:text-xs">
            {products.count} produit
            {products.count !== 1
              ? "s"
              : ""}{" "}
            en promotion
          </span>

          <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black backdrop-blur sm:text-xs">
            {promotions.length} campagne
            {promotions.length !== 1
              ? "s"
              : ""}{" "}
            active
            {promotions.length !== 1
              ? "s"
              : ""}
          </span>
        </div>
      </section>


      <section className="mt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#ff6b00]">
              <Sparkles
                size={17}
              />

              <p className="text-xs font-black uppercase tracking-[0.15em]">
                Offres actuelles
              </p>
            </div>

            <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
              Profitez des meilleurs prix
            </h2>
          </div>

          {products.count > 0 && (
            <p className="text-xs font-bold text-slate-400">
              Page {page}
            </p>
          )}
        </div>


        {products.results.length > 0 ? (
          <>
            <ProductGrid
              products={
                products.results
              }
            />

            <SearchPagination
              count={
                products.count
              }
              page={
                page
              }
              pageSize={
                PRODUCTS_PER_PAGE
              }
              basePath="/promotions"
            />
          </>
        ) : (
          <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b00]">
              <BadgePercent
                size={25}
              />
            </div>

            <h2 className="mt-4 text-lg font-black text-slate-950">
              Aucune promotion pour le moment
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Les nouvelles offres apparaîtront automatiquement ici dès leur activation.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
