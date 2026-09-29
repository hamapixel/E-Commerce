"use client";

import {
  Check,
  Copy,
} from "lucide-react";

import {
  useState,
} from "react";


interface CopyOrderNumberProps {
  orderNumber: string;
}


export function CopyOrderNumber({
  orderNumber,
}: CopyOrderNumberProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(
        orderNumber,
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        2000,
      );
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyNumber}
      className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0b4da2] px-4 text-xs font-black text-white transition hover:bg-[#083b7f]"
    >
      {copied ? (
        <>
          <Check size={15} />
          Num&eacute;ro copi&eacute;
        </>
      ) : (
        <>
          <Copy size={15} />
          Copier le num&eacute;ro
        </>
      )}
    </button>
  );
}
