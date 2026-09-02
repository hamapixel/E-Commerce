import Link from "next/link";

import {
  Banknote,
  CheckCircle2,
  PackageCheck,
  Phone,
  ShieldCheck,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  formatMoney,
} from "@/lib/format";

import {
  getOrder,
} from "@/lib/order-server";


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}


export const dynamic =
  "force-dynamic";


export default async function OrderPage({
  params,
}: PageProps) {
  const {
    id,
  } = await params;

  const order =
    await getOrder(
      id,
    );

  if (!order) {
    notFound();
  }

  const payment =
    order.payments[0] ??
    null;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 lg:py-12">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2
              size={42}
            />
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            SUGU KURA
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Commande enregistrée
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Merci. Votre commande a bien
            été transmise à SUGU KURA.
          </p>

          <div className="mx-auto mt-5 w-fit rounded-xl bg-blue-50 px-5 py-3">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Numéro de commande
            </span>

            <strong className="mt-1 block text-lg text-[#0b4da2]">
              {order.order_number}
            </strong>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <PackageCheck
              size={20}
              className="text-[#ff6b00]"
            />

            <p className="mt-3 text-[10px] font-bold uppercase text-slate-400">
              Commande
            </p>

            <strong className="mt-1 block text-sm">
              {
                order.status_label
              }
            </strong>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <Banknote
              size={20}
              className="text-[#0b4da2]"
            />

            <p className="mt-3 text-[10px] font-bold uppercase text-slate-400">
              Paiement
            </p>

            <strong className="mt-1 block text-sm">
              {payment
                ? payment.method_label
                : "—"}
            </strong>

            {payment && (
              <span className="mt-1 block text-xs text-orange-600">
                {
                  payment.status_label
                }
              </span>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <Phone
              size={20}
              className="text-emerald-600"
            />

            <p className="mt-3 text-[10px] font-bold uppercase text-slate-400">
              Contact
            </p>

            <strong className="mt-1 block text-sm">
              {
                order.customer_phone
              }
            </strong>
          </div>
        </div>

        <div className="my-8 border-t border-slate-200" />

        <div className="grid gap-7 md:grid-cols-2">
          <section>
            <h2 className="font-black">
              Client
            </h2>

            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                {
                  order.customer_name
                }
              </p>

              <p>
                {
                  order.customer_phone
                }
              </p>

              {order.customer_whatsapp && (
                <p>
                  WhatsApp :{" "}
                  {
                    order
                      .customer_whatsapp
                  }
                </p>
              )}

              {order.customer_email && (
                <p>
                  {
                    order.customer_email
                  }
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-black">
              Livraison / retrait
            </h2>

            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                {
                  order
                    .delivery_method_label
                }
              </p>

              <p>
                {order.city}

                {order.delivery_zone
                  ? ` — ${order.delivery_zone}`
                  : ""}
              </p>

              {order.address && (
                <p>
                  {order.address}
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="my-8 border-t border-slate-200" />

        <h2 className="text-xl font-black">
          Articles
        </h2>

        <div className="mt-4 space-y-3">
          {order.items.map(
            (item) => (
              <Link
                key={
                  item.id
                }
                href={`/produits/${item.product_slug}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200"
              >
                <div>
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
          <div className="flex justify-between gap-4">
            <span>
              Sous-total
            </span>

            <strong>
              {formatMoney(
                order.subtotal,
              )}
            </strong>
          </div>

          <div className="mt-3 flex justify-between gap-4">
            <span>
              Livraison
            </span>

            <strong>
              {formatMoney(
                order.delivery_fee,
              )}
            </strong>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-end justify-between gap-4">
              <span className="text-lg font-black">
                Total
              </span>

              <strong className="text-3xl text-[#ff6b00]">
                {formatMoney(
                  order.total,
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2 rounded-xl bg-emerald-50 p-4">
          <ShieldCheck
            size={20}
            className="shrink-0 text-emerald-600"
          />

          <p className="text-xs leading-5 text-emerald-800">
            Votre commande possède maintenant
            un numéro unique et les quantités
            correspondantes ont été retirées
            du stock disponible.
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#ff6b00] text-sm font-black text-white transition hover:bg-[#e85f00]"
        >
          Retour à la boutique
        </Link>
      </section>
    </div>
  );
}