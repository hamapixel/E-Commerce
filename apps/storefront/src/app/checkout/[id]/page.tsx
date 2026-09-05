import Link from "next/link";

import {
  Clock3,
  ShieldCheck,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  CheckoutSessionActions,
} from "@/components/checkout/checkout-session-actions";

import {
  Countdown,
} from "@/components/home/countdown";

import {
  OrderCreateActions,
} from "@/components/order/order-create-actions";

import {
  getCheckoutSession,
} from "@/lib/checkout-server";

import {
  formatMoney,
} from "@/lib/format";


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}


export const dynamic =
  "force-dynamic";


export default async function CheckoutDetailPage({
  params,
}: PageProps) {
  const {
    id,
  } = await params;

  const checkout =
    await getCheckoutSession(
      id,
    );

  if (!checkout) {
    notFound();
  }

  const active =
    checkout.status ===
    "ACTIVE";

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 lg:py-12">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
              SUGU KURA
            </p>

            <h1 className="mt-2 text-3xl font-black">
              Vérification finale
            </h1>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-xs font-black ${
              active
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {
              checkout.status_label
            }
          </span>
        </div>

        {active && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-orange-50 p-4 text-orange-700">
            <Clock3
              size={21}
            />

            <div>
              <p className="text-xs font-bold">
                Temps restant pour confirmer
              </p>

              <p className="text-lg font-black">
                <Countdown
                  seconds={
                    checkout
                      .remaining_seconds
                  }
                />
              </p>
            </div>
          </div>
        )}

        <div className="mt-7 grid gap-7 md:grid-cols-2">
          <section>
            <h2 className="font-black">
              Client
            </h2>

            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                <strong>
                  Nom :
                </strong>{" "}
                {
                  checkout
                    .customer_name
                }
              </p>

              <p>
                <strong>
                  Téléphone :
                </strong>{" "}
                {
                  checkout
                    .customer_phone
                }
              </p>

              {checkout
                .customer_whatsapp && (
                <p>
                  <strong>
                    WhatsApp :
                  </strong>{" "}
                  {
                    checkout
                      .customer_whatsapp
                  }
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-black">
              Réception
            </h2>

            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                {
                  checkout
                    .delivery_method_label
                }
              </p>

              <p>
                {checkout.city}

                {checkout.delivery_zone
                  ? ` — ${checkout.delivery_zone}`
                  : ""}
              </p>

              {checkout.address && (
                <p>
                  {
                    checkout.address
                  }
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="my-7 border-t border-slate-200" />

        <h2 className="text-xl font-black">
          Articles de ma commande
        </h2>

        <div className="mt-4 space-y-3">
          {checkout.items.map(
            (item) => (
              <Link
                key={
                  item.id
                }
                href={`/produits/${item.product_slug}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black">
                    {
                      item.product_name
                    }
                  </p>

                  {item.variant_label && (
                    <p className="mt-1 text-xs text-[#0b4da2]">
                      {
                        item.variant_label
                      }
                    </p>
                  )}

                  <p className="mt-1 text-xs text-slate-400">
                    {item.quantity}
                    {" × "}
                    {formatMoney(
                      item.unit_price,
                    )}
                  </p>
                </div>

                <strong className="shrink-0 text-sm text-[#ff6b00]">
                  {formatMoney(
                    item.line_total,
                  )}
                </strong>
              </Link>
            ),
          )}
        </div>

        <div className="mt-7 rounded-2xl bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <span className="font-bold">
              Sous-total
            </span>

            <span>
              {formatMoney(
                checkout.subtotal,
              )}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-bold">
              Livraison
            </span>

            <span>
              {formatMoney(
                checkout.delivery_fee,
              )}
            </span>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-end justify-between gap-4">
              <strong className="text-lg">
                Total
              </strong>

              <strong className="text-3xl text-[#ff6b00]">
                {formatMoney(
                  checkout.total,
                )}
              </strong>
            </div>
          </div>
        </div>

        {active ? (
          <>
            <OrderCreateActions
              checkoutId={
                checkout.id
              }
              deliveryMethod={
                checkout.delivery_method
              }
            />

            <CheckoutSessionActions
              checkoutId={
                checkout.id
              }
            />
          </>
        ) : (
          <div className="mt-6 rounded-2xl bg-slate-100 p-5 text-center">
            <p className="font-black text-slate-700">
              Cette commande n&apos;est
              plus disponible.
            </p>

            <Link
              href="/panier"
              className="mt-4 inline-flex rounded-xl bg-[#ff6b00] px-5 py-3 text-xs font-black text-white"
            >
              Retour au panier
            </Link>
          </div>
        )}

        <div className="mt-5 flex gap-2 rounded-xl bg-emerald-50 p-3">
          <ShieldCheck
            size={19}
            className="shrink-0 text-emerald-600"
          />

          <p className="text-[11px] leading-5 text-emerald-800">
            Vérifiez vos articles puis confirmez votre commande avant la fin du délai.
          </p>
        </div>
      </section>
    </div>
  );
}