"use client";

import {
  useActionState,
} from "react";

import {
  CalendarClock,
  Tag,
} from "lucide-react";

import {
  updateProductPromotionAction,
  type ProductPromotionActionState,
} from "@/actions/product-promotions";

import {
  formatMoney,
} from "@/lib/format";


interface ProductPromotionFormProps {
  productId: number;
  basePrice: string;
  promotion: {
    enabled: boolean;
    price: string | null;
    start_at: string | null;
    end_at: string | null;
    percentage: number | null;
  };
  startValue: string;
  endValue: string;
}


const INITIAL_STATE:
  ProductPromotionActionState = {
    error: "",
    success: "",
  };


export function ProductPromotionForm({
  productId,
  basePrice,
  promotion,
  startValue,
  endValue,
}: ProductPromotionFormProps) {
  const action =
    updateProductPromotionAction.bind(
      null,
      productId,
    );

  const [
    state,
    formAction,
    isPending,
  ] = useActionState(
    action,
    INITIAL_STATE,
  );

  const normal =
    Number(basePrice);

  const maxPromoPrice =
    Number.isFinite(normal)
      && normal > 1
      ? Math.floor(normal - 1)
      : undefined;

  return (
    <form
      action={formAction}
      className="p-5 sm:p-6"
    >
      <input
        type="hidden"
        name="promotion_normal_price"
        value={basePrice}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label>
          <span className="flex items-center gap-1.5 text-xs font-black text-slate-700">
            <Tag size={14} />
            Prix normal
          </span>

          <div className="mt-2 flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 font-black text-slate-700">
            {formatMoney(
              basePrice,
            )}
          </div>

          <span className="mt-1.5 block text-[10px] text-slate-400">
            Ancien prix affiché barré pendant la promotion.
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
            max={maxPromoPrice}
            step="1"
            defaultValue={
              promotion.price ?? ""
            }
            placeholder="Ex. 120000"
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 font-bold outline-none focus:border-[#ff6b00]"
          />

          <span className="mt-1.5 block text-[10px] text-slate-400">
            Le nouveau prix doit être inférieur au prix normal.
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

      {state.error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
          {state.success}
        </div>
      )}

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
            disabled={isPending}
            className="min-h-11 rounded-xl bg-[#ff6b00] px-5 text-xs font-black text-white transition hover:bg-[#e86100] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending
              ? "Enregistrement..."
              : "Enregistrer la promotion"}
          </button>
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-5 text-slate-500">
        SUGU KURA calcule automatiquement le pourcentage à partir du prix normal et du nouveau prix. À la date de fin, le prix normal redevient automatiquement actif.
      </p>
    </form>
  );
}
