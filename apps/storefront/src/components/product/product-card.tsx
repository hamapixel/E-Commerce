"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Check,
} from "lucide-react";

import {
  ProductCardCartButton,
} from "@/components/cart/product-card-cart-button";

import {
  FavoriteButton,
} from "@/components/favorites/favorite-button";

import {
  Countdown,
} from "@/components/home/countdown";

import {
  formatMoney,
} from "@/lib/format";

import type {
  Product,
} from "@/types/api";


interface ProductCardProps {
  product: Product;
}


function getDiscountPercent(
  normalPrice: string,
  currentPrice: string,
) {
  const normal = Number(
    normalPrice,
  );
  const current = Number(
    currentPrice,
  );

  if (
    !Number.isFinite(normal) ||
    !Number.isFinite(current) ||
    normal <= 0 ||
    current >= normal
  ) {
    return null;
  }

  return Math.max(
    1,
    Math.round(
      ((normal - current) / normal) * 100,
    ),
  );
}


export function ProductCard({
  product,
}: ProductCardProps) {
  const discountPercent =
    getDiscountPercent(
      product.normal_price,
      product.current_price,
    );

  const hasVisibleDiscount =
    discountPercent !== null;

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:rounded-[18px]">
      <FavoriteButton
        variant="overlay"
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

      <Link
        href={`/produits/${product.slug}`}
        className="relative block aspect-[16/11] w-full overflow-hidden bg-[#f7f8fa] sm:aspect-[4/3]"
      >
        {product.primary_image ? (
          <Image
            src={
              product.primary_image
            }
            alt={
              product.name
            }
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 18vw"
            className="object-contain p-1.5 transition duration-300 group-hover:scale-[1.03] sm:p-2.5"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-[10px] font-black text-slate-300 sm:p-3 sm:text-xs">
            SUGU KURA
          </div>
        )}

        <div className="absolute left-1.5 top-1.5 z-10 flex max-w-[76%] flex-col items-start gap-1 sm:left-2 sm:top-2">
          {product.is_featured && (
            <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm sm:px-2 sm:py-1 sm:text-[9px]">
              NOUVEAU
            </span>
          )}

          {(hasVisibleDiscount ||
            product.has_promotion) && (
            <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm sm:px-2 sm:py-1 sm:text-[9px]">
              {hasVisibleDiscount
                ? `-${discountPercent}%`
                : product.promotion?.badge || "PROMO"}
            </span>
          )}
        </div>

        {product.available_quantity >
          0 && (
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-md bg-white/95 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 shadow-sm sm:bottom-2 sm:left-2 sm:gap-1 sm:py-1 sm:text-[9px]">
            <Check
              size={9}
            />

            En stock
          </span>
        )}
      </Link>

      <div className="flex flex-col p-2 sm:p-3">
        {product.brand && (
          <p className="truncate text-[8px] font-black uppercase tracking-wider text-[#0b4da2] sm:text-[9px]">
            {
              product.brand
                .name
            }
          </p>
        )}

        <Link
          href={`/produits/${product.slug}`}
          className="mt-0.5 line-clamp-2 min-h-[30px] text-[12px] font-bold leading-[15px] text-slate-900 transition hover:text-[#0b4da2] sm:min-h-[36px] sm:text-sm sm:leading-[18px]"
        >
          {product.name}
        </Link>

        {product.has_variants && (
          <span className="mt-1 w-fit rounded-md bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-[#0b4da2] sm:mt-1.5 sm:text-[9px]">
            Plusieurs options
          </span>
        )}

        <div className="mt-1.5 sm:mt-2">
          {(hasVisibleDiscount ||
            product.has_promotion) && (
            <div className="text-[9px] font-semibold text-slate-400 line-through sm:text-xs">
              {formatMoney(
                product.normal_price,
              )}
            </div>
          )}

          <div className="text-[14px] font-black leading-tight text-[#ff6b00] sm:text-base">
            {formatMoney(
              product.current_price,
            )}
          </div>

          {product.promotion &&
            product
              .promotion
              .remaining_seconds >
              0 && (
              <div className="mt-0.5 truncate text-[8px] font-bold text-red-600 sm:mt-1 sm:text-[10px]">
                Fin dans{" "}

                <Countdown
                  seconds={
                    product
                      .promotion
                      .remaining_seconds
                  }
                />
              </div>
            )}

          <div className="mt-1.5 flex min-w-0 items-center justify-between gap-1 sm:mt-2 sm:gap-1.5">
            <span className="min-w-0 truncate text-[8px] font-medium text-slate-400 sm:text-[10px]">
              {product.available_quantity >
              0
                ? `${product.available_quantity} dispo.`
                : "Rupture"}
            </span>

            <div className="shrink-0">
              <ProductCardCartButton
                productId={
                  product.id
                }
                slug={
                  product.slug
                }
                name={
                  product.name
                }
                sku={
                  product.sku
                }
                image={
                  product.primary_image
                }
                currentPrice={
                  product.current_price
                }
                normalPrice={
                  product.normal_price
                }
                hasPromotion={
                  product.has_promotion
                }
                hasVariants={
                  product.has_variants
                }
                availableQuantity={
                  product.available_quantity
                }
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
