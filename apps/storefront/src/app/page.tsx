import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowRight,
  BadgePercent,
  ShieldCheck,
  Truck,
} from "lucide-react";

import {
  CategoryGrid,
} from "@/components/home/category-grid";

import {
  HeroAdSlider,
} from "@/components/home/hero-ad-slider";

import {
  PartnerSlider,
} from "@/components/home/partner-slider";

import {
  ProductGrid,
} from "@/components/product/product-grid";

import {
  getHomeData,
} from "@/lib/api";

import {
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/seo";


export const dynamic =
  "force-dynamic";


export const metadata:
  Metadata = {
  title:
    "Téléphones, électronique, maison et technologie",

  description:
    SITE_DESCRIPTION,

  alternates: {
    canonical:
      "/",
  },

  openGraph: {
    type:
      "website",

    url:
      "/",

    siteName:
      SITE_NAME,

    title:
      "SUGU KURA — votre boutique en ligne",

    description:
      SITE_DESCRIPTION,
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "SUGU KURA — votre boutique en ligne",

    description:
      SITE_DESCRIPTION,
  },
};


export default async function Home() {
  const {
    categories,
    products,
    promotions,
    advertisements,
    partners,
  } = await getHomeData();


  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:py-7">

      {/* =====================================
          PUBLICITÉS
      ===================================== */}

      <HeroAdSlider
        advertisements={
          advertisements
        }
      />


      {/* =====================================
          PROMOTIONS EN COURS
      ===================================== */}

      {promotions.length >
        0 && (
        <section className="mt-4 flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff6b00] to-[#ff8a2a] px-4 py-3 text-white shadow-lg shadow-orange-100">

          <BadgePercent
            className="shrink-0"
            size={
              22
            }
          />


          <div className="min-w-0 flex-1">

            <p className="text-xs font-bold uppercase tracking-wider">
              Promotions en cours
            </p>


            <p className="truncate text-sm font-black">
              {
                promotions[
                  0
                ].name
              }
            </p>

          </div>


          <span className="shrink-0 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">

            {
              promotions.length
            }{" "}
            offre(s)

          </span>

        </section>
      )}


      {/* =====================================
          SERVICES
      ===================================== */}

      <section className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">

        {/* LIVRAISON */}

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:flex sm:items-center sm:gap-3 sm:p-4">

          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00] sm:mx-0">

            <Truck
              size={
                20
              }
            />

          </div>


          <div className="mt-2 text-center sm:mt-0 sm:text-left">

            <p className="text-[10px] font-black sm:text-sm">
              Livraison
            </p>


            <p className="hidden text-xs text-slate-500 sm:block">
              Service rapide
            </p>

          </div>

        </div>


        {/* QUALITÉ */}

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:flex sm:items-center sm:gap-3 sm:p-4">

          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0b4da2] sm:mx-0">

            <ShieldCheck
              size={
                20
              }
            />

          </div>


          <div className="mt-2 text-center sm:mt-0 sm:text-left">

            <p className="text-[10px] font-black sm:text-sm">
              Qualité
            </p>


            <p className="hidden text-xs text-slate-500 sm:block">
              Produits contrôlés
            </p>

          </div>

        </div>


        {/* BONS PRIX */}

        <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:flex sm:items-center sm:gap-3 sm:p-4">

          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00] sm:mx-0">

            <BadgePercent
              size={
                20
              }
            />

          </div>


          <div className="mt-2 text-center sm:mt-0 sm:text-left">

            <p className="text-[10px] font-black sm:text-sm">
              Bons prix
            </p>


            <p className="hidden text-xs text-slate-500 sm:block">
              Promos régulières
            </p>

          </div>

        </div>

      </section>


      {/* =====================================
          CATÉGORIES

          IMPORTANT :
          Ce ID permet au bouton mobile :
          /#categories
          de venir directement ici.
      ===================================== */}

      <section
        id="categories"
        className="scroll-mt-36"
      >

        <CategoryGrid
          categories={
            categories
          }
        />

      </section>


      {/* =====================================
          PRODUITS
      ===================================== */}

      <section
        id="products"
        className="mt-12 scroll-mt-36"
      >

        <div className="mb-5 flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
              Nouveautés
            </p>


            <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
              Découvrez nos produits
            </h2>

          </div>


          <Link
            href="/#products"
            className="hidden items-center gap-1 text-sm font-bold text-[#0b4da2] sm:flex"
          >

            Voir tout

            <ArrowRight
              size={
                16
              }
            />

          </Link>

        </div>


        <ProductGrid
          products={
            products
          }
        />

      </section>


      {/* =====================================
          PARTENAIRES
      ===================================== */}

      <PartnerSlider
        partners={
          partners
        }
      />

    </div>
  );
}