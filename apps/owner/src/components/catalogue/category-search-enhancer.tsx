"use client";

import {
  Search,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

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

function getCategoryArticles() {
  const headings = Array.from(
    document.querySelectorAll("h2"),
  );

  const heading = headings.find(
    (element) =>
      element.textContent
        ?.trim()
        .toLowerCase()
        === "catégories existantes",
  );

  const section = heading?.closest("section");

  if (!section) {
    return [] as HTMLElement[];
  }

  return Array.from(
    section.querySelectorAll<HTMLElement>("article"),
  );
}

export function CategorySearchEnhancer() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<CategoryFilter>("all");
  const [resultCount, setResultCount] =
    useState<number | null>(null);

  useEffect(() => {
    const normalizedQuery =
      normalizeSearchValue(query);

    function applyFilters() {
      const articles = getCategoryArticles();
      let visibleCount = 0;

      for (const article of articles) {
        const header =
          article.firstElementChild as HTMLElement | null;
        const headerText =
          header?.textContent ?? "";
        const normalizedText =
          normalizeSearchValue(headerText);
        const isChild =
          normalizedText.includes("sous-categorie de");

        const matchesFilter =
          filter === "all"
          || (filter === "root" && !isChild)
          || (filter === "child" && isChild);

        const matchesSearch =
          !normalizedQuery
          || normalizedText.includes(normalizedQuery);

        const visible =
          matchesFilter && matchesSearch;

        article.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      }

      setResultCount(visibleCount);
    }

    const frame = window.requestAnimationFrame(
      applyFilters,
    );

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [query, filter]);

  const hasFilters =
    Boolean(query.trim()) || filter !== "all";

  return (
    <section className="mb-6 rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#ff6b00] sm:text-xs">
            Recherche rapide
          </p>

          <div className="relative">
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
              placeholder="Rechercher une catégorie ou sous-catégorie..."
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
        </div>

        <div className="grid grid-cols-3 gap-2 lg:mt-6 lg:flex lg:shrink-0">
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
              className={`min-h-11 rounded-xl px-3 text-[10px] font-black transition sm:text-xs ${
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
          {resultCount === null
            ? "Recherche prête"
            : `${resultCount} catégorie${resultCount > 1 ? "s" : ""} affichée${resultCount > 1 ? "s" : ""}`}
        </p>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="font-black text-[#ff6b00] transition hover:text-[#d95700]"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </section>
  );
}
