"use client";

import Link from "next/link";

import {
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useEffect,
  useState,
  useTransition,
} from "react";

import type {
  Brand,
  Category,
} from "@/types/api";


export interface SearchFilterValues {
  search: string;
  category: string;
  brand: string;
  min_price: string;
  max_price: string;
  in_stock: string;
  has_variants: string;
  ordering: string;
}


interface SearchFiltersProps {
  categories: Category[];
  brands: Brand[];
  values: SearchFilterValues;
}


interface AdvancedFiltersFormProps {
  categories: Category[];
  brands: Brand[];
  values: SearchFilterValues;
  searchValue: string;
  idPrefix: string;
}


function AdvancedFiltersForm({
  categories,
  brands,
  values,
  searchValue,
  idPrefix,
}: AdvancedFiltersFormProps) {
  const categoryId =
    `${idPrefix}-category`;
  const brandId =
    `${idPrefix}-brand`;
  const orderingId =
    `${idPrefix}-ordering`;

  const formKey = [
    values.category,
    values.brand,
    values.min_price,
    values.max_price,
    values.in_stock,
    values.has_variants,
    values.ordering,
  ].join("|");

  return (
    <form
      key={formKey}
      action="/recherche"
      method="get"
      className="space-y-4"
    >
      {searchValue && (
        <input
          type="hidden"
          name="search"
          value={searchValue}
          readOnly
        />
      )}

      <div>
        <label
          htmlFor={categoryId}
          className="mb-2 block text-xs font-bold text-slate-700"
        >
          Catégorie
        </label>

        <select
          id={categoryId}
          name="category"
          defaultValue={values.category}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#ff6b00]"
        >
          <option value="">
            Toutes les catégories
          </option>

          {categories.map(
            (category) => (
              <option
                key={category.id}
                value={category.slug}
              >
                {category.name}
              </option>
            ),
          )}
        </select>
      </div>

      <div>
        <label
          htmlFor={brandId}
          className="mb-2 block text-xs font-bold text-slate-700"
        >
          Marque
        </label>

        <select
          id={brandId}
          name="brand"
          defaultValue={values.brand}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#ff6b00]"
        >
          <option value="">
            Toutes les marques
          </option>

          {brands.map(
            (brand) => (
              <option
                key={brand.id}
                value={brand.slug}
              >
                {brand.name}
              </option>
            ),
          )}
        </select>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-slate-700">
          Prix
        </p>

        <div className="grid grid-cols-2 gap-2">
          <input
            name="min_price"
            type="number"
            min="0"
            defaultValue={values.min_price}
            placeholder="Min"
            className="h-11 min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
          />

          <input
            name="max_price"
            type="number"
            min="0"
            defaultValue={values.max_price}
            placeholder="Max"
            className="h-11 min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3">
          <input
            type="checkbox"
            name="in_stock"
            value="true"
            defaultChecked={
              values.in_stock ===
              "true"
            }
            className="h-4 w-4 shrink-0 accent-[#ff6b00]"
          />

          <span className="text-xs font-semibold text-slate-700 sm:text-sm">
            En stock
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3">
          <input
            type="checkbox"
            name="has_variants"
            value="true"
            defaultChecked={
              values.has_variants ===
              "true"
            }
            className="h-4 w-4 shrink-0 accent-[#0b4da2]"
          />

          <span className="text-xs font-semibold text-slate-700 sm:text-sm">
            Variantes
          </span>
        </label>
      </div>

      <div>
        <label
          htmlFor={orderingId}
          className="mb-2 block text-xs font-bold text-slate-700"
        >
          Trier par
        </label>

        <select
          id={orderingId}
          name="ordering"
          defaultValue={values.ordering}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#0b4da2]"
        >
          <option value="-created_at">
            Plus récents
          </option>

          <option value="created_at">
            Plus anciens
          </option>

          <option value="name">
            Nom A → Z
          </option>

          <option value="-name">
            Nom Z → A
          </option>

          <option value="base_price">
            Prix croissant
          </option>

          <option value="-base_price">
            Prix décroissant
          </option>
        </select>
      </div>

      <button
        type="submit"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] text-sm font-black text-white transition hover:bg-[#e85f00]"
      >
        <Filter size={16} />
        Appliquer
      </button>

      <Link
        href={
          searchValue
            ? `/recherche?search=${encodeURIComponent(searchValue)}`
            : "/recherche"
        }
        className="flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
      >
        Effacer les filtres
      </Link>
    </form>
  );
}


export function SearchFilters({
  categories,
  brands,
  values,
}: SearchFiltersProps) {
  const router =
    useRouter();
  const pathname =
    usePathname();
  const searchParams =
    useSearchParams();

  const [
    search,
    setSearch,
  ] = useState(
    values.search,
  );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  useEffect(
    () => {
      setSearch(
        values.search,
      );
    },
    [values.search],
  );

  useEffect(
    () => {
      const normalized =
        search.trim();

      if (
        normalized ===
        values.search
      ) {
        return;
      }

      const timer =
        window.setTimeout(
          () => {
            const params =
              new URLSearchParams(
                searchParams.toString(),
              );

            if (normalized) {
              params.set(
                "search",
                normalized,
              );
            } else {
              params.delete(
                "search",
              );
            }

            // Une nouvelle recherche repart toujours de la page 1.
            // Le backend cherche dans TOUT le catalogue avant pagination.
            params.delete(
              "page",
            );

            const query =
              params.toString();

            const href =
              query
                ? `${pathname}?${query}#catalogue-results`
                : `${pathname}#catalogue-results`;

            startTransition(
              () => {
                router.replace(
                  href,
                  {
                    scroll: false,
                  },
                );
              },
            );
          },
          300,
        );

      return () => {
        window.clearTimeout(
          timer,
        );
      };
    },
    [
      pathname,
      router,
      search,
      searchParams,
      values.search,
    ],
  );

  return (
    <aside className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-32 lg:p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00]">
          <SlidersHorizontal
            size={19}
          />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6b00]">
            Catalogue
          </p>

          <h2 className="font-black text-slate-950">
            Recherche & filtres
          </h2>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="instant-product-search"
          className="mb-2 block text-xs font-bold text-slate-700"
        >
          Recherche instantanée
        </label>

        <div className="flex h-12 items-center rounded-xl border-2 border-slate-200 bg-slate-50 px-3 transition focus-within:border-[#ff6b00] focus-within:bg-white">
          <Search
            size={18}
            className="shrink-0 text-slate-400"
          />

          <input
            id="instant-product-search"
            type="search"
            value={search}
            onChange={
              (event) =>
                setSearch(
                  event.target.value,
                )
            }
            placeholder="Nom, SKU, marque, catégorie..."
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
          />

          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#ff6b00]" />
          )}
        </div>

        <p className="mt-2 text-[10px] font-semibold leading-4 text-slate-400">
          La recherche parcourt tout le catalogue, même si le produit était sur une autre page.
        </p>
      </div>

      <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black text-[#0b4da2]">
          Filtres avancés
        </summary>

        <div className="border-t border-slate-200 bg-white p-3">
          <AdvancedFiltersForm
            categories={categories}
            brands={brands}
            values={values}
            searchValue={search}
            idPrefix="mobile"
          />
        </div>
      </details>

      <div className="mt-5 hidden lg:block">
        <AdvancedFiltersForm
          categories={categories}
          brands={brands}
          values={values}
          searchValue={search}
          idPrefix="desktop"
        />
      </div>
    </aside>
  );
}
