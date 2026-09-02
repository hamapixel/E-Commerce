import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  WifiOff,
} from "lucide-react";

import {
  OfflineRetry,
} from "@/components/pwa/offline-retry";


export const metadata:
  Metadata = {
  title:
    "Hors connexion",

  description:
    "SUGU KURA est momentanément hors connexion.",

  robots: {
    index:
      false,

    follow:
      false,
  },
};


export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[65vh] max-w-xl items-center px-4 py-12 sm:px-6">
      <section className="w-full rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b00]">
          <WifiOff
            size={28}
          />
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#0b4da2]">
          SUGU KURA
        </p>

        <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
          Vous êtes hors connexion
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
          Vérifiez votre connexion Internet,
          puis réessayez. Votre panier local
          reste conservé sur cet appareil.
        </p>

        <OfflineRetry />

        <div className="mt-4">
          <Link
            href="/"
            className="text-xs font-bold text-[#0b4da2]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>
    </div>
  );
}
