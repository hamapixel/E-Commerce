import type {
  Metadata,
} from "next";

import {
  Search,
} from "lucide-react";

import {
  ProductGrid,
} from "@/components/product/product-grid";

import {
  SearchFilters,
  type SearchFilterValues,
} from "@/components/search/search-filters";

import {
  SearchPagination,
} from "@/components/search/search-pagination";

import {
  getBrands,
  getCategories,
  getProducts,
} from "@/lib/api";


export const metadata: Metadata = {
  title: "Rechercher",
  description:
    "Recherchez les produits disponibles sur SUGU KURA.",
};


export const dynamic =
  "force-dynamic";


const PRODUCTS_PER_PAGE = 16;


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


function readParam(
  params: Record<
    string,
    string |
    string[] |
    undefined
  >,
  name: string,
) {
  const value = params[name];

  if (
    Array.isArray(value)
  ) {
    return value[0] ?? "";
  }

  return value ?? "";
}


export default async function SearchPage({
  searchParams,
}: PageProps) {
  const raw =
    await searchParams;

  const values: SearchFilterValues = {
    search:
      readParam(
        raw,
        "search",
      ),

    category:
      readParam(
        raw,
        "category",
      ),

    brand:
      readParam(
        raw,
        "brand",
      ),

    min_price:
      readParam(
        raw,
        "min_price",
      ),

    max_price:
      readParam(
        raw,
        "max_price",
      ),

    in_stock:
      readParam(
        raw,
        "in_stock",
      ),

    has_variants:
      readParam(
        raw,
        "has_variants",
      ),

    ordering:
      readParam(
        raw,
        "ordering",
      ) || "-created_at",
  };

  const page = Math.max(
    1,
    Number(
      readParam(
        raw,
        "page",
      ) || "1",
    ) || 1,
  );

  const apiParams =
    new URLSearchParams();

  apiParams.set(
    "page_size",
    String(
      PRODUCTS_PER_PAGE,
    ),
  );

  apiParams.set(
    "page",
    String(page),
  );

  if (values.search) {
    apiParams.set(
      "search",
      values.search,
    );
  }

  if (values.category) {
    apiParams.set(
      "category",
      values.category,
    );
  }

  if (values.brand) {
    apiParams.set(
      "brand",
      values.brand,
    );
  }

  if (values.min_price) {
    apiParams.set(
      "min_price",
      values.min_price,
    );
  }

  if (values.max_price) {
    apiParams.set(
      "max_price",
      values.max_price,
    );
  }

  if (values.in_stock) {
    apiParams.set(
      "in_stock",
      values.in_stock,
    );
  }

  if (values.has_variants) {
    apiParams.set(
      "has_variants",
      values.has_variants,
    );
  }

  apiParams.set(
    "ordering",
    values.ordering,
  );

  const [
    categories,
    brands,
    products,
  ] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts(
      apiParams.toString(),
    ),
  ]);

  const browserParams:
    Record<string, string> = {};

  Object.entries(
    values
  ).forEach(
    ([key, value]) => {
      if (value) {
        browserParams[key] =
          value;
      }
    },
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:py-10">
      <section className="rounded-[28px] bg-gradient-to-r from-[#0b4da2] to-[#061f43] px-5 py-8 text-white sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Search size={22} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              SUGU KURA
            </p>

            <h1 className="text-2xl font-black sm:text-3xl">
              Recherche de produits
            </h1>
          </div>
        </div>

        {values.search && (
          <p className="mt-4 text-sm text-blue-100">
            Résultats pour:{" "}
            <strong className="text-white">
              “{values.search}”
            </strong>
          </p>
        )}
      </section>

      <div className="mt-7 grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
        <SearchFilters
          key={values.search}
          categories={categories}
          brands={brands}
          values={values}
        />

        <section
          id="catalogue-results"
          className="scroll-mt-36"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6b00]">
                Catalogue
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {products.count}{" "}
                produit
                {products.count !== 1
                  ? "s"
                  : ""}
              </h2>
            </div>

            <p className="text-xs font-semibold text-slate-400">
              {PRODUCTS_PER_PAGE} produits maximum par page
            </p>
          </div>

          <ProductGrid
            products={products.results}
          />

          <SearchPagination
            count={products.count}
            page={page}
            pageSize={
              PRODUCTS_PER_PAGE
            }
            params={browserParams}
          />
        </section>
      </div>
    </div>
  );
}
