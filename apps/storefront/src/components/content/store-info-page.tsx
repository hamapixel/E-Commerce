import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Info,
} from "lucide-react";

import {
  InfoPageNav,
} from "@/components/content/info-page-nav";


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
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:py-14">
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#061f43] via-[#0b4da2] to-[#123f78] p-6 text-white shadow-xl sm:p-9 lg:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-orange-400/15 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
            {eyebrow}
          </p>

          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-blue-100/90 sm:text-base">
            {intro}
          </p>
        </div>
      </section>

      <div className="mt-7 grid gap-4">
        {sections.map((section, index) => (
          <section
            key={section.title}
            className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-100 hover:shadow-md sm:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-sm font-black text-[#ff6b00]">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="min-w-0 flex-1">
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
                        className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-600"
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
              </div>
            </div>
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

      <InfoPageNav />

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
