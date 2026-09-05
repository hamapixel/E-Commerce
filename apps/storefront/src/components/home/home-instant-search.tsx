"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Search,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  formatMoney,
} from "@/lib/format";

import {
  toStorefrontMediaUrl,
} from "@/lib/storefront-media";

import type {
  PaginatedResponse,
  Product,
} from "@/types/api";


export function HomeInstantSearch() {
  const [
    query,
    setQuery,
  ] = useState("");

  const [
    results,
    setResults,
  ] = useState<Product[]>([]);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const normalized =
    query.trim();


  useEffect(
    () => {
      if (!normalized) {
        return;
      }

      const controller =
        new AbortController();

      const timer =
        window.setTimeout(
          async () => {
            setLoading(true);

            try {
              const response = await fetch(
                `/api/search?q=${encodeURIComponent(normalized)}`,
                {
                  cache: "no-store",
                  signal:
                    controller.signal,
                },
              );

              if (!response.ok) {
                throw new Error(
                  "search_failed",
                );
              }

              const data =
                await response.json() as PaginatedResponse<Product>;

              setResults(
                data.results ?? [],
              );

              setTotal(
                data.count ?? 0,
              );
            } catch (error) {
              if (
                error instanceof DOMException &&
                error.name === "AbortError"
              ) {
                return;
              }

              setResults([]);
              setTotal(0);
            } finally {
              if (!controller.signal.aborted) {
                setLoading(false);
              }
            }
          },
          250,
        );

      return () => {
        window.clearTimeout(timer);
        controller.abort();
      };
    },
    [normalized],
  );


  function handleChange(
    value: string,
  ) {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setTotal(0);
      setLoading(false);
    }
  }


  const showPanel =
    Boolean(normalized) &&
    (
      loading ||
      results.length > 0 ||
      total === 0
    );


  return (
    <section className="relative z-30 mt-4">
      <form
        action="/recherche"
        method="get"
        className="relative"
      >
        <div className="flex min-h-14 items-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm transition focus-within:border-[#ff6b00] focus-within:shadow-md sm:min-h-16">
          <div className="flex items-center pl-4 text-[#0b4da2] sm:pl-5">
            <Search
              size={21}
            />
          </div>

          <input
            type="search"
            name="search"
            value={query}
            onChange={
              (event) =>
                handleChange(
                  event.target.value,
                )
            }
            placeholder="Recherchez un produit, une marque, une catégorie..."
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 sm:text-base"
          />

          {loading ? (
            <div className="mr-4 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-[#ff6b00]" />
          ) : (
            <button
              type="submit"
              className="mr-2 hidden h-11 shrink-0 items-center rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white transition hover:bg-[#e85f00] sm:flex"
            >
              Rechercher
            </button>
          )}
        </div>
      </form>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {loading &&
          results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm font-semibold text-slate-400">
              Recherche en cours...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="max-h-[420px] overflow-y-auto p-2">
                {results.map(
                  (product) => {
                    const image =
                      toStorefrontMediaUrl(
                        product.primary_image,
                      );

                    return (
                      <Link
                        key={product.id}
                        href={
                          `/produits/${product.slug}`
                        }
                        className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50 active:bg-slate-100"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-16 sm:w-16">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="64px"
                              className="object-contain p-1.5"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[9px] font-black text-slate-300">
                              SUGU KURA
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-black uppercase tracking-wide text-[#0b4da2]">
                            {product.brand?.name ??
                              product.category.name}
                          </p>

                          <p className="mt-0.5 line-clamp-2 text-sm font-black leading-5 text-slate-900">
                            {product.name}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-black text-[#ff6b00]">
                              {formatMoney(
                                product.current_price,
                              )}
                            </span>

                            {product.has_promotion && (
                              <span className="text-[10px] font-semibold text-slate-400 line-through">
                                {formatMoney(
                                  product.normal_price,
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight
                          size={16}
                          className="shrink-0 text-slate-300"
                        />
                      </Link>
                    );
                  },
                )}
              </div>

              <Link
                href={
                  `/recherche?search=${encodeURIComponent(normalized)}`
                }
                className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black text-[#0b4da2] sm:text-sm"
              >
                <span>
                  Voir tous les résultats
                  {total > 0
                    ? ` (${total})`
                    : ""}
                </span>

                <ArrowRight
                  size={17}
                />
              </Link>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-black text-slate-700">
                Aucun produit trouvé
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Essayez un autre nom, SKU, marque ou catégorie.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
