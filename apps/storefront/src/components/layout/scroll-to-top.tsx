"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowUp,
} from "lucide-react";


export function ScrollToTop() {
  const [
    visible,
    setVisible,
  ] = useState(false);

  useEffect(
    () => {
      function handleScroll() {
        setVisible(
          window.scrollY > 500,
        );
      }

      handleScroll();

      window.addEventListener(
        "scroll",
        handleScroll,
        {
          passive: true,
        },
      );

      return () => {
        window.removeEventListener(
          "scroll",
          handleScroll,
        );
      };
    },
    [],
  );

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })}
      aria-label="Remonter en haut de la page"
      title="Remonter en haut"
      className="fixed bottom-24 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#ff6b00] text-white shadow-[0_12px_35px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:bg-[#e86100] lg:bottom-6 lg:right-6"
    >
      <ArrowUp
        size={20}
        strokeWidth={3}
      />
    </button>
  );
}
