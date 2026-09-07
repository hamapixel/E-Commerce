import {
  BadgePercent,
} from "lucide-react";

import {
  ProductPromotionForm,
} from "@/components/catalogue/product-promotion-form";

import {
  ownerFetch,
} from "@/lib/backend";


interface OwnerProductMini {
  id: number;
  name: string;
  base_price: string;
}


interface OwnerProductPromotion {
  enabled: boolean;
  price: string | null;
  start_at: string | null;
  end_at: string | null;
  is_current: boolean;
  percentage: number | null;
}


function toDateTimeLocal(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
}


function defaultDate(
  daysFromNow: number,
) {
  const date = new Date();

  date.setDate(
    date.getDate() + daysFromNow,
  );

  return date
    .toISOString()
    .slice(0, 16);
}


export async function ProductPromotionPanel({
  productId,
}: {
  productId: number;
}) {
  const [
    product,
    promotion,
  ] = await Promise.all([
    ownerFetch<OwnerProductMini>(
      `/owner/catalog/products/${productId}/`,
    ),

    ownerFetch<OwnerProductPromotion>(
      `/owner/catalog/products/${productId}/promotion/`,
    ),
  ]);

  const startValue =
    toDateTimeLocal(
      promotion.start_at,
    ) || defaultDate(0);

  const endValue =
    toDateTimeLocal(
      promotion.end_at,
    ) || defaultDate(7);

  const statusLabel =
    promotion.enabled
      ? (
          promotion.is_current
            ? "EN COURS"
            : "PLANIFIÉE"
        )
      : "DÉSACTIVÉE";

  const statusClass =
    promotion.enabled
      ? (
          promotion.is_current
            ? "bg-emerald-50 text-emerald-700"
            : "bg-blue-50 text-[#0b4da2]"
        )
      : "bg-slate-100 text-slate-500";

  return (
    <section className="mb-7 overflow-hidden rounded-[24px] border border-orange-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-orange-100 bg-orange-50/60 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ff6b00] text-white">
            <BadgePercent
              size={21}
            />
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff6b00]">
              Vente promotionnelle
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Promotion rapide
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {product.name}
            </p>
          </div>
        </div>

        <span className={`rounded-full px-3 py-1.5 text-[10px] font-black ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <ProductPromotionForm
        productId={productId}
        basePrice={product.base_price}
        promotion={promotion}
        startValue={startValue}
        endValue={endValue}
      />
    </section>
  );
}
