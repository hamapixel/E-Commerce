import Link from "next/link";

import {
  Filter,
  Search,
  SlidersHorizontal,
} from "lucide-react";

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


export function SearchFilters({
  categories,
  brands,
  values,
}: SearchFiltersProps) {
  return (
    <aside className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-32">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00]">
          <SlidersHorizontal
            size={19}
          />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6b00]">
            Catalogue
          </p>

          <h2 className="font-black text-slate-950">
            Filtres
          </h2>
        </div>
      </div>

      <form
        action="/recherche"
        method="get"
        className="mt-5 space-y-5"
      >
        <div>
          <label
            htmlFor="search"
            className="mb-2 block text-xs font-bold text-slate-700"
          >
            Rechercher
          </label>

          <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-[#ff6b00] focus-within:bg-white">
            <Search
              size={17}
              className="shrink-0 text-slate-400"
            />

            <input
              id="search"
              name="search"
              type="search"
              defaultValue={
                values.search
              }
              placeholder="Téléphone, ampoule..."
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-xs font-bold text-slate-700"
          >
            Catégorie
          </label>

          <select
            id="category"
            name="category"
            defaultValue={
              values.category
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#ff6b00]"
          >
            <option value="">
              Toutes les catégories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={
                    category.slug
                  }
                >
                  {category.name}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="brand"
            className="mb-2 block text-xs font-bold text-slate-700"
          >
            Marque
          </label>

          <select
            id="brand"
            name="brand"
            defaultValue={
              values.brand
            }
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
              defaultValue={
                values.min_price
              }
              placeholder="Min"
              className="h-11 min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
            />

            <input
              name="max_price"
              type="number"
              min="0"
              defaultValue={
                values.max_price
              }
              placeholder="Max"
              className="h-11 min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
          <input
            type="checkbox"
            name="in_stock"
            value="true"
            defaultChecked={
              values.in_stock ===
              "true"
            }
            className="h-4 w-4 accent-[#ff6b00]"
          />

          <span className="text-sm font-semibold text-slate-700">
            En stock uniquement
          </span>
        </label>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3">
          <input
            type="checkbox"
            name="has_variants"
            value="true"
            defaultChecked={
              values.has_variants ===
              "true"
            }
            className="h-4 w-4 accent-[#0b4da2]"
          />

          <span className="text-sm font-semibold text-slate-700">
            Avec variantes
          </span>
        </label>

        <div>
          <label
            htmlFor="ordering"
            className="mb-2 block text-xs font-bold text-slate-700"
          >
            Trier par
          </label>

          <select
            id="ordering"
            name="ordering"
            defaultValue={
              values.ordering
            }
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
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] text-sm font-black text-white transition hover:bg-[#e85f00]"
        >
          <Filter size={17} />
          Appliquer les filtres
        </button>

        <Link
          href="/recherche"
          className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
        >
          Effacer les filtres
        </Link>
      </form>
    </aside>
  );
}