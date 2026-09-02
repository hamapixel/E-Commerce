import Image from "next/image";

import {
  BarChart3,
  ExternalLink,
  Megaphone,
  MousePointerClick,
  Plus,
  Trash2,
} from "lucide-react";

import {
  deleteAdvertisementAction,
  toggleAdvertisementAction,
} from "@/actions/advertisements";

import {
  AdvertisementForm,
} from "@/components/advertisements/advertisement-form";

import {
  ownerFetch,
} from "@/lib/backend";

import {
  formatMoney,
} from "@/lib/format";

import type {
  AdvertisementMetadata,
  AdvertisementRecord,
  MarketingSummary,
} from "@/types/owner";


function formatDate(
  value: string,
) {
  return new Intl
    .DateTimeFormat(
      "fr-FR",
      {
        dateStyle:
          "medium",
        timeStyle:
          "short",
      },
    )
    .format(
      new Date(
        value,
      ),
    );
}


export default async function AdvertisementsPage() {
  const [
    advertisements,
    summary,
    metadata,
  ] = await Promise.all([
    ownerFetch<
      AdvertisementRecord[]
    >(
      "/owner/advertisements/",
    ),

    ownerFetch<
      MarketingSummary
    >(
      "/owner/marketing/summary/",
    ),

    ownerFetch<
      AdvertisementMetadata
    >(
      "/owner/advertisements/metadata/",
    ),
  ]);


  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Marketing
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Publicités
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Créez, programmez, prévisualisez
            et mesurez les publicités affichées
            dans SUGU KURA.
          </p>
        </div>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [
            "Actives",
            String(
              summary.active_ads,
            ),
          ],
          [
            "Impressions",
            String(
              summary.impressions,
            ),
          ],
          [
            "Clics",
            String(
              summary.clicks,
            ),
          ],
          [
            "CTR",
            `${summary.ctr}%`,
          ],
          [
            "Revenus",
            formatMoney(
              summary.revenue,
            ),
          ],
        ].map(
          (
            [
              label,
              value,
            ],
          ) => (
            <div
              key={
                label
              }
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="text-xs text-slate-400">
                {label}
              </span>

              <strong className="mt-1 block text-xl text-slate-950">
                {value}
              </strong>
            </div>
          ),
        )}
      </section>

      <details
        open={
          advertisements.length ===
          0
        }
        className="group mt-7 rounded-[24px] border border-orange-200 bg-orange-50/40 p-4 sm:p-5"
      >
        <summary className="flex cursor-pointer list-none items-center gap-3 font-black text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6b00] text-white">
            <Plus
              size={18}
            />
          </span>

          Nouvelle publicité
        </summary>

        <div className="mt-5">
          <AdvertisementForm
            metadata={
              metadata
            }
            compact
          />
        </div>
      </details>

      <div className="mt-7 grid gap-5">
        {advertisements.length ===
          0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Megaphone
              className="mx-auto text-slate-300"
              size={34}
            />

            <p className="mt-3 text-sm font-bold text-slate-500">
              Aucune publicité configurée.
            </p>
          </div>
        )}

        {advertisements.map(
          (
            advertisement,
          ) => {
            const expired =
              advertisement
                .has_expired;

            const statusLabel =
              advertisement
                .is_current
                ? "En diffusion"
                : expired
                  ? "Expirée"
                  : advertisement
                      .is_active
                    ? "Programmée"
                    : "Inactive";

            const statusClass =
              advertisement
                .is_current
                ? (
                  "bg-emerald-50 "
                  + "text-emerald-700"
                )
                : expired
                  ? (
                    "bg-slate-100 "
                    + "text-slate-500"
                  )
                  : advertisement
                      .is_active
                    ? (
                      "bg-blue-50 "
                      + "text-[#0b4da2]"
                    )
                    : (
                      "bg-red-50 "
                      + "text-red-600"
                    );

            return (
              <article
                key={
                  advertisement.id
                }
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid lg:grid-cols-[340px_1fr]">
                  <div className="relative min-h-56 bg-slate-100">
                    {advertisement
                      .desktop_image
                      ? (
                        <Image
                          src={
                            advertisement
                              .desktop_image
                          }
                          alt={
                            advertisement
                              .title
                          }
                          fill
                          sizes="(max-width: 1024px) 100vw, 340px"
                          className="object-contain p-3"
                        />
                      )
                      : (
                        <div className="flex h-full min-h-56 items-center justify-center text-sm font-black text-slate-300">
                          SUGU KURA
                        </div>
                      )
                    }
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#ff6b00]">
                          {
                            advertisement
                              .company_name
                          }
                        </span>

                        <h2 className="mt-1 text-xl font-black text-slate-950">
                          {
                            advertisement
                              .title
                          }
                        </h2>

                        <p className="mt-2 text-xs font-bold text-[#0b4da2]">
                          {
                            advertisement
                              .placement_label
                          }
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {advertisement
                      .text && (
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                        {
                          advertisement
                            .text
                        }
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <BarChart3
                          size={16}
                          className="text-[#0b4da2]"
                        />

                        <span className="mt-2 block text-[10px] text-slate-400">
                          Impressions
                        </span>

                        <strong className="text-sm">
                          {
                            advertisement
                              .stats
                              .impressions
                          }
                        </strong>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <MousePointerClick
                          size={16}
                          className="text-[#ff6b00]"
                        />

                        <span className="mt-2 block text-[10px] text-slate-400">
                          Clics
                        </span>

                        <strong className="text-sm">
                          {
                            advertisement
                              .stats
                              .clicks
                          }
                        </strong>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="block text-[10px] text-slate-400">
                          CTR
                        </span>

                        <strong className="mt-2 block text-sm">
                          {
                            advertisement
                              .stats
                              .ctr
                          }%
                        </strong>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <span className="block text-[10px] text-slate-400">
                          Période
                        </span>

                        <strong className="mt-2 block text-[10px] leading-4 text-slate-700">
                          {formatDate(
                            advertisement
                              .start_at,
                          )}
                          <br />
                          →{" "}
                          {formatDate(
                            advertisement
                              .end_at,
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <form
                        action={
                          toggleAdvertisementAction
                        }
                      >
                        <input
                          type="hidden"
                          name="advertisement_id"
                          value={
                            advertisement.id
                          }
                        />

                        <button
                          type="submit"
                          className={`h-10 rounded-xl px-4 text-xs font-black text-white ${
                            advertisement
                              .is_active
                              ? "bg-red-500"
                              : "bg-emerald-600"
                          }`}
                        >
                          {advertisement
                            .is_active
                            ? "Désactiver"
                            : "Activer"}
                        </button>
                      </form>

                      {advertisement
                        .effective_link && (
                        <a
                          href={
                            advertisement
                              .effective_link
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-600"
                        >
                          <ExternalLink
                            size={14}
                          />

                          Tester le lien
                        </a>
                      )}

                      <form
                        action={
                          deleteAdvertisementAction
                        }
                      >
                        <input
                          type="hidden"
                          name="advertisement_id"
                          value={
                            advertisement.id
                          }
                        />

                        <button
                          type="submit"
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-600"
                        >
                          <Trash2
                            size={14}
                          />

                          Supprimer
                        </button>
                      </form>
                    </div>

                    <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <summary className="cursor-pointer text-xs font-black text-[#0b4da2]">
                        Modifier cette publicité
                      </summary>

                      <div className="mt-5">
                        <AdvertisementForm
                          metadata={
                            metadata
                          }
                          advertisement={
                            advertisement
                          }
                          compact
                        />
                      </div>
                    </details>
                  </div>
                </div>
              </article>
            );
          },
        )}
      </div>
    </>
  );
}
