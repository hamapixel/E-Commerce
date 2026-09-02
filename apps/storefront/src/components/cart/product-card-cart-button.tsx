"use client";

import Link from "next/link";

import {
  Check,
  ShoppingCart,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useCartStore,
} from "@/store/cart-store";


interface ProductCardCartButtonProps {
  productId: number;

  slug: string;

  name: string;

  sku: string;

  image: string | null;

  currentPrice: string;

  normalPrice: string;

  hasPromotion: boolean;

  hasVariants: boolean;

  availableQuantity: number;
}


export function ProductCardCartButton({
  productId,
  slug,
  name,
  sku,
  image,
  currentPrice,
  normalPrice,
  hasPromotion,
  hasVariants,
  availableQuantity,
}: ProductCardCartButtonProps) {
  const addItem =
    useCartStore(
      (
        state,
      ) => state.addItem,
    );

  const [
    added,
    setAdded,
  ] = useState(false);

  if (hasVariants) {
    return (
      <Link
        href={`/produits/${slug}`}
        aria-label="Choisir les options"
        title="Choisir une variante"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b4da2] text-white transition hover:bg-[#083b7f]"
      >
        <ShoppingCart
          size={17}
        />
      </Link>
    );
  }

  function handleAdd() {
    const result =
      addItem({
        productId,

        variantId: null,

        slug,

        name,

        sku,

        image,

        unitPrice:
          Number(
            currentPrice,
          ),

        normalPrice:
          Number(
            normalPrice,
          ),

        hasPromotion,

        availableQuantity,
      });

    if (
      result === "added"
    ) {
      setAdded(true);

      window.setTimeout(
        () => {
          setAdded(false);
        },
        1200,
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={
        availableQuantity <= 0
      }
      aria-label="Ajouter au panier"
      title={
        availableQuantity > 0
          ? "Ajouter au panier"
          : "Rupture de stock"
      }
      className={`flex h-9 w-9 items-center justify-center rounded-xl text-white transition disabled:cursor-not-allowed disabled:bg-slate-300 ${
        added
          ? "bg-emerald-600"
          : "bg-[#0b4da2] hover:bg-[#083b7f]"
      }`}
    >
      {added ? (
        <Check size={17} />
      ) : (
        <ShoppingCart
          size={17}
        />
      )}
    </button>
  );
}