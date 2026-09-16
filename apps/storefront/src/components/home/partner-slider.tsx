"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import type {
  Partner,
} from "@/types/api";

interface PartnerSliderProps {
  partners: Partner[];
}

export function PartnerSlider({
  partners,
}: PartnerSliderProps) {
  const scrollerRef =
    useRef<HTMLDivElement>(null);

  const uniquePartners = useMemo(
    () => {
      const seen = new Set<number>();

      return partners.filter(
        (partner) => {
          if (seen.has(partner.id)) {
            return false;
          }

          seen.add(partner.id);
          return true;
        },
      );
    },
    [partners],
  );

  const compactDesktop =
    uniquePartners.length <= 4;

  function move(direction: 1 | -1) {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const firstCard =
      scroller.firstElementChild as HTMLElement | null;

    const step = firstCard
      ? firstCard.getBoundingClientRect().width + 16
      : 190;

    scroller.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (
      compactDesktop
      || uniquePartners.length <= 1
    ) {
      return;
    }

    const interval = window.setInterval(
      () => {
        const scroller = scrollerRef.current;

        if (!scroller) {
          return;
        }

        const firstCard =
          scroller.firstElementChild as HTMLElement | null;

        const step = firstCard
          ? firstCard.getBoundingClientRect().width + 16
          : 190;

        const nearEnd =
          scroller.scrollLeft
          + scroller.clientWidth
          >= scroller.scrollWidth - step;

        if (nearEnd) {
          scroller.scrollTo({
            left: 0,
            behavior: "smooth",
          });
        } else {
          scroller.scrollBy({
            left: step,
            behavior: "smooth",
          });
        }
      },
      3500,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [
    compactDesktop,
    uniquePartners.length,
  ]);

  if (!uniquePartners.length) {
    return null;
  }

  return (
    <section
      id="partners"
      className="mt-14 scroll-mt-36"
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Ils nous accompagnent
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Nos partenaires
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Découvrez les entreprises qui nous font confiance.
          </p>
        </div>

        {!compactDesktop && (
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Partenaire précédent"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-orange-200 hover:text-[#ff6b00]"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Partenaire suivant"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-orange-200 hover:text-[#ff6b00]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div
        className={`relative overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white px-3 py-4 shadow-sm sm:px-4 sm:py-5 ${
          compactDesktop
            ? "lg:mx-auto lg:max-w-4xl"
            : ""
        }`}
      >
        <div
          ref={scrollerRef}
          className={`hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth sm:gap-4 ${
            compactDesktop
              ? "lg:justify-center"
              : ""
          }`}
        >
          {uniquePartners.map(
            (partner) => (
              <a
                key={partner.id}
                href={
                  partner.effective_link ||
                  "#partners"
                }
                target={
                  partner.effective_link?.startsWith(
                    "http",
                  )
                    ? "_blank"
                    : undefined
                }
                rel="noreferrer"
                title={partner.name}
                className="group relative flex h-20 w-36 shrink-0 snap-start items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:h-24 sm:w-44"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  sizes="(max-width: 640px) 144px, 176px"
                  className="object-contain p-3 transition duration-300 group-hover:scale-[1.04] sm:p-4"
                />
              </a>
            ),
          )}
        </div>

        <p className="mt-3 text-center text-[10px] font-semibold text-slate-400 sm:hidden">
          Glissez pour voir les partenaires
        </p>
      </div>
    </section>
  );
}
