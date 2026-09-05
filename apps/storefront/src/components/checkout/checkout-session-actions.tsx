"use client";

import {
  XCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  cancelCheckout,
} from "@/lib/checkout-api";


interface CheckoutSessionActionsProps {
  checkoutId: string;
}


export function CheckoutSessionActions({
  checkoutId,
}: CheckoutSessionActionsProps) {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleCancel() {
    setLoading(true);

    setError("");

    try {
      await cancelCheckout(
        checkoutId,
      );

      router.push(
        "/panier",
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
              "Impossible d'annuler. Réessayez."
            ),
      );
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={
          handleCancel
        }
        disabled={
          loading
        }
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        <XCircle
          size={16}
        />

        {loading
          ? "Annulation..."
          : "Annuler et retourner au panier"}
      </button>

      {error && (
        <p className="mt-2 text-xs font-bold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}