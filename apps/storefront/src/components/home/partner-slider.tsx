"use client";

import Image from "next/image";
import {
  useMemo,
} from "react";

import type {
  Partner,
} from "@/types/api";

interface PartnerSliderProps {
  partners: Partner[];
}

interface PartnerGroupProps {
  partners: Partner[];
  duplicate?: boolean;
}

function PartnerGroup({
  partners,
  duplicate = false,
}: PartnerGroupProps) {
  return (
    <div
      className="flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4"
      aria-hidden={
        duplicate
          ? true
          : undefined
      }
    >
      {partners.map(
        (partner) => (
          <a
            key={`${duplicate ? "copy" : "main"}-${partner.id}`}
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
            tabIndex={
              duplicate
                ? -1
                : undefined
            }
            className="group relative flex h-20 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md sm:h-24 sm:w-44"
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
  );
}

export function PartnerSlider({
  partners,
}: PartnerSliderProps) {
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

  if (!uniquePartners.length) {
    return null;
  }

  const compactMaxWidth =
    uniquePartners.length <= 4
      ? `${uniquePartners.length * 192 + 32}px`
      : undefined;

  const infinite =
    uniquePartners.length > 1;

  return (
    <section
      id="partners"
      className="mt-14 scroll-mt-36"
    >
      <div className="mb-5">
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

      <div
        className={`relative mx-auto w-full overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white px-3 py-4 shadow-sm sm:px-4 sm:py-5 ${
          infinite
            ? "partner-marquee"
            : ""
        }`}
        style={{
          maxWidth:
            compactMaxWidth,
        }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent sm:w-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent sm:w-10" />

        {infinite ? (
          <div className="partner-marquee-track flex w-max">
            <PartnerGroup
              partners={uniquePartners}
            />

            <PartnerGroup
              partners={uniquePartners}
              duplicate
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <PartnerGroup
              partners={uniquePartners}
            />
          </div>
        )}

        <p className="mt-3 text-center text-[10px] font-semibold text-slate-400">
          Défilement automatique continu
        </p>
      </div>
    </section>
  );
}
