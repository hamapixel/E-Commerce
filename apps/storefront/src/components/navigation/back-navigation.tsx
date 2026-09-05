"use client";

import {
  ArrowLeft,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";


const HIDDEN_PATHS = new Set([
  "/",
  "/hors-ligne",
]);


export function BackNavigation() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  if (
    HIDDEN_PATHS.has(
      pathname,
    )
  ) {
    return null;
  }

  function goBack() {
    const referrer =
      document.referrer;

    if (referrer) {
      try {
        const url =
          new URL(referrer);

        if (
          url.origin ===
          window.location.origin
        ) {
          router.back();
          return;
        }
      } catch {
        // On retombe vers l'accueil ci-dessous.
      }
    }

    router.push("/");
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pt-4 sm:px-6">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-[#0b4da2] hover:text-[#0b4da2] active:scale-[0.98] sm:h-11 sm:px-4 sm:text-sm"
        aria-label="Retour à la page précédente"
      >
        <ArrowLeft
          size={17}
        />

        Retour
      </button>
    </div>
  );
}
