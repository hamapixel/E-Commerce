"use client";

import {
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  saveRecentOrder,
} from "@/lib/recent-orders";

import type {
  Order,
} from "@/types/order";


export function OrderTrackingForm() {
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


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form =
      new FormData(
        event.currentTarget,
      );

    const orderNumber =
      String(
        form.get(
          "order_number",
        ) ?? "",
      ).trim();

    const phone =
      String(
        form.get(
          "customer_phone",
        ) ?? "",
      ).trim();

    if (
      !orderNumber
      || !phone
    ) {
      setError(
        "Renseignez le numéro de commande et votre téléphone.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/orders/track",
        {
          method: "POST",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            order_number:
              orderNumber,
            customer_phone:
              phone,
          }),
        },
      );

      if (!response.ok) {
        let message =
          "Commande introuvable. Vérifiez vos informations.";

        try {
          const data =
            await response.json();

          if (
            typeof data.detail
            === "string"
          ) {
            message = data.detail;
          }
        } catch {
          // Message générique conservé.
        }

        throw new Error(
          message,
        );
      }

      const order =
        await response.json() as Order;

      try {
        saveRecentOrder({
          id: order.id,
          orderNumber:
            order.order_number,
        });
      } catch {
        // Le suivi reste disponible même si le stockage local est bloqué.
      }

      router.push(
        `/commande/${order.id}`,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError
          instanceof Error
          ? caughtError.message
          : (
              "Impossible de vérifier la commande. Réessayez."
            ),
      );

      setLoading(false);
    }
  }


  return (
    <div className="mx-auto max-w-[760px] px-4 py-10 sm:px-6 lg:py-16">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-[#0b4da2] to-[#083a7b] px-6 py-8 text-white sm:px-9">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Truck size={27} />
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-orange-300">
            SUGU KURA
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Suivre ma commande
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
            Entrez le numéro reçu après votre achat et le téléphone utilisé pour la commande.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="p-6 sm:p-9"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-black text-slate-700">
              Numéro de commande

              <input
                name="order_number"
                required
                autoComplete="off"
                placeholder="Ex. SK-2026-000123"
                className="mt-2 h-13 w-full rounded-2xl border border-slate-200 px-4 font-semibold uppercase outline-none transition focus:border-[#ff6b00] focus:ring-4 focus:ring-orange-50"
              />
            </label>

            <label className="text-sm font-black text-slate-700">
              Téléphone utilisé

              <input
                name="customer_phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="Ex. 76 00 00 00"
                className="mt-2 h-13 w-full rounded-2xl border border-slate-200 px-4 font-semibold outline-none transition focus:border-[#ff6b00] focus:ring-4 focus:ring-orange-50"
              />
            </label>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading
            }
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6b00] text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#e85f00] disabled:cursor-wait disabled:opacity-60"
          >
            <Search size={18} />

            {loading
              ? "Recherche en cours..."
              : "Voir l'état de ma commande"}
          </button>

          <div className="mt-5 flex gap-3 rounded-2xl bg-emerald-50 p-4">
            <ShieldCheck
              size={20}
              className="shrink-0 text-emerald-600"
            />

            <p className="text-xs leading-5 text-emerald-800">
              Le téléphone sert de vérification supplémentaire : le numéro de commande seul ne suffit pas pour retrouver les détails.
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
