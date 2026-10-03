import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowLeft,
  ChevronDown,
  CircleHelp,
  MessageCircle,
} from "lucide-react";

import {
  InfoPageNav,
} from "@/components/content/info-page-nav";


export const metadata:
  Metadata = {
  title:
    "FAQ",

  description:
    "Questions fréquentes sur les commandes, livraisons, paiements et retours SUGU KURA.",
};


const faqs = [
  {
    question:
      "Dois-je créer un compte pour commander ?",
    answer:
      "Non. Vous pouvez sélectionner vos produits, renseigner vos coordonnées et valider votre commande sans créer de compte.",
  },
  {
    question:
      "Comment suivre ma commande ?",
    answer:
      "Utilisez la rubrique « Ma commande » ou « Suivre ma commande ». Le numéro de commande et le téléphone utilisé lors de l’achat permettent de retrouver le suivi.",
  },
  {
    question:
      "Comment sont calculés les frais de livraison ?",
    answer:
      "Le tarif est déterminé selon la ville et le quartier configurés par SUGU KURA. Le montant est affiché avant la validation de la commande.",
  },
  {
    question:
      "Puis-je choisir le retrait ?",
    answer:
      "Oui. Lorsque l’option retrait est disponible, aucun frais de livraison n’est ajouté à la commande.",
  },
  {
    question:
      "Comment demander de l’aide ?",
    answer:
      "La page Contact permet de joindre directement SUGU KURA par téléphone ou WhatsApp pour une question sur un produit, une commande ou une livraison.",
  },
];


export default function FaqPage() {
  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:py-14">
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#061f43] via-[#0b4da2] to-[#123f78] p-6 text-white shadow-xl sm:p-9 lg:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-orange-400/15 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-orange-300 backdrop-blur">
            <CircleHelp size={24} />
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-orange-300">
            Aide client
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Questions fréquentes
          </h1>

          <p className="mt-5 text-sm leading-7 text-blue-100/90 sm:text-base">
            Les réponses essentielles pour commander facilement sur SUGU KURA, suivre votre achat et contacter notre équipe si nécessaire.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff6b00]">
            FAQ SUGU KURA
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Cliquez sur une question pour voir la réponse
          </h2>
        </div>

        <div className="grid gap-3">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition open:border-blue-200 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-xs font-black text-[#ff6b00]">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <span className="min-w-0 flex-1 text-sm font-black text-slate-950 sm:text-base">
                  {faq.question}
                </span>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b4da2] transition group-open:rotate-180 group-open:bg-[#0b4da2] group-open:text-white">
                  <ChevronDown size={18} />
                </div>
              </summary>

              <div className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5">
                <p className="pl-[52px] text-sm leading-7 text-slate-600">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[26px] border border-orange-100 bg-orange-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
        <div>
          <h2 className="text-lg font-black text-slate-950">
            Vous n&apos;avez pas trouvé votre réponse ?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Contactez directement SUGU KURA pour une question sur un produit, une commande ou une livraison.
          </p>
        </div>

        <Link
          href="/contact"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white transition hover:bg-[#e86100] sm:mt-0 sm:w-auto sm:shrink-0"
        >
          <MessageCircle size={17} />
          Nous contacter
        </Link>
      </section>

      <InfoPageNav />

      <div className="mt-7">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-[#0b4da2] hover:text-[#0b4da2]"
        >
          <ArrowLeft size={16} />
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
