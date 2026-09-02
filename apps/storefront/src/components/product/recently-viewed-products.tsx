"use client";

import {
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  History,
  Trash2,
} from "lucide-react";

import {
  ProductCard,
} from "@/components/product/product-card";

import type {
  Product,
  ProductDetail,
} from "@/types/api";


const STORAGE_KEY =
  "sugu-kura-recently-viewed-v1";

const MAX_STORED_PRODUCTS = 12;
const MAX_VISIBLE_PRODUCTS = 5;

const listeners =
  new Set<() => void>();


interface RecentlyViewedProductsProps {
  currentProduct?: ProductDetail | null;
  className?: string;
}


function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}


function subscribe(
  listener: () => void,
) {
  listeners.add(listener);

  const handleStorage = (
    event: StorageEvent,
  ) => {
    if (
      event.key === STORAGE_KEY
      || event.key === null
    ) {
      listener();
    }
  };

  window.addEventListener(
    "storage",
    handleStorage,
  );

  return () => {
    listeners.delete(listener);

    window.removeEventListener(
      "storage",
      handleStorage,
    );
  };
}


function getSnapshot() {
  try {
    return (
      window.localStorage.getItem(
        STORAGE_KEY,
      ) ?? ""
    );
  } catch {
    return "";
  }
}


function getServerSnapshot() {
  return "";
}


function isProduct(
  value: unknown,
): value is Product {
  if (
    !value
    || typeof value !== "object"
  ) {
    return false;
  }

  const item =
    value as Partial<Product>;

  return (
    typeof item.id === "number"
    && typeof item.slug === "string"
    && typeof item.name === "string"
    && typeof item.sku === "string"
    && typeof item.current_price === "string"
    && typeof item.normal_price === "string"
    && typeof item.available_quantity === "number"
  );
}


function parseProducts(
  raw: string,
): Product[] {
  if (!raw) {
    return [];
  }

  try {
    const value: unknown =
      JSON.parse(raw);

    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .filter(isProduct)
      .slice(
        0,
        MAX_STORED_PRODUCTS,
      );
  } catch {
    return [];
  }
}


function toProductSnapshot(
  product: ProductDetail,
): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    category: product.category,
    brand: product.brand,
    short_description:
      product.short_description,
    primary_image:
      product.primary_image,
    normal_price:
      product.normal_price,
    current_price:
      product.current_price,
    has_promotion:
      product.has_promotion,
    promotion:
      product.promotion,
    available_quantity:
      product.available_quantity,
    has_variants:
      product.has_variants,
    is_featured:
      product.is_featured,
    created_at:
      product.created_at,
  };
}


function saveProducts(
  products: Product[],
) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        products.slice(
          0,
          MAX_STORED_PRODUCTS,
        ),
      ),
    );

    emitChange();
  } catch {
    // Le stockage local peut être désactivé
    // par certains navigateurs. Dans ce cas,
    // le catalogue continue simplement à fonctionner.
  }
}


export function RecentlyViewedProducts({
  currentProduct = null,
  className = "",
}: RecentlyViewedProductsProps) {
  const rawSnapshot =
    useSyncExternalStore(
      subscribe,
      getSnapshot,
      getServerSnapshot,
    );

  const storedProducts =
    useMemo(
      () =>
        parseProducts(
          rawSnapshot,
        ),
      [rawSnapshot],
    );

  useEffect(
    () => {
      if (!currentProduct) {
        return;
      }

      const current =
        toProductSnapshot(
          currentProduct,
        );

      const existing =
        parseProducts(
          getSnapshot(),
        );

      const next = [
        current,
        ...existing.filter(
          (item) =>
            item.id !== current.id
            && item.slug !== current.slug,
        ),
      ].slice(
        0,
        MAX_STORED_PRODUCTS,
      );

      saveProducts(next);
    },
    [currentProduct],
  );

  const visibleProducts =
    storedProducts
      .filter(
        (item) =>
          !currentProduct
          || (
            item.id !== currentProduct.id
            && item.slug !== currentProduct.slug
          ),
      )
      .slice(
        0,
        MAX_VISIBLE_PRODUCTS,
      );

  if (!visibleProducts.length) {
    return null;
  }

  const clearHistory = () => {
    try {
      window.localStorage.removeItem(
        STORAGE_KEY,
      );

      emitChange();
    } catch {
      // Aucun blocage pour le reste du site.
    }
  };

  return (
    <section
      className={`mt-12 border-t border-slate-200 pt-10 ${className}`}
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#0b4da2]">
            <History
              size={15}
            />

            Votre historique
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Récemment consultés
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Retrouvez rapidement les derniers produits que vous avez regardés sur SUGU KURA.
          </p>
        </div>

        <button
          type="button"
          onClick={
            clearHistory
          }
          className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-500 transition hover:border-red-200 hover:text-red-600 sm:inline-flex"
        >
          <Trash2
            size={14}
          />

          Effacer
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleProducts.map(
          (product) => (
            <ProductCard
              key={
                product.id
              }
              product={
                product
              }
            />
          ),
        )}
      </div>

      <button
        type="button"
        onClick={
          clearHistory
        }
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-500 sm:hidden"
      >
        <Trash2
          size={14}
        />

        Effacer l&apos;historique
      </button>
    </section>
  );
}
