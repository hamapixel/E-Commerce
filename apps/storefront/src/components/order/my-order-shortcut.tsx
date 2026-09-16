"use client";

import Link from "next/link";
import {
  Clock3,
  PackageSearch,
  Search,
} from "lucide-react";
import {
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  getRecentOrdersSnapshot,
  parseStoredOrders,
  RECENT_ORDERS_EVENT,
} from "@/lib/recent-orders";

function subscribeToRecentOrders(
  callback: () => void,
) {
  window.addEventListener(
    "storage",
    callback,
  );

  window.addEventListener(
    RECENT_ORDERS_EVENT,
    callback,
  );

  return () => {
    window.removeEventListener(
      "storage",
      callback,
    );

    window.removeEventListener(
      RECENT_ORDERS_EVENT,
      callback,
    );
  };
}

function getServerSnapshot() {
  return "";
}

function formatSavedAt(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Commande vérifiée";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

export function MyOrderShortcut() {
  const snapshot = useSyncExternalStore(
    subscribeToRecentOrders,
    getRecentOrdersSnapshot,
    getServerSnapshot,
  );

  const orders = useMemo(
    () => parseStoredOrders(snapshot),
    [snapshot],
  );

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0b4da2]">
          <PackageSearch size={30} />
        </div>

        <h1 className="mt-5 text-3xl font-black text-slate-950">
          Mes commandes
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
          Retrouvez les dernières commandes créées ou vérifiées sur cet appareil. Vous pouvez aussi rechercher une autre commande avec son numéro et votre téléphone.
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="mt-7 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/commande/${order.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#0b4da2]">
                  {order.orderNumber}
                </p>

                <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <Clock3 size={13} />
                  {formatSavedAt(order.savedAt)}
                </p>
              </div>

              <span className="shrink-0 rounded-xl bg-white px-3 py-2 text-[11px] font-black text-slate-700 shadow-sm">
                Voir
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-black text-slate-700">
            Aucune commande enregistrée sur cet appareil
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Recherchez votre commande une première fois pour l&apos;ajouter ici.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href="/suivi-commande"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0b4da2] px-5 text-sm font-black text-white transition hover:bg-[#083b7f]"
        >
          <Search size={17} />
          Retrouver une autre commande
        </Link>

        <Link
          href="/"
          className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-orange-200 hover:text-[#ff6b00]"
        >
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
