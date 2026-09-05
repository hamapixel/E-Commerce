"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Heart,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  ProductCardCartButton,
} from "@/components/cart/product-card-cart-button";

import {
  formatMoney,
} from "@/lib/format";

import {
  useFavoritesStore,
} from "@/store/favorites-store";


export function FavoritesPageClient() {
  const items =
    useFavoritesStore(
      (
        state,
      ) => state.items,
    );

  const hasHydrated =
    useFavoritesStore(
      (
        state,
      ) => state.hasHydrated,
    );

  const removeItem =
    useFavoritesStore(
      (
        state,
      ) => state.removeItem,
    );

  const clear =
    useFavoritesStore(
      (
        state,
      ) => state.clear,
    );


  useEffect(
    () => {
      void useFavoritesStore
        .persist
        .rehydrate();
    },
    [],
  );


  if (
    !hasHydrated
  ) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({
          length: 5,
        }).map(
          (
            _,
            index,
          ) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-[20px] bg-slate-100"
            />
          ),
        )}
      </div>
    );
  }


  if (
    items.length === 0
  ) {
    return (
      <section className="rounded-[28px] border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <Heart
            size={28}
          />
        </div>

        <h2 className="mt-5 text-2xl font-black text-slate-950">
          Aucun favori pour le moment
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Touchez le cœur sur un produit pour
          le garder ici et le retrouver rapidement.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white"
        >
          <ShoppingBag
            size={17}
          />

          Découvrir les produits
        </Link>
      </section>
    );
  }


  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">
          {items.length} produit
          {items.length > 1
            ? "s"
            : ""} enregistré
          {items.length > 1
            ? "s"
            : ""}
        </p>

        <button
          type="button"
          onClick={
            clear
          }
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-xs font-black text-red-600"
        >
          <Trash2
            size={15}
          />

          Tout supprimer
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map(
          (
            item,
          ) => (
            <article
              key={
                item.productId
              }
              className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={
                  () =>
                    removeItem(
                      item.productId,
                    )
                }
                aria-label="Retirer des favoris"
                className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-white/95 text-red-500 shadow-sm"
              >
                <Heart
                  size={17}
                  fill="currentColor"
                />
              </button>

              <Link
                href={
                  `/produits/${item.slug}`
                }
                className="relative block aspect-[4/3] bg-[#f7f8fa]"
              >
                {item.image
                  ? (
                    <Image
                      src={
                        item.image
                      }
                      alt={
                        item.name
                      }
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-contain p-3"
                    />
                  )
                  : (
                    <div className="flex h-full items-center justify-center text-xs font-black text-slate-300">
                      SUGU KURA
                    </div>
                  )
                }
              </Link>

              <div className="p-3">
                {item.brandName && (
                  <p className="truncate text-[9px] font-black uppercase tracking-wider text-[#0b4da2]">
                    {item.brandName}
                  </p>
                )}

                <Link
                  href={
                    `/produits/${item.slug}`
                  }
                  className="mt-1 line-clamp-2 min-h-10 text-sm font-black leading-5 text-slate-900"
                >
                  {item.name}
                </Link>

                <div className="mt-2">
                  {item.hasPromotion && (
                    <div className="text-[10px] font-semibold text-slate-400 line-through">
                      {formatMoney(
                        item.normalPrice,
                      )}
                    </div>
                  )}

                  <div className="text-base font-black text-[#ff6b00]">
                    {formatMoney(
                      item.currentPrice,
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold ${
                      item.availableQuantity >
                      0
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {item.availableQuantity >
                    0
                      ? "En stock"
                      : "Rupture"}
                  </span>

                  <ProductCardCartButton
                    productId={
                      item.productId
                    }
                    slug={
                      item.slug
                    }
                    name={
                      item.name
                    }
                    sku={
                      item.sku
                    }
                    image={
                      item.image
                    }
                    currentPrice={
                      item.currentPrice
                    }
                    normalPrice={
                      item.normalPrice
                    }
                    hasPromotion={
                      item.hasPromotion
                    }
                    hasVariants={
                      item.hasVariants
                    }
                    availableQuantity={
                      item.availableQuantity
                    }
                  />
                </div>
              </div>
            </article>
          ),
        )}
      </div>
    </>
  );
}
