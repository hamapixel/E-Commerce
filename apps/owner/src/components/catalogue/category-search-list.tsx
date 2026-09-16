"use client";

import type { ReactNode } from "react";
import {
  Children,
  useMemo,
  useState,
} from "react";
import {
  Search,
  X,
} from "lucide-react";

interface CategorySearchItem {
  id: number;
  name: string;
  slug: string;
  parentName: string | null;
}

interface CategorySearchListProps {
  items: CategorySearchItem[];
  children: ReactNode;
}

type CategoryFilter =
  | "all"
  | "root"
  | "child";

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function CategorySearchList({
  items,
  children,
}: CategorySearchListProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<CategoryFilter>("all");

  const childArray = Children.toArray(children);

  const visibleIndexes = useMemo(() => {
    const normalizedQuery =
      normalizeSearchValue(query);

    return items.reduce<number[]>(
      (indexes, item, index) => {
        const matchesType =
          filter === "all"
          || (filter === "root" && !item.parentName)
          || (filter === "child" && Boolean(item.parentName));

        if (!matchesType) {
          return indexes;
        }

        const haystack = normalizeSearchValue(
          [
            item.name,
            item.slug,
            item.parentName ?? "",
          ].join(" "),
        );

        if (
          !normalizedQuery
          || haystack.includes(normalizedQuery)
        ) {
          indexes.push(index);
        }

        return indexes;
      },
      [],
    );
  }, [items, query, filter]);

  const hasActiveSearch =
    Boolean(query.trim()) || filter !== "all";

  function clearSearch() {
    setQuery("");
    setFilter("all");
  }

  return (
    <>
      <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Rechercher une catégorie, sous-catégorie ou slug..."
              aria-label="Rechercher une catégorie"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-[#ff6b00] focus:bg-white focus:ring-4 focus:ring-orange-50"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Effacer la recherche"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 lg:flex lg:shrink-0">
            {[
              ["all", "Toutes"],
              ["root", "Principales"],
              ["child", "Sous-catégories"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setFilter(value as CategoryFilter)
                }
                className={`min-h-10 rounded-xl px-3 text-[10px] font-black transition sm:text-xs ${
                  filter === value
                    ? "bg-[#0b4da2] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="font-bold text-slate-500">
            {visibleIndexes.length} résultat
            {visibleIndexes.length > 1 ? "s" : ""}
            {hasActiveSearch ? " trouvé" : " affiché"}
            {visibleIndexes.length > 1 ? "s" : ""}
          </p>

          {hasActiveSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="font-black text-[#ff6b00] transition hover:text-[#d95700]"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {visibleIndexes.length > 0 ? (
          visibleIndexes.map(
            (index) => childArray[index],
          )
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
            <Search
              size={28}
              className="mx-auto text-slate-300"
            />
            <p className="mt-3 font-black text-slate-700">
              Aucune catégorie trouvée
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Essayez un autre nom, le nom de la catégorie parente ou le slug.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
