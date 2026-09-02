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


export function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
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

      {/* =========================================
          IMAGE PRODUIT
      ========================================= */}
      <Link
        href={`/produits/${product.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[#f7f8fa]"
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-2.5 transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-xs font-black text-slate-300">
            SUGU KURA
          </div>
        )}


        {/* PROMOTION */}
        {product.has_promotion &&
          product.promotion && (
            <span className="absolute left-2 top-2 max-w-[80%] rounded-md bg-[#ff6b00] px-2 py-1 text-[9px] font-black text-white shadow-sm">
              {
                product
                  .promotion
                  .badge ||
                "PROMO"
              }
            </span>
          )}


        {/* STOCK */}
        {product.available_quantity >
          0 && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-1 text-[9px] font-bold text-emerald-700 shadow-sm">
            <Check
              size={10}
            />

            En stock
          </span>
        )}
      </Link>


      {/* =========================================
          INFORMATIONS
      ========================================= */}
      <div className="flex flex-col p-2.5 sm:p-3">

        {product.brand && (
          <p className="truncate text-[9px] font-black uppercase tracking-wider text-[#0b4da2]">
            {
              product.brand
                .name
            }
          </p>
        )}


        <Link
          href={`/produits/${product.slug}`}
          className="mt-0.5 line-clamp-2 min-h-[36px] text-[13px] font-bold leading-[18px] text-slate-900 transition hover:text-[#0b4da2] sm:text-sm"
        >
          {product.name}
        </Link>


        {product.has_variants && (
          <span className="mt-1.5 w-fit rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-[#0b4da2]">
            Plusieurs options
          </span>
        )}


        {/* =========================================
            PRIX
        ========================================= */}
        <div className="mt-2">

          {product.has_promotion && (
            <div className="text-[10px] font-semibold text-slate-400 line-through sm:text-xs">
              {formatMoney(
                product.normal_price,
              )}
            </div>
          )}


          <div className="text-[15px] font-black leading-tight text-[#ff6b00] sm:text-base">
            {formatMoney(
              product.current_price,
            )}
          </div>


          {/* COMPTE À REBOURS */}
          {product.promotion &&
            product
              .promotion
              .remaining_seconds >
              0 && (
              <div className="mt-1 text-[9px] font-bold text-red-600 sm:text-[10px]">
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


          {/* =========================================
              STOCK + PANIER
          ========================================= */}
          <div className="mt-2 flex min-w-0 items-center justify-between gap-1.5">

            <span className="min-w-0 truncate text-[9px] font-medium text-slate-400 sm:text-[10px]">
              {product.available_quantity >
              0
                ? `${product.available_quantity} disponible(s)`
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
