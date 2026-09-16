import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Info,
} from "lucide-react";

interface InfoSection {
  title: string;
  body: string;
  items?: string[];
}

interface StoreInfoPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  sections: InfoSection[];
  note?: string;
}

export function StoreInfoPage({
  eyebrow,
  title,
  intro,
  sections,
  note,
}: StoreInfoPageProps) {
  return (
    <div className="mx-auto max-w-[1050px] px-4 py-8 sm:px-6 lg:py-14">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#061f43] via-[#0b4da2] to-[#123f78] p-6 text-white shadow-xl sm:p-9 lg:p-12">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
          {eyebrow}
        </p>

        <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        <p className="mt-5 max-w-3xl text-sm leading-7 text-blue-100/85 sm:text-base">
          {intro}
        </p>
      </section>

      <div className="mt-7 grid gap-4">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2 className="text-lg font-black text-slate-950 sm:text-xl">
              {section.title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              {section.body}
            </p>

            {section.items && section.items.length > 0 && (
              <div className="mt-4 grid gap-2.5">
                {section.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
                  >
                    <CheckCircle2
                      size={17}
                      className="mt-1 shrink-0 text-emerald-600"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {note && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          <Info
            size={19}
            className="mt-0.5 shrink-0 text-[#0b4da2]"
          />
          <p>{note}</p>
        </div>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-[#0b4da2] hover:text-[#0b4da2]"
        >
          <ArrowLeft size={16} />
          Retour à la boutique
        </Link>

        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white transition hover:bg-[#e86100]"
        >
          Contacter SUGU KURA
        </Link>
      </div>
    </div>
  );
}
