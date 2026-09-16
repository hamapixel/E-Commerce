"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  Search,
  X,
} from "lucide-react";

import type {
  CatalogMetadata,
} from "@/types/catalogue";


interface ProductCatalogFiltersProps {
  metadata: CatalogMetadata;
  initialQuery: string;
  initialCategory: string;
  initialBrand: string;
  initialStatus: string;
}


export function ProductCatalogFilters({
  metadata,
  initialQuery,
  initialCategory,
  initialBrand,
  initialStatus,
}: ProductCatalogFiltersProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const firstRender =
    useRef(true);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    query,
    setQuery,
  ] = useState(
    initialQuery,
  );

  const [
    category,
    setCategory,
  ] = useState(
    initialCategory,
  );

  const [
    brand,
    setBrand,
  ] = useState(
    initialBrand,
  );

  const [
    status,
    setStatus,
  ] = useState(
    initialStatus,
  );


  useEffect(
    () => {
      if (
        firstRender.current
      ) {
        firstRender.current =
          false;

        return;
      }

      const timeout =
        window.setTimeout(
          () => {
            const params =
              new URLSearchParams();

            const cleanQuery =
              query.trim();

            if (cleanQuery) {
              params.set(
                "q",
                cleanQuery,
              );
            }

            if (category) {
              params.set(
                "category",
                category,
              );
            }

            if (brand) {
              params.set(
                "brand",
                brand,
              );
            }

            if (status) {
              params.set(
                "status",
                status,
              );
            }

            const search =
              params.toString();

            startTransition(
              () => {
                router.replace(
                  search
                    ? `${pathname}?${search}`
                    : pathname,
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
          timeout,
        );
      };
    },
    [
      query,
      category,
      brand,
      status,
      pathname,
      router,
    ],
  );


  const hasFilters =
    Boolean(
      query ||
      category ||
      brand ||
      status,
    );


  function clearFilters() {
    setQuery("");
    setCategory("");
    setBrand("");
    setStatus("");
  }


  return (
    <section className="mt-7 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="relative sm:col-span-2 xl:col-span-2">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
            placeholder="Recherche instantanée : nom, SKU ou code-barres..."
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none transition focus:border-[#ff6b00]"
          />
        </label>


        <select
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value,
            )
          }
          className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-[#ff6b00]"
        >
          <option value="">
            Toutes catégories
          </option>

          {metadata.categories.map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ),
          )}
        </select>


        <select
          value={brand}
          onChange={(event) =>
            setBrand(
              event.target.value,
            )
          }
          className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-[#ff6b00]"
        >
          <option value="">
            Toutes marques
          </option>

          {metadata.brands.map(
            (item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ),
          )}
        </select>


        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value,
            )
          }
          className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold outline-none focus:border-[#ff6b00]"
        >
          <option value="">
            Tous statuts
          </option>

          {metadata.product_statuses.map(
            (item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ),
          )}
        </select>
      </div>


      <div className="mt-3 flex min-h-8 flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold text-slate-400">
          {isPending
            ? "Recherche en cours..."
            : "Les résultats se mettent à jour automatiquement."}
        </p>

        {hasFilters && (
          <button
            type="button"
            onClick={
              clearFilters
            }
            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-slate-100 px-3 text-[10px] font-black text-slate-600 transition hover:bg-slate-200"
          >
            <X
              size={13}
            />

            Effacer les filtres
          </button>
        )}
      </div>
    </section>
  );
}
