import Link from "next/link";

import {
  BadgeDollarSign,
  Boxes,
  Megaphone,
  PackageCheck,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import {
  ownerFetch,
} from "@/lib/backend";

import {
  formatMoney,
} from "@/lib/format";

import type {
  DashboardSummary,
} from "@/types/owner";


export default async function DashboardPage() {
  const data =
    await ownerFetch<DashboardSummary>(
      "/owner/dashboard/",
    );

  const cards = [
    {
      label:
        "Commandes aujourd'hui",
      value:
        data.orders.today,
      icon:
        ShoppingCart,
    },

    {
      label:
        "Commandes en attente",
      value:
        data.orders.pending,
      icon:
        PackageCheck,
    },

    {
      label:
        "Revenus encaissés",
      value:
        formatMoney(
          data.money
            .paid_revenue,
        ),
      icon:
        BadgeDollarSign,
    },

    {
      label:
        "Montant à encaisser",
      value:
        formatMoney(
          data.money
            .pending_amount,
        ),
      icon:
        TrendingUp,
    },

    {
      label:
        "Stocks faibles",
      value:
        data.inventory
          .low_stock,
      icon:
        Boxes,
    },

    {
      label:
        "Ruptures",
      value:
        data.inventory
          .out_of_stock,
      icon:
        Boxes,
    },
  ];

  return (
    <>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
          Vue propriétaire
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Tableau de bord
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          État général de SUGU KURA
          en temps réel.
        </p>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(
          ({
            label,
            value,
            icon: Icon,
          }) => (
            <article
              key={label}
              className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00]">
                <Icon
                  size={21}
                />
              </div>

              <p className="mt-5 text-xs font-bold text-slate-400">
                {label}
              </p>

              <strong className="mt-1 block text-2xl font-black text-slate-950">
                {value}
              </strong>
            </article>
          ),
        )}
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">
            Catalogue
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <span className="text-xs text-slate-400">
                Produits
              </span>

              <strong className="mt-1 block text-xl">
                {
                  data.catalog
                    .products
                }
              </strong>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <span className="text-xs text-slate-400">
                Produits actifs
              </span>

              <strong className="mt-1 block text-xl">
                {
                  data.catalog
                    .active_products
                }
              </strong>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <span className="text-xs text-slate-400">
                Catégories
              </span>

              <strong className="mt-1 block text-xl">
                {
                  data.catalog
                    .categories
                }
              </strong>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <span className="text-xs text-slate-400">
                Marques
              </span>

              <strong className="mt-1 block text-xl">
                {
                  data.catalog
                    .brands
                }
              </strong>
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Megaphone
              className="text-[#0b4da2]"
            />

            <h2 className="text-xl font-black">
              Marketing
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-blue-50 p-4">
              <span className="text-xs text-slate-500">
                Publicités actives
              </span>

              <strong className="mt-1 block text-xl">
                {
                  data.marketing
                    .active_ads
                }
              </strong>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <span className="text-xs text-slate-500">
                Promotions
              </span>

              <strong className="mt-1 block text-xl">
                {
                  data.marketing
                    .active_promotions
                }
              </strong>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <span className="text-xs text-slate-500">
                Impressions
              </span>

              <strong className="mt-1 block text-xl">
                {
                  data.marketing
                    .impressions
                }
              </strong>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <span className="text-xs text-slate-500">
                CTR
              </span>

              <strong className="mt-1 block text-xl">
                {
                  data.marketing
                    .ctr
                }%
              </strong>
            </div>
          </div>

          <Link
            href="/publicites"
            className="mt-5 inline-flex text-sm font-black text-[#0b4da2]"
          >
            Gérer les publicités →
          </Link>
        </article>
      </section>
    </>
  );
}