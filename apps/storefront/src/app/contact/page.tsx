import type {
  Metadata,
} from "next";

import {
  Clock3,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";

import {
  STORE_EMAIL,
  STORE_PHONE,
  phoneHref,
  whatsappHref,
} from "@/lib/store-contact";


export const metadata:
  Metadata = {
  title:
    "Contact et assistance",

  description:
    "Contactez SUGU KURA par téléphone ou WhatsApp pour vos questions, commandes et besoins d'assistance.",
};


export default function ContactPage() {
  const callLink =
    phoneHref();

  const whatsappLink =
    whatsappHref(
      "Bonjour SUGU KURA, je souhaite avoir des informations.",
    );

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:py-14">
      <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#061f43] via-[#0b4da2] to-[#123f78] text-white shadow-xl">
        <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-300">
              Assistance SUGU KURA
            </p>

            <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Besoin d&apos;aide ? Contactez-nous facilement.
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100/85 sm:text-base">
              Une question sur un produit, une commande ou une livraison ? Vous pouvez nous appeler directement ou nous écrire sur WhatsApp.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {callLink ? (
                <a
                  href={callLink}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-6 text-sm font-black text-white transition hover:bg-[#e86100]"
                >
                  <Phone size={18} />
                  Appeler maintenant
                </a>
              ) : (
                <span className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white/10 px-6 text-sm font-bold text-blue-100">
                  Numéro de téléphone à configurer
                </span>
              )}

              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 text-sm font-black text-white transition hover:brightness-95"
                >
                  <MessageCircle size={18} />
                  Écrire sur WhatsApp
                </a>
              ) : (
                <span className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-bold text-blue-100">
                  WhatsApp à configurer
                </span>
              )}
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur sm:p-6">
            <h2 className="text-lg font-black">
              Service client
            </h2>

            <div className="mt-5 grid gap-4">
              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
                <Phone
                  size={20}
                  className="mt-0.5 shrink-0 text-orange-300"
                />

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-100/70">
                    Téléphone
                  </p>

                  <p className="mt-1 font-black">
                    {STORE_PHONE || "À configurer"}
                  </p>
                </div>
              </div>

              {STORE_EMAIL && (
                <a
                  href={`mailto:${STORE_EMAIL}`}
                  className="flex items-start gap-3 rounded-2xl bg-white/10 p-4"
                >
                  <Mail
                    size={20}
                    className="mt-0.5 shrink-0 text-orange-300"
                  />

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-100/70">
                      E-mail
                    </p>

                    <p className="mt-1 break-all font-black">
                      {STORE_EMAIL}
                    </p>
                  </div>
                </a>
              )}

              <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
                <Clock3
                  size={20}
                  className="mt-0.5 shrink-0 text-orange-300"
                />

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-100/70">
                    Réponse rapide
                  </p>

                  <p className="mt-1 text-sm font-bold text-blue-50">
                    Nous faisons le maximum pour vous répondre rapidement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <Phone className="text-[#0b4da2]" />
          <h2 className="mt-4 font-black text-slate-950">
            Par téléphone
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Pour une question rapide sur un produit ou une commande.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <MessageCircle className="text-[#25D366]" />
          <h2 className="mt-4 font-black text-slate-950">
            Par WhatsApp
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Envoyez-nous votre message directement depuis votre téléphone.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <ShieldCheck className="text-[#ff6b00]" />
          <h2 className="mt-4 font-black text-slate-950">
            Assistance fiable
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Nous vous accompagnons avant et après votre achat.
          </p>
        </div>
      </section>
    </div>
  );
}
