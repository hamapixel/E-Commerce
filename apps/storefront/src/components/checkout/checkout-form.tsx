"use client";

import Link from "next/link";

import {
  ArrowLeft,
  MapPin,
  PackageCheck,
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
  createCheckout,
} from "@/lib/checkout-api";

import {
  formatMoney,
} from "@/lib/format";

import {
  useCartStore,
} from "@/store/cart-store";


export function CheckoutForm() {
  const router =
    useRouter();

  const items =
    useCartStore(
      (state) =>
        state.items,
    );

  const hasHydrated =
    useCartStore(
      (state) =>
        state.hasHydrated,
    );

  const [
    deliveryMethod,
    setDeliveryMethod,
  ] = useState<
    "DELIVERY" | "PICKUP"
  >("DELIVERY");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const subtotal =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        (
          item.unitPrice *
          item.quantity
        ),
      0,
    );

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!items.length) {
      setError(
        "Votre panier est vide.",
      );

      return;
    }

    const form =
      new FormData(
        event.currentTarget,
      );

    setSubmitting(true);

    setError("");

    try {
      const session =
        await createCheckout({
          customer_name:
            String(
              form.get(
                "customer_name",
              ) ?? "",
            ).trim(),

          customer_phone:
            String(
              form.get(
                "customer_phone",
              ) ?? "",
            ).trim(),

          customer_whatsapp:
            String(
              form.get(
                "customer_whatsapp",
              ) ?? "",
            ).trim(),

          customer_email:
            String(
              form.get(
                "customer_email",
              ) ?? "",
            ).trim(),

          delivery_method:
            deliveryMethod,

          city:
            String(
              form.get(
                "city",
              ) ?? "Bamako",
            ).trim(),

          delivery_zone:
            String(
              form.get(
                "delivery_zone",
              ) ?? "",
            ).trim(),

          address:
            String(
              form.get(
                "address",
              ) ?? "",
            ).trim(),

          notes:
            String(
              form.get(
                "notes",
              ) ?? "",
            ).trim(),

          items:
            items.map(
              (item) => ({
                product_id:
                  item.productId,

                variant_id:
                  item.variantId,

                quantity:
                  item.quantity,
              }),
            ),
        });

      router.push(
        `/checkout/${session.id}`,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError
          instanceof Error
          ? caughtError.message
          : (
              "Impossible de préparer la commande. Réessayez."
            ),
      );

      setSubmitting(false);
    }
  }

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <div className="h-80 animate-pulse rounded-[28px] bg-slate-200" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-[700px] px-4 py-16 text-center sm:px-6">
        <PackageCheck
          size={48}
          className="mx-auto text-[#ff6b00]"
        />

        <h1 className="mt-5 text-3xl font-black">
          Votre panier est vide
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Ajoutez des produits avant
          de continuer.
        </p>

        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-[#ff6b00] px-6 py-3 text-sm font-black text-white"
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-4 py-7 sm:px-6 lg:py-10">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
          SUGU KURA
        </p>

        <h1 className="mt-1 text-3xl font-black text-slate-950">
          Finaliser ma commande
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Renseignez vos informations pour continuer.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="space-y-5">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-black">
              Coordonnées
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold">
                Nom complet *

                <input
                  name="customer_name"
                  required
                  autoComplete="name"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-[#ff6b00]"
                />
              </label>

              <label className="text-sm font-bold">
                Téléphone *

                <input
                  name="customer_phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-[#ff6b00]"
                />
              </label>

              <label className="text-sm font-bold">
                WhatsApp

                <input
                  name="customer_whatsapp"
                  type="tel"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-[#ff6b00]"
                />
              </label>

              <label className="text-sm font-bold">
                E-mail

                <input
                  name="customer_email"
                  type="email"
                  autoComplete="email"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-[#ff6b00]"
                />
              </label>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-black">
              Mode de réception
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setDeliveryMethod(
                    "DELIVERY",
                  )
                }
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  deliveryMethod ===
                  "DELIVERY"
                    ? "border-[#ff6b00] bg-orange-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <Truck
                  size={22}
                  className="text-[#ff6b00]"
                />

                <strong className="mt-3 block">
                  Livraison
                </strong>

                <span className="mt-1 block text-xs text-slate-500">
                  Livraison à votre adresse.
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setDeliveryMethod(
                    "PICKUP",
                  )
                }
                className={`rounded-2xl border-2 p-4 text-left transition ${
                  deliveryMethod ===
                  "PICKUP"
                    ? "border-[#0b4da2] bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <MapPin
                  size={22}
                  className="text-[#0b4da2]"
                />

                <strong className="mt-3 block">
                  Retrait
                </strong>

                <span className="mt-1 block text-xs text-slate-500">
                  Retrait chez SUGU KURA.
                </span>
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold">
                Ville

                <input
                  name="city"
                  defaultValue="Bamako"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-[#ff6b00]"
                />
              </label>

              <label className="text-sm font-bold">
                Quartier / zone

                <input
                  name="delivery_zone"
                  placeholder="Ex. Bozola"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-[#ff6b00]"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-bold">
              Adresse
              {deliveryMethod ===
              "DELIVERY"
                ? " *"
                : ""}

              <textarea
                name="address"
                required={
                  deliveryMethod ===
                  "DELIVERY"
                }
                rows={3}
                placeholder="Rue, quartier, repère..."
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-[#ff6b00]"
              />
            </label>

            <label className="mt-4 block text-sm font-bold">
              Instructions

              <textarea
                name="notes"
                rows={3}
                placeholder="Ex. Appelez-moi avant la livraison."
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-[#ff6b00]"
              />
            </label>
          </section>
        </div>

        <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-32">
          <h2 className="text-xl font-black">
            Votre commande
          </h2>

          <div className="mt-5 max-h-72 space-y-3 overflow-y-auto">
            {items.map(
              (item) => (
                <div
                  key={
                    item.key
                  }
                  className="flex justify-between gap-3 border-b border-slate-100 pb-3"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-xs font-bold">
                      {item.name}
                    </p>

                    {item.variantLabel && (
                      <p className="mt-1 text-[10px] text-slate-400">
                        {
                          item.variantLabel
                        }
                      </p>
                    )}

                    <p className="mt-1 text-[10px] text-slate-500">
                      Qté :{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <strong className="shrink-0 text-xs">
                    {formatMoney(
                      item.unitPrice *
                      item.quantity,
                    )}
                  </strong>
                </div>
              ),
            )}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="font-bold">
              Sous-total
            </span>

            <strong className="text-xl text-[#ff6b00]">
              {formatMoney(
                subtotal,
              )}
            </strong>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              submitting
            }
            className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-[#ff6b00] text-sm font-black text-white transition hover:bg-[#e85f00] disabled:cursor-wait disabled:opacity-60"
          >
            {submitting
              ? "Vérification..."
              : "Continuer"}
          </button>

          <div className="mt-4 flex gap-2 rounded-xl bg-emerald-50 p-3">
            <ShieldCheck
              size={18}
              className="shrink-0 text-emerald-600"
            />

            <p className="text-[10px] leading-5 text-emerald-800">
              Vérifiez vos informations avant de continuer.
            </p>
          </div>

          <Link
            href="/panier"
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
          >
            <ArrowLeft size={15} />

            Retour au panier
          </Link>
        </aside>
      </form>
    </div>
  );
}