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


function legacyCopy(
  value: string,
) {
  const textarea =
    document.createElement(
      "textarea",
    );

  textarea.value = value;
  textarea.readOnly = true;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(
    textarea,
  );

  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(
    0,
    textarea.value.length,
  );

  const copied =
    document.execCommand(
      "copy",
    );

  document.body.removeChild(
    textarea,
  );

  return copied;
}


export function CopyOrderNumber({
  orderNumber,
}: CopyOrderNumberProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);


  async function copyNumber() {
    let success = false;

    try {
      if (
        navigator.clipboard
        &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          orderNumber,
        );

        success = true;
      }
      else {
        success = legacyCopy(
          orderNumber,
        );
      }
    }
    catch {
      success = legacyCopy(
        orderNumber,
      );
    }

    setCopied(success);

    if (success) {
      window.setTimeout(
        () => {
          setCopied(false);
        },
        2000,
      );
    }
  }


  return (
    <button
      type="button"
      onClick={copyNumber}
      className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0b4da2] px-4 text-sm font-black text-white transition active:scale-[0.98] hover:bg-[#083b7f] sm:h-10 sm:w-auto sm:text-xs"
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
