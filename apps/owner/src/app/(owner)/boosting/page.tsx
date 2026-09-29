import Image from "next/image";
import Link from "next/link";

import {
  BadgeDollarSign,
  BarChart3,
  Camera,
  ExternalLink,
  MapPin,
  MessageCircle,
  Rocket,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  WalletCards,
} from "lucide-react";

import {
  ownerFetch,
} from "@/lib/backend";

import {
  formatMoney,
} from "@/lib/format";

import type {
  OwnerProduct,
} from "@/types/catalogue";


interface BoostingPageProps {
  searchParams: Promise<{
    product?: string;
  }>;
}


const objectiveOptions = [
  {
    value: "sales",
    label: "Ventes sur SUGU KURA",
    description: "Envoyer les clients vers la fiche produit et mesurer les commandes.",
    icon: Target,
  },
  {
    value: "whatsapp",
    label: "Messages WhatsApp",
    description: "Encourager les clients à démarrer une conversation commerciale.",
    icon: MessageCircle,
  },
  {
    value: "traffic",
    label: "Visites de la boutique",
    description: "Augmenter les visites qualifiées vers SUGU KURA.",
    icon: Sparkles,
  },
];


export default async function BoostingPage({
  searchParams,
}: BoostingPageProps) {
  const params = await searchParams;
  const productId = Number(params.product ?? "");

  let product: OwnerProduct | null = null;

  if (
    Number.isInteger(productId)
    && productId > 0
  ) {
    try {
      product = await ownerFetch<OwnerProduct>(
        `/owner/catalog/products/${productId}/`,
      );
    } catch {
      product = null;
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-xl shadow-slate-900/10">
        <div className="grid gap-7 p-6 sm:p-8 xl:grid-cols-[1.3fr_0.7fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
              <Rocket size={14} />
              Marketing performance
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
              Booster mes produits
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Préparez vos campagnes Facebook, Instagram ou WhatsApp sans mélanger vos propres dépenses marketing avec les publicités partenaires diffusées sur SUGU KURA.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-black">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                <Share2 size={15} /> Facebook
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                <Camera size={15} /> Instagram
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                <MessageCircle size={15} /> WhatsApp
              </span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff6b00] text-white">
                <ShieldCheck size={20} />
              </span>
              <div>
                <strong className="block text-sm font-black">
                  Paiement géré directement par Meta
                </strong>
                <span className="text-xs text-slate-400">
                  SUGU KURA ne stocke aucune donnée bancaire.
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-300">
              Le budget est facturé par Meta sur le moyen de paiement de votre compte publicitaire. SUGU KURA prépare le boost et centralisera ensuite son suivi marketing.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b00]">
            <BadgeDollarSign size={18} />
          </span>
          <span className="mt-4 block text-xs font-bold text-slate-400">Budget dépensé</span>
          <strong className="mt-1 block text-xl font-black text-slate-950">0 FCFA</strong>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b00]">
            <BarChart3 size={18} />
          </span>
          <span className="mt-4 block text-xs font-bold text-slate-400">Impressions</span>
          <strong className="mt-1 block text-xl font-black text-slate-950">0</strong>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b00]">
            <Target size={18} />
          </span>
          <span className="mt-4 block text-xs font-bold text-slate-400">Commandes attribuées</span>
          <strong className="mt-1 block text-xl font-black text-slate-950">0</strong>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b00]">
            <WalletCards size={18} />
          </span>
          <span className="mt-4 block text-xs font-bold text-slate-400">CA attribué</span>
          <strong className="mt-1 block text-xl font-black text-slate-950">0 FCFA</strong>
        </div>
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff6b00]">
                Produit sélectionné
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                {product ? product.name : "Choisissez un produit"}
              </h2>
            </div>
            <Rocket className="text-[#0b4da2]" size={24} />
          </div>

          {product ? (
            <div className="mt-5">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[22px] bg-slate-100">
                {product.primary_image_url ? (
                  <Image
                    src={product.primary_image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1280px) 100vw, 40vw"
                    className="object-contain p-3"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-black text-slate-400">
                    Aucune photo principale
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0b4da2]">
                  {product.category_name}
                </span>
                <strong className="mt-2 block text-2xl font-black text-[#ff6b00]">
                  {formatMoney(product.base_price)}
                </strong>
                <span className="mt-1 block text-xs text-slate-500">
                  Stock disponible : {product.stock_available}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <Rocket className="mx-auto text-slate-300" size={30} />
              <p className="mt-3 text-sm font-bold text-slate-500">
                Ouvrez le catalogue puis cliquez sur « Booster ce produit ».
              </p>
              <Link
                href="/catalogue/produits"
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-xs font-black text-white"
              >
                Choisir un produit
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b4da2]">
                Préparer la campagne
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                Paramètres du boost
              </h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
              Aucun débit automatique
            </span>
          </div>

          <form className="mt-6 grid gap-5">
            <div>
              <span className="text-xs font-black text-slate-700">Objectif</span>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                {objectiveOptions.map((option, index) => {
                  const Icon = option.icon;

                  return (
                    <label
                      key={option.value}
                      className="cursor-pointer rounded-2xl border border-slate-200 p-4 transition hover:border-orange-300 hover:bg-orange-50/40"
                    >
                      <input
                        type="radio"
                        name="objective"
                        value={option.value}
                        defaultChecked={index === 0}
                        className="sr-only"
                      />
                      <Icon size={18} className="text-[#ff6b00]" />
                      <strong className="mt-3 block text-xs font-black text-slate-900">
                        {option.label}
                      </strong>
                      <span className="mt-1 block text-[10px] leading-4 text-slate-500">
                        {option.description}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-black text-slate-700">
                Texte publicitaire
                <textarea
                  rows={4}
                  defaultValue={
                    product
                      ? `Découvrez ${product.name} sur SUGU KURA. Commandez simplement et profitez d'une livraison rapide.`
                      : "Découvrez ce produit sur SUGU KURA. Commandez simplement et profitez d'une livraison rapide."
                  }
                  className="min-h-28 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#ff6b00] focus:bg-white"
                />
              </label>

              <div className="grid gap-4">
                <label className="grid gap-2 text-xs font-black text-slate-700">
                  Zone cible
                  <span className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      defaultValue="Bamako, Mali"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#ff6b00] focus:bg-white"
                    />
                  </span>
                </label>

                <label className="grid gap-2 text-xs font-black text-slate-700">
                  Plateformes
                  <select className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#ff6b00] focus:bg-white">
                    <option>Facebook + Instagram</option>
                    <option>Facebook seulement</option>
                    <option>Instagram seulement</option>
                    <option>Messages WhatsApp</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-black text-slate-700">
                Budget journalier
                <span className="relative">
                  <BadgeDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="number"
                    min="500"
                    step="500"
                    defaultValue="5000"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-20 text-sm font-black text-slate-900 outline-none transition focus:border-[#ff6b00] focus:bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                    FCFA / jour
                  </span>
                </span>
              </label>

              <label className="grid gap-2 text-xs font-black text-slate-700">
                Durée
                <span className="relative">
                  <TimerReset className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-[#ff6b00] focus:bg-white">
                    <option>3 jours</option>
                    <option>5 jours</option>
                    <option>7 jours</option>
                    <option>14 jours</option>
                    <option>30 jours</option>
                  </select>
                </span>
              </label>
            </div>

            <div className="rounded-[22px] border border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-3">
                <WalletCards className="mt-0.5 shrink-0 text-[#0b4da2]" size={20} />
                <div>
                  <strong className="text-xs font-black text-[#0b4da2]">
                    Paiement du boosting
                  </strong>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Meta Ads Manager gère votre moyen de paiement, sa facturation et le débit réel de la campagne. SUGU KURA ne prélève pas le budget publicitaire.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://adsmanager.facebook.com/"
                target="_blank"
                rel="noreferrer"
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black text-white shadow-lg transition ${
                  product
                    ? "bg-[#0b4da2] shadow-blue-900/10 hover:bg-[#083b7f]"
                    : "pointer-events-none bg-slate-300 shadow-none"
                }`}
              >
                <Rocket size={17} />
                Continuer dans Meta Ads Manager
                <ExternalLink size={15} />
              </a>

              <a
                href="https://business.facebook.com/billing_hub"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <WalletCards size={17} />
                Gérer le paiement Meta
              </a>
            </div>
          </form>
        </div>
      </section>

      <section className="mt-7 rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff6b00]">
              Suivi des campagnes
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              Historique des boosts
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500">
            Connexion Meta API à venir
          </span>
        </div>

        <div className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <BarChart3 className="mx-auto text-slate-300" size={30} />
          <p className="mt-3 text-sm font-black text-slate-600">
            Les performances Meta apparaîtront ici après connexion du compte publicitaire.
          </p>
          <p className="mx-auto mt-1 max-w-2xl text-xs leading-5 text-slate-400">
            La prochaine étape technique sera Meta Pixel + Conversions API, puis la synchronisation des campagnes et dépenses depuis Meta Marketing API.
          </p>
        </div>
      </section>
    </>
  );
}
