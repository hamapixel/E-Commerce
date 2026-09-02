import {
  markPaymentPaidAction,
} from "@/actions/owner";

import {
  ownerFetch,
} from "@/lib/backend";

import {
  formatDate,
  formatMoney,
} from "@/lib/format";

import type {
  OwnerPayment,
} from "@/types/owner";


export default async function PaymentsPage() {
  const payments =
    await ownerFetch<
      OwnerPayment[]
    >(
      "/owner/payments/",
    );

  return (
    <>
      <h1 className="text-3xl font-black text-slate-950">
        Paiements
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        Paiements reçus et montants
        encore en attente.
      </p>

      <div className="mt-7 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Aucun paiement.
          </div>
        ) : (
          payments.map(
            (payment) => (
              <div
                key={
                  payment.id
                }
                className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 last:border-b-0"
              >
                <div>
                  <strong className="text-slate-950">
                    {
                      payment.reference
                    }
                  </strong>

                  <p className="mt-1 text-xs text-slate-500">
                    {
                      payment.method_label
                    }
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {formatDate(
                      payment.created_at,
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <strong className="block text-lg text-[#ff6b00]">
                    {formatMoney(
                      payment.amount,
                    )}
                  </strong>

                  <span
                    className={`text-xs font-bold ${
                      payment.status ===
                      "PAID"
                        ? "text-emerald-600"
                        : "text-orange-600"
                    }`}
                  >
                    {
                      payment.status_label
                    }
                  </span>

                  {payment.status ===
                    "PENDING" && (
                    <form
                      action={
                        markPaymentPaidAction
                      }
                      className="mt-2"
                    >
                      <input
                        type="hidden"
                        name="payment_id"
                        value={
                          payment.id
                        }
                      />

                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-black text-white transition hover:bg-emerald-700"
                      >
                        Marquer payé
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ),
          )
        )}
      </div>
    </>
  );
}