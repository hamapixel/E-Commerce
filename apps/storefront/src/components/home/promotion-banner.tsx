import Link from "next/link";

import {
  ArrowRight,
  BadgePercent,
} from "lucide-react";

import type {
  Promotion,
} from "@/types/api";


interface PromotionBannerProps {
  promotions: Promotion[];
}


export function PromotionBanner({
  promotions,
}: PromotionBannerProps) {
  if (!promotions.length) {
    return null;
  }

  const firstPromotion =
    promotions[0];

  return (
    <Link
      href="/promotions"
      className="mt-4 block overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#ff8a2a] text-white shadow-lg shadow-orange-100 transition hover:shadow-xl"
    >
      <div className="flex min-w-0 flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <BadgePercent
              size={20}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-50 sm:text-xs sm:tracking-wider">
              Promotions en cours
            </p>

            <p className="mt-0.5 line-clamp-2 break-words text-xs font-black leading-5 sm:text-sm">
              {firstPromotion.name}
            </p>

            {promotions.length > 1 && (
              <p className="mt-1 text-[10px] font-bold text-orange-100 sm:text-xs">
                + {promotions.length - 1} autre
                {promotions.length - 1 > 1
                  ? "s"
                  : ""}{" "}
                promotion
                {promotions.length - 1 > 1
                  ? "s"
                  : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-2 rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur transition hover:bg-white/20 sm:ml-auto sm:w-auto sm:shrink-0">
          <span className="text-xs font-black sm:whitespace-nowrap">
            Voir tous les produits en promo
          </span>

          <ArrowRight
            size={16}
            className="shrink-0"
          />
        </div>
      </div>
    </Link>
  );
}
