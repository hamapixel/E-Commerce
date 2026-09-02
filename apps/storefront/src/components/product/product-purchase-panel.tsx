"use client";

import {
  CheckCircle2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  FavoriteButton,
} from "@/components/favorites/favorite-button";

import {
  Countdown,
} from "@/components/home/countdown";

import {
  formatMoney,
} from "@/lib/format";

import {
  useCartStore,
} from "@/store/cart-store";

import type {
  ProductDetail,
} from "@/types/api";


interface ProductPurchasePanelProps {
  product: ProductDetail;
}


export function ProductPurchasePanel({
  product,
}: ProductPurchasePanelProps) {
  const availableVariants =
    product.variants.filter(
      (variant) =>
        variant.is_active &&
        variant.available_quantity > 0,
    );

  const initialVariantId =
    availableVariants.length === 1
      ? availableVariants[0].id
      : null;

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState<number | null>(
    initialVariantId,
  );

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    message,
    setMessage,
  ] = useState("");

  const addItem =
    useCartStore(
      (state) =>
        state.addItem,
    );

  const selectedVariant =
    product.variants.find(
      (variant) =>
        variant.id ===
        selectedVariantId,
    ) ?? null;

  const hasVariants =
    product.variants.length > 0;

  const activePrice =
    selectedVariant
      ? selectedVariant.current_price
      : product.current_price;

  const activeNormalPrice =
    selectedVariant
      ? selectedVariant.effective_price
      : product.normal_price;

  const activeHasPromotion =
    selectedVariant
      ? selectedVariant.has_promotion
      : product.has_promotion;

  const activeStock =
    selectedVariant
      ? selectedVariant.available_quantity
      : hasVariants
        ? 0
        : product.available_quantity;

  const canBuy =
    activeStock > 0 &&
    (
      !hasVariants ||
      selectedVariant !== null
    );

  const variantLabel =
    selectedVariant
      ? selectedVariant.attributes.length > 0
        ? selectedVariant.attributes
            .map(
              (attribute) =>
                `${attribute.attribute}: ${attribute.value}`,
            )
            .join(" • ")
        : "Option standard"
      : "";

  function selectVariant(
    variantId: number,
  ) {
    setSelectedVariantId(
      variantId,
    );

    setQuantity(1);

    setMessage("");
  }

  function increment() {
    if (
      quantity <
      activeStock
    ) {
      setQuantity(
        quantity + 1,
      );
    }
  }

  function decrement() {
    if (quantity > 1) {
      setQuantity(
        quantity - 1,
      );
    }
  }

  function handleAdd() {
    if (
      hasVariants &&
      !selectedVariant
    ) {
      setMessage(
        "Choisissez d'abord une variante.",
      );

      return;
    }

    const result =
      addItem(
        {
          productId:
            product.id,

          variantId:
            selectedVariant
              ?.id ??
            null,

          slug:
            product.slug,

          name:
            product.name,

          sku:
            selectedVariant
              ?.sku ??
            product.sku,

          image:
            selectedVariant
              ?.image ??
            product.primary_image,

          variantLabel,

          unitPrice:
            Number(
              activePrice,
            ),

          normalPrice:
            Number(
              activeNormalPrice,
            ),

          hasPromotion:
            activeHasPromotion,

          availableQuantity:
            activeStock,
        },

        quantity,
      );

    if (
      result ===
      "out_of_stock"
    ) {
      setMessage(
        "Ce produit est en rupture de stock.",
      );

      return;
    }

    if (
      result ===
      "max_stock"
    ) {
      setMessage(
        "Vous avez déjà atteint la quantité disponible en stock.",
      );

      return;
    }

    setMessage(
      "Produit ajouté au panier ✓",
    );
  }

  return (
    <>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        {activeHasPromotion && (
          <div className="text-base font-bold text-slate-400 line-through">
            {formatMoney(
              activeNormalPrice,
            )}
          </div>
        )}

        <div className="text-3xl font-black text-[#ff6b00] sm:text-4xl">
          {formatMoney(
            activePrice,
          )}
        </div>

        {product.promotion && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-black text-[#d95700]">
              {
                product
                  .promotion
                  .badge
              }
            </span>

            {product
              .promotion
              .remaining_seconds >
              0 && (
              <span className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                Fin dans{" "}

                <Countdown
                  seconds={
                    product
                      .promotion
                      .remaining_seconds
                  }
                />
              </span>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 text-sm font-bold">
          {activeStock > 0 ? (
            <>
              <CheckCircle2
                size={18}
                className="text-emerald-600"
              />

              <span className="text-emerald-700">
                En stock —{" "}
                {activeStock}{" "}
                disponible(s)
              </span>
            </>
          ) : (
            <>
              <Package
                size={18}
              />

              <span className="text-red-600">
                Rupture de stock
              </span>
            </>
          )}
        </div>
      </div>

      {hasVariants && (
        <section className="mt-6">
          <h2 className="text-sm font-black text-slate-900">
            {product.variants.length === 1
              ? "Option du produit"
              : "Choisissez une variante"}
          </h2>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {product.variants.map(
              (variant) => {
                const selected =
                  selectedVariantId ===
                  variant.id;

                const hasAttributes =
                  variant.attributes.length >
                  0;

                return (
                  <button
                    key={
                      variant.id
                    }
                    type="button"
                    disabled={
                      variant.available_quantity <=
                      0
                    }
                    onClick={() =>
                      selectVariant(
                        variant.id,
                      )
                    }
                    className={`rounded-xl border-2 p-3 text-left transition ${
                      selected
                        ? "border-[#ff6b00] bg-orange-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-blue-300"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {hasAttributes ? (
                      <div className="flex flex-wrap gap-1.5">
                        {variant.attributes.map(
                          (
                            attribute,
                          ) => (
                            <span
                              key={`${variant.id}-${attribute.attribute_slug}`}
                              className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700"
                            >
                              {
                                attribute.attribute
                              }
                              :{" "}
                              {
                                attribute.value
                              }
                            </span>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            selected
                              ? "border-[#ff6b00] bg-[#ff6b00]"
                              : "border-slate-300"
                          }`}
                        >
                          {selected && (
                            <span className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </span>

                        <span className="text-sm font-black text-slate-800">
                          Option standard
                        </span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-[#ff6b00]">
                        {formatMoney(
                          variant.current_price,
                        )}
                      </span>

                      <span
                        className={`text-[10px] font-bold ${
                          variant.available_quantity >
                          0
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {
                          variant.available_quantity
                        }{" "}
                        dispo.
                      </span>
                    </div>
                  </button>
                );
              },
            )}
          </div>

          {availableVariants.length ===
            1 && (
            <p className="mt-2 text-xs font-semibold text-emerald-600">
              ✓ Option sélectionnée automatiquement
            </p>
          )}
        </section>
      )}

      <section className="mt-6">
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">
          Quantité
        </p>

        <div className="flex h-12 w-fit items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={
              decrement
            }
            disabled={
              quantity <= 1
            }
            className="flex h-full w-12 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:text-slate-300"
            aria-label="Diminuer"
          >
            <Minus size={17} />
          </button>

          <span className="flex h-full min-w-14 items-center justify-center border-x border-slate-200 text-sm font-black">
            {quantity}
          </span>

          <button
            type="button"
            onClick={
              increment
            }
            disabled={
              quantity >=
              activeStock
            }
            className="flex h-full w-12 items-center justify-center text-slate-600 transition hover:bg-slate-50 disabled:text-slate-300"
            aria-label="Augmenter"
          >
            <Plus size={17} />
          </button>
        </div>
      </section>

      <FavoriteButton
        variant="wide"
        className="mt-5 sm:max-w-md"
        item={{
          productId:
            product.id,
          slug:
            product.slug,
          name:
            product.name,
          sku:
            product.sku,
          image:
            product.primary_image,
          currentPrice:
            product.current_price,
          normalPrice:
            product.normal_price,
          hasPromotion:
            product.has_promotion,
          hasVariants:
            product.has_variants,
          availableQuantity:
            product.available_quantity,
          brandName:
            product.brand
              ?.name ??
            "",
        }}
      />

      <button
        type="button"
        onClick={
          handleAdd
        }
        disabled={
          !canBuy
        }
        className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6b00] text-base font-black text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#ea6100] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:max-w-md"
      >
        <ShoppingCart
          size={20}
        />

        {hasVariants &&
        !selectedVariant
          ? "Choisir une variante"
          : "Ajouter au panier"}
      </button>

      {message && (
        <p
          className={`mt-3 text-sm font-bold ${
            message.includes(
              "✓",
            )
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <p className="mt-3 text-xs leading-5 text-slate-400">
        La quantité ne peut pas dépasser
        le stock actuellement disponible.
      </p>
    </>
  );
}
