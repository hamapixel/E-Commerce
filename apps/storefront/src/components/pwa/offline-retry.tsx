"use client";

import {
  RefreshCw,
} from "lucide-react";


export function OfflineRetry() {
  return (
    <button
      type="button"
      onClick={
        () =>
          window.location.reload()
      }
      className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white"
    >
      <RefreshCw
        size={17}
      />

      Réessayer
    </button>
  );
}
