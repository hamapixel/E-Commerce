"use client";

import Link from "next/link";
import {
  LoaderCircle,
  PackageSearch,
  Search,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  useRouter,
} from "next/navigation";

const LAST_ORDER_STORAGE_KEY =
  "sugu-kura-last-order";

interface StoredOrder {
  id: string;
  orderNumber?: string;
  savedAt?: string;
}

function subscribeToLastOrder(
  callback: () => void,
) {
  window.addEventListener(
    "storage",
    callback,
  );

  return () => {
    window.removeEventListener(
      "storage",
      callback,
    );
  };
}

function getLastOrderSnapshot() {
  return window.localStorage.getItem(
    LAST_ORDER_STORAGE_KEY,
  ) ?? "";
}

function getServerLastOrderSnapshot() {
  return "";
}

export function MyOrderShortcut() {
  const router = useRouter();

  const rawStoredOrder =
    useSyncExternalStore(
      subscribeToLastOrder,
      getLastOrderSnapshot,
      getServerLastOrderSnapshot,
    );

  const storedOrder = useMemo(
    () => {
      if (!rawStoredOrder) {
        return null;
      }

      try {
        const parsed =
          JSON.parse(
            rawStoredOrder,
          ) as StoredOrder;

        if (
          typeof parsed.id !== "string"
          || !parsed.id.trim()
        ) {
          return null;
        }

        return parsed;
      } catch {
        return null;
      }
    },
    [rawStoredOrder],
  );

  useEffect(() => {
    if (!storedOrder?.id) {
      return;
    }

    router.replace(
      `/commande/${storedOrder.id}`,
    );
  }, [
    router,
    storedOrder?.id,
  ]);

  if (storedOrder?.id) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <LoaderCircle
          size={34}
          className="mx-auto animate-spin text-[#0b4da2]"
        />

        <h1 className="mt-4 text-2xl font-black text-slate-950">
          Ma commande
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {storedOrder.orderNumber
            ? `Ouverture de ${storedOrder.orderNumber}...`
            : "Ouverture de votre dernière commande..."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0b4da2]">
        <PackageSearch size={30} />
      </div>

      <h1 className="mt-5 text-3xl font-black text-slate-950">
        Ma commande
      </h1>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
        Aucune commande récente n&apos;est enregistrée sur cet appareil. Retrouvez-la avec son numéro de commande et le téléphone utilisé lors de l&apos;achat.
      </p>

      <Link
        href="/suivi-commande"
        className="mx-auto mt-6 flex h-12 w-fit items-center justify-center gap-2 rounded-xl bg-[#0b4da2] px-6 text-sm font-black text-white transition hover:bg-[#083b7f]"
      >
        <Search size={17} />
        Retrouver ma commande
      </Link>

      <Link
        href="/"
        className="mt-4 inline-flex text-sm font-bold text-[#ff6b00]"
      >
        Retour à la boutique
      </Link>
    </div>
  );
}
