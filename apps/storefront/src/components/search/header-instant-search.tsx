"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Search,
} from "lucide-react";

import {
  useEffect,
  useRef,
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


interface HeaderInstantSearchProps {
  variant:
    | "desktop"
    | "mobile";
}


export function HeaderInstantSearch({
  variant,
}: HeaderInstantSearchProps) {
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

  const [
    open,
    setOpen,
  ] = useState(false);

  const rootRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const normalized =
    query.trim();


  useEffect(
    () => {
      function onPointerDown(
        event: PointerEvent,
      ) {
        if (
          rootRef.current &&
          !rootRef.current.contains(
            event.target as Node,
          )
        ) {
          setOpen(false);
        }
      }

      document.addEventListener(
        "pointerdown",
        onPointerDown,
      );

      return () => {
        document.removeEventListener(
          "pointerdown",
          onPointerDown,
        );
      };
    },
    [],
  );


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
              const response =
                await fetch(
                  `/api/search?q=${encodeURIComponent(normalized)}`,
                  {
                    cache:
                      "no-store",
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

              setOpen(true);
            } catch (error) {
              if (
                error instanceof DOMException &&
                error.name ===
                  "AbortError"
              ) {
                return;
              }

              setResults([]);
              setTotal(0);
              setOpen(true);
            } finally {
              if (
                !controller.signal.aborted
              ) {
                setLoading(false);
              }
            }
          },
          250,
        );

      return () => {
        window.clearTimeout(
          timer,
        );

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
      setOpen(false);
    }
  }


  const isDesktop =
    variant === "desktop";

  const rootClass =
    isDesktop
      ? "relative hidden flex-1 md:block"
      : "relative px-4 pb-3 md:hidden";

  const fieldClass =
    isDesktop
      ? "flex h-12 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 transition focus-within:border-[#ff6b00] focus-within:bg-white"
      : "flex h-11 items-center rounded-xl border border-slate-200 bg-slate-100 px-3 transition focus-within:border-[#ff6b00] focus-within:bg-white";

  const panelClass =
    isDesktop
      ? "absolute left-0 right-0 top-[calc(100%+8px)] z-[95] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      : "absolute left-4 right-4 top-[calc(100%-4px)] z-[95] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl";


  return (
    <div
      ref={rootRef}
      className={rootClass}
    >
      <form
        action="/recherche"
        method="get"
      >
        <div className={fieldClass}>
          <div
            className={
              isDesktop
                ? "flex items-center pl-4 text-slate-400"
                : "flex shrink-0 items-center text-slate-400"
            }
          >
            <Search
              size={
                isDesktop
                  ? 20
                  : 18
              }
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
            onFocus={() => {
              if (normalized) {
                setOpen(true);
              }
            }}
            placeholder={
              isDesktop
                ? "Rechercher téléphone, ampoule, casque, ventilateur..."
                : "Que recherchez-vous ?"
            }
            autoComplete="off"
            className={
              isDesktop
                ? "min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                : "min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
            }
          />

          {loading ? (
            <span className="mr-2 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-[#ff6b00]" />
          ) : (
            <button
              type="submit"
              className={
                isDesktop
                  ? "bg-[#ff6b00] px-6 text-sm font-bold text-white transition hover:bg-[#e85f00]"
                  : "shrink-0 text-xs font-black text-[#ff6b00]"
              }
            >
              {isDesktop
                ? "Rechercher"
                : "Chercher"}
            </button>
          )}
        </div>
      </form>

      {open && normalized && (
        <div className={panelClass}>
          {loading &&
          results.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm font-semibold text-slate-400">
              Recherche en cours...
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="max-h-[360px] overflow-y-auto p-2">
                {results.map(
                  (product) => {
                    const image =
                      toStorefrontMediaUrl(
                        product.primary_image,
                      );

                    return (
                      <Link
                        key={product.id}
                        href={`/produits/${product.slug}`}
                        onClick={() =>
                          setOpen(false)
                        }
                        className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-slate-50 active:bg-slate-100"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-14 sm:w-14">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-contain p-1.5"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[8px] font-black text-slate-300">
                              SUGU KURA
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[9px] font-black uppercase tracking-wide text-[#0b4da2]">
                            {product.brand?.name ??
                              product.category.name}
                          </p>

                          <p className="mt-0.5 line-clamp-2 text-xs font-black leading-4 text-slate-900 sm:text-sm sm:leading-5">
                            {product.name}
                          </p>

                          <span className="mt-1 block text-xs font-black text-[#ff6b00] sm:text-sm">
                            {formatMoney(
                              product.current_price,
                            )}
                          </span>
                        </div>

                        <ArrowRight
                          size={15}
                          className="shrink-0 text-slate-300"
                        />
                      </Link>
                    );
                  },
                )}
              </div>

              <Link
                href={`/recherche?search=${encodeURIComponent(normalized)}`}
                onClick={() =>
                  setOpen(false)
                }
                className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black text-[#0b4da2]"
              >
                <span>
                  Voir tous les résultats
                  {total > 0
                    ? ` (${total})`
                    : ""}
                </span>

                <ArrowRight
                  size={16}
                />
              </Link>
            </>
          ) : (
            <div className="px-4 py-5 text-center">
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
    </div>
  );
}
