import {
  BadgePercent,
  CalendarClock,
  Tag,
} from "lucide-react";

import {
  updateProductPromotionAction,
} from "@/actions/product-promotions";

import {
  ownerFetch,
} from "@/lib/backend";

import {
  formatMoney,
} from "@/lib/format";


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

  const updateAction =
    updateProductPromotionAction.bind(
      null,
      productId,
    );

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

      <form
        action={updateAction}
        className="p-5 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-700">
              <Tag size={14} />
              Prix normal
            </span>

            <div className="mt-2 flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 font-black text-slate-700">
              {formatMoney(
                product.base_price,
              )}
            </div>

            <span className="mt-1.5 block text-[10px] text-slate-400">
              Ancien prix affiché barré.
            </span>
          </label>

          <label>
            <span className="text-xs font-black text-slate-700">
              Nouveau prix promo
            </span>

            <input
              name="promotion_price"
              type="number"
              min="1"
              step="1"
              defaultValue={
                promotion.price ?? ""
              }
              placeholder="Ex. 120000"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-bold outline-none focus:border-[#ff6b00]"
            />

            <span className="mt-1.5 block text-[10px] text-slate-400">
              Doit être inférieur au prix normal.
            </span>
          </label>

          <label>
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-700">
              <CalendarClock size={14} />
              Début
            </span>

            <input
              name="promotion_start_at"
              type="datetime-local"
              defaultValue={startValue}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label>
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-700">
              <CalendarClock size={14} />
              Fin
            </span>

            <input
              name="promotion_end_at"
              type="datetime-local"
              defaultValue={endValue}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-[#ff6b00]"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              name="promotion_enabled"
              type="checkbox"
              defaultChecked={
                promotion.enabled
              }
              className="h-5 w-5 accent-[#ff6b00]"
            />

            <div>
              <span className="block text-sm font-black text-slate-900">
                Activer la promotion
              </span>

              <span className="text-[10px] text-slate-500">
                Décochez puis enregistrez pour remettre le prix normal.
              </span>
            </div>
          </label>

          <div className="flex items-center gap-3">
            {promotion.percentage !== null && (
              <span className="rounded-lg bg-red-500 px-3 py-2 text-xs font-black text-white">
                -{promotion.percentage}%
              </span>
            )}

            <button
              type="submit"
              className="min-h-11 rounded-xl bg-[#ff6b00] px-5 text-xs font-black text-white transition hover:bg-[#e86100]"
            >
              Enregistrer la promotion
            </button>
          </div>
        </div>

        <p className="mt-3 text-[10px] leading-5 text-slate-500">
          SUGU KURA calcule automatiquement le pourcentage à partir du prix normal et du nouveau prix. À la date de fin, le prix normal redevient automatiquement actif.
        </p>
      </form>
    </section>
  );
}
