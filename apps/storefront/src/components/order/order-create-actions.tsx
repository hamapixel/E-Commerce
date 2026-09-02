"use client";

import {
  Banknote,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  createOrder,
} from "@/lib/order-api";

import {
  useCartStore,
} from "@/store/cart-store";


interface OrderCreateActionsProps {
  checkoutId: string;

  deliveryMethod:
    | "DELIVERY"
    | "PICKUP";
}


export function OrderCreateActions({
  checkoutId,
  deliveryMethod,
}: OrderCreateActionsProps) {
  const router =
    useRouter();

  const clearCart =
    useCartStore(
      (state) =>
        state.clearCart,
    );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const paymentMethod =
    deliveryMethod ===
    "DELIVERY"
      ? "CASH_ON_DELIVERY"
      : "PAY_AT_PICKUP";

  const paymentLabel =
    deliveryMethod ===
    "DELIVERY"
      ? "Paiement à la livraison"
      : "Paiement au retrait";

  async function confirmOrder() {
    setLoading(true);

    setError("");

    try {
      const order =
        await createOrder(
          checkoutId,
          paymentMethod,
        );

      clearCart();

      router.push(
        `/commande/${order.id}`,
      );

      router.refresh();
    } catch (
      caughtError
    ) {
      setLoading(false);

      setError(
        caughtError
          instanceof Error
          ? caughtError.message
          : (
              "Impossible de confirmer "
              + "la commande."
            ),
      );
    }
  }

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Banknote
            size={22}
            className="shrink-0 text-[#0b4da2]"
          />

          <div>
            <p className="text-sm font-black text-slate-900">
              {paymentLabel}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Aucun paiement en ligne
              n&apos;est prélevé maintenant.
              Le paiement restera enregistré
              comme en attente jusqu&apos;à
              son règlement.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={
          confirmOrder
        }
        disabled={
          loading
        }
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b4da2] text-sm font-black text-white transition hover:bg-[#083b7f] disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? (
          <>
            <LoaderCircle
              size={19}
              className="animate-spin"
            />

            Création de la commande...
          </>
        ) : (
          <>
            <CheckCircle2
              size={19}
            />

            Confirmer ma commande
          </>
        )}
      </button>
    </div>
  );
}