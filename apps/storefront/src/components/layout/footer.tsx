import Link from "next/link";

import {
  ArrowUpRight,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";

import {
  ScrollToTop,
} from "@/components/layout/scroll-to-top";

import {
  STORE_PHONE,
  phoneHref,
  whatsappHref,
} from "@/lib/store-contact";


export function Footer() {
  const callLink =
    phoneHref();

  const whatsappLink =
    whatsappHref();

  return (
    <footer className="relative mt-16 overflow-hidden bg-gradient-to-br from-[#04162f] via-[#061f43] to-[#0b4da2] pb-24 text-white lg:pb-0">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff6b00] via-orange-300 to-[#ff6b00]" />

      <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full bg-[#ff6b00]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-blue-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-4 pt-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-black tracking-tight"
            >
              <span className="rounded-xl bg-[#ff6b00] px-2.5 py-1 text-white">
                SUGU
              </span>
              <span>KURA</span>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-blue-100/80">
              Votre boutique moderne pour découvrir de bons produits, comparer les offres et commander simplement.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {callLink && (
                <a
                  href={callLink}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-xs font-black text-white transition hover:bg-white/15"
                >
                  <Phone size={16} />
                  {STORE_PHONE || "Appeler"}
                </a>
              )}

              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-xs font-black text-white transition hover:brightness-95"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-orange-300">
              Boutique
            </h3>

            <div className="mt-5 space-y-3 text-sm text-blue-100/80">
              <Link
                href="/#products"
                className="block transition hover:text-white"
              >
                Produits
              </Link>

              <Link
                href="/#categories"
                className="block transition hover:text-white"
              >
                Catégories
              </Link>

              <Link
                href="/#partners"
                className="block transition hover:text-white"
              >
                Partenaires
              </Link>

              <Link
                href="/favoris"
                className="block transition hover:text-white"
              >
                Mes favoris
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-orange-300">
              Assistance
            </h3>

            <div className="mt-5 space-y-3 text-sm text-blue-100/80">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 font-bold text-white transition hover:text-orange-300"
              >
                Nous contacter
                <ArrowUpRight size={14} />
              </Link>

              <p>
                Téléphone et WhatsApp disponibles depuis la page contact.
              </p>

              <p>
                Une question sur un produit ou une commande ? Notre équipe vous accompagne.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-orange-300">
              Votre confiance
            </h3>

            <div className="mt-5 grid gap-3">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Truck
                  size={19}
                  className="mt-0.5 shrink-0 text-orange-300"
                />

                <div>
                  <p className="text-sm font-black">
                    Livraison rapide
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-100/65">
                    Un parcours de commande simple et clair.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-orange-300"
                />

                <div>
                  <p className="text-sm font-black">
                    Achat en confiance
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-100/65">
                    Des informations produit lisibles et des avis clients.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 py-5 text-xs text-blue-100/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 SUGU KURA. Tous droits réservés.
          </p>

          <p>
            Shopping nouvelle génération.
          </p>
        </div>
      </div>

      <ScrollToTop />
    </footer>
  );
}
