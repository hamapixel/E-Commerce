"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import type {
  Category,
} from "@/types/api";

interface CategoryGridProps {
  categories: Category[];
}

function normalizeSearchValue(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function CategoryGrid({
  categories,
}: CategoryGridProps) {
  const [
    query,
    setQuery,
  ] = useState("");

  const normalizedQuery =
    normalizeSearchValue(query);

  const visible = useMemo(
    () => {
      if (!normalizedQuery) {
        return categories.filter(
          (category) =>
            !category.parent
            && category.is_featured_home,
        );
      }

      return categories.filter(
        (category) => {
          const haystack =
            normalizeSearchValue(
              [
                category.name,
                category.parent?.name ?? "",
                category.description ?? "",
              ].join(" "),
            );

          return haystack.includes(
            normalizedQuery,
          );
        },
      );
    },
    [
      categories,
      normalizedQuery,
    ],
  );

  if (!categories.length) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-4 sm:mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b00] sm:text-xs">
            Explorer
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
            Nos catégories
          </h2>
        </div>

        {!normalizedQuery && (
          <span className="shrink-0 text-[10px] font-bold text-slate-400">
            Glissez →
          </span>
        )}
      </div>

      <div className="relative mb-4 max-w-xl">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(
              event.target.value,
            );
          }}
          placeholder="Rechercher une catégorie..."
          aria-label="Rechercher une catégorie"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-11 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#ff6b00] focus:ring-4 focus:ring-orange-50"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
            }}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {normalizedQuery && (
        <p className="mb-3 text-xs font-semibold text-slate-500">
          {visible.length} catégorie
          {visible.length > 1
            ? "s"
            : ""}
          {" trouvée"}
          {visible.length > 1
            ? "s"
            : ""}
        </p>
      )}

      {visible.length > 0 ? (
        <div
          className={
            normalizedQuery
              ? "grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
              : "-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6"
          }
        >
          {visible.map(
            (category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={
                  normalizedQuery
                    ? "group min-w-0 rounded-[14px] border border-slate-200 bg-white p-1.5 text-center shadow-sm transition duration-300 active:scale-[0.98] hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:p-2"
                    : "group w-[86px] shrink-0 snap-start rounded-[14px] border border-slate-200 bg-white p-1.5 text-center shadow-sm transition duration-300 active:scale-[0.98] hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:w-[96px] sm:p-2 md:w-[104px]"
                }
              >
                <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-[10px] bg-slate-50">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="104px"
                      className="object-contain p-1.5 transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl font-black text-[#0b4da2]">
                      {category.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <p className="mt-1.5 line-clamp-2 min-h-[28px] text-[10px] font-bold leading-[14px] text-slate-800 sm:text-[11px]">
                  {category.name}
                </p>

                {normalizedQuery
                  && category.parent && (
                  <p className="mt-0.5 truncate text-[9px] font-medium text-slate-400">
                    {category.parent.name}
                  </p>
                )}
              </Link>
            ),
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-7 text-center">
          <p className="text-sm font-black text-slate-700">
            Aucune catégorie trouvée
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Essayez un autre nom de catégorie.
          </p>
        </div>
      )}
    </div>
  );
}
