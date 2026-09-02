import {
  updateOrderStatusAction,
} from "@/actions/owner";

import {
  ownerFetch,
} from "@/lib/backend";

import {
  formatDate,
  formatMoney,
} from "@/lib/format";

import type {
  OwnerOrder,
} from "@/types/owner";


export default async function OrdersPage() {
  const orders =
    await ownerFetch<
      OwnerOrder[]
    >(
      "/owner/orders/",
    );

  return (
    <>
      <h1 className="text-3xl font-black text-slate-950">
        Commandes
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Suivi et traitement des
        commandes clients.
      </p>

      <div className="mt-7 space-y-4">
        {orders.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Aucune commande.
          </div>
        )}

        {orders.map(
          (order) => (
            <article
              key={
                order.id
              }
              className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <strong className="text-lg text-slate-950">
                    {
                      order.order_number
                    }
                  </strong>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      order.customer_name
                    }
                    {" • "}
                    {
                      order.customer_phone
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(
                      order.created_at,
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <strong className="block text-xl text-[#ff6b00]">
                    {formatMoney(
                      order.total,
                    )}
                  </strong>

                  <span className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0b4da2]">
                    {
                      order.status_label
                    }
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-black text-slate-500">
                  {order.items.length} article(s)
                </p>

                <div className="mt-2 space-y-1">
                  {order.items.map(
                    (item) => (
                      <p
                        key={item.id}
                        className="text-xs text-slate-600"
                      >
                        {item.quantity}
                        {" × "}
                        {item.product_name}

                        {item.variant_label
                          ? ` — ${item.variant_label}`
                          : ""}
                      </p>
                    ),
                  )}
                </div>
              </div>

              <form
                action={
                  updateOrderStatusAction
                }
                className="mt-5 flex flex-wrap gap-2"
              >
                <input
                  type="hidden"
                  name="order_id"
                  value={
                    order.id
                  }
                />

                <select
                  name="status"
                  defaultValue={
                    order.status
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-[#ff6b00]"
                >
                  <option value="PENDING">
                    En attente
                  </option>

                  <option value="CONFIRMED">
                    Confirmée
                  </option>

                  <option value="PREPARING">
                    En préparation
                  </option>

                  <option value="READY">
                    Prête
                  </option>

                  <option value="SHIPPED">
                    Expédiée
                  </option>

                  <option value="DELIVERED">
                    Livrée
                  </option>
                </select>

                <button
                  type="submit"
                  className="h-11 rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-slate-800"
                >
                  Mettre à jour
                </button>
              </form>
            </article>
          ),
        )}
      </div>
    </>
  );
}