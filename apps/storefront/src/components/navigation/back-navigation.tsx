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


function getSafeFallback(
  pathname: string,
) {
  if (
    pathname.startsWith(
      "/commande/",
    )
  ) {
    return "/ma-commande";
  }

  if (
    pathname === "/suivi-commande"
  ) {
    return "/ma-commande";
  }

  if (
    pathname === "/ma-commande"
  ) {
    return "/";
  }

  if (
    pathname === "/checkout"
    || pathname.startsWith(
      "/checkout/",
    )
  ) {
    return "/panier";
  }

  return "/";
}


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
    const fallback =
      getSafeFallback(
        pathname,
      );

    const referrer =
      document.referrer;

    if (referrer) {
      try {
        const url =
          new URL(referrer);

        const sameOrigin =
          url.origin ===
          window.location.origin;

        const referrerPath =
          `${url.pathname}${url.search}`;

        const unsafeOrderLoop =
          pathname.startsWith(
            "/commande/",
          )
          && referrerPath.startsWith(
            "/checkout/",
          );

        if (
          sameOrigin
          && !unsafeOrderLoop
          && referrerPath !== pathname
        ) {
          router.back();
          return;
        }
      } catch {
        // Utilise la destination sûre ci-dessous.
      }
    }

    router.push(
      fallback,
    );
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
