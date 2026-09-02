import Image from "next/image";

import type {
  Partner,
} from "@/types/api";

interface PartnerSliderProps {
  partners: Partner[];
}

export function PartnerSlider({
  partners,
}: PartnerSliderProps) {
  if (!partners.length) {
    return null;
  }

  return (
    <section
      id="partners"
      className="mt-14"
    >
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
          Ils nous accompagnent
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
          Nos partenaires
        </h2>
      </div>

      <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-3">
        {partners.map(
          (partner) => (
            <a
              key={partner.id}
              href={
                partner.effective_link ||
                "#"
              }
              className="relative flex h-24 min-w-40 items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                sizes="180px"
                className="object-contain p-5"
              />
            </a>
          ),
        )}
      </div>
    </section>
  );
}