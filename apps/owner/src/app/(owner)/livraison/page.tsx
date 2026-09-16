import {
  MapPin,
  Pencil,
  Power,
  Truck,
} from "lucide-react";

import {
  createDeliveryZoneAction,
  toggleDeliveryZoneAction,
  updateDeliveryZoneAction,
} from "@/actions/delivery-zones";

import {
  ownerFetch,
} from "@/lib/backend";


interface DeliveryZone {
  id: number;
  name: string;
  city: string;
  fee: string;
  estimated_delivery: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}


interface PageProps {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
}


function money(
  value: string,
) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    },
  ).format(
    Number(value),
  );
}


export default async function DeliveryPage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams;

  const zones =
    await ownerFetch<DeliveryZone[]>(
      "/owner/delivery-zones/",
    );

  const activeCount =
    zones.filter(
      (zone) =>
        zone.is_active,
    ).length;


  return (
    <>
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff6b00]">
              Livraison
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-950">
              Zones & tarifs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Définissez les quartiers desservis et leurs frais. Le client verra automatiquement le bon tarif au checkout.
            </p>
          </div>

          <div className="flex gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-[#0b4da2]">
              {zones.length} zone(s)
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
              {activeCount} active(s)
            </span>
          </div>
        </div>

        {params.success && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            {params.success}
          </div>
        )}

        {params.error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {params.error}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b00]">
            <MapPin size={20} />
          </span>

          <div>
            <h2 className="text-lg font-black text-slate-950">
              Ajouter une zone
            </h2>

            <p className="text-xs text-slate-500">
              Exemple : Bozola — Bamako — 1 500 F CFA.
            </p>
          </div>
        </div>

        <form
          action={
            createDeliveryZoneAction
          }
          className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5"
        >
          <label>
            <span className="text-xs font-black text-slate-600">
              Zone / quartier *
            </span>

            <input
              name="name"
              required
              placeholder="Bozola"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label>
            <span className="text-xs font-black text-slate-600">
              Ville *
            </span>

            <input
              name="city"
              required
              defaultValue="Bamako"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label>
            <span className="text-xs font-black text-slate-600">
              Tarif F CFA *
            </span>

            <input
              name="fee"
              type="number"
              min="0"
              step="1"
              required
              defaultValue="0"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label>
            <span className="text-xs font-black text-slate-600">
              Délai indicatif
            </span>

            <input
              name="estimated_delivery"
              placeholder="30 à 60 min"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label>
            <span className="text-xs font-black text-slate-600">
              Ordre
            </span>

            <input
              name="display_order"
              type="number"
              min="0"
              defaultValue="0"
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
            />
          </label>

          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4 md:col-span-2">
            <input
              name="is_active"
              type="checkbox"
              defaultChecked
            />

            <span className="text-xs font-black">
              Zone active et visible au client
            </span>
          </label>

          <div className="md:col-span-2 xl:col-span-3 xl:text-right">
            <button
              type="submit"
              className="h-12 rounded-xl bg-[#ff6b00] px-6 text-sm font-black text-white transition hover:bg-[#e85f00]"
            >
              Ajouter la zone
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6">
        <div className="flex items-center gap-2">
          <Truck
            size={20}
            className="text-[#0b4da2]"
          />

          <h2 className="text-xl font-black text-slate-950">
            Zones configurées
          </h2>
        </div>

        {zones.length === 0 ? (
          <div className="mt-4 rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Aucune zone configurée. Tant qu'il n'y en a pas, le checkout reste compatible avec la saisie manuelle du quartier et applique 0 F de livraison.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {zones.map(
              (zone) => {
                const updateAction =
                  updateDeliveryZoneAction.bind(
                    null,
                    zone.id,
                  );

                const toggleAction =
                  toggleDeliveryZoneAction.bind(
                    null,
                    zone.id,
                    zone.is_active,
                  );

                return (
                  <article
                    key={zone.id}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="text-lg text-slate-950">
                            {zone.name}
                          </strong>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                              zone.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {zone.is_active
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-bold text-[#0b4da2]">
                          {zone.city}
                          {" · "}
                          {money(
                            zone.fee,
                          )}
                        </p>

                        {zone.estimated_delivery && (
                          <p className="mt-1 text-xs text-slate-500">
                            Délai :{" "}
                            {zone.estimated_delivery}
                          </p>
                        )}
                      </div>

                      <form
                        action={
                          toggleAction
                        }
                      >
                        <button
                          type="submit"
                          className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-600 transition hover:border-[#0b4da2] hover:text-[#0b4da2]"
                        >
                          <Power size={15} />
                          {zone.is_active
                            ? "Désactiver"
                            : "Activer"}
                        </button>
                      </form>
                    </div>

                    <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-black text-slate-700">
                        <Pencil size={15} />
                        Modifier la zone
                      </summary>

                      <form
                        action={
                          updateAction
                        }
                        className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5"
                      >
                        <label>
                          <span className="text-xs font-black text-slate-600">
                            Zone
                          </span>

                          <input
                            name="name"
                            required
                            defaultValue={
                              zone.name
                            }
                            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
                          />
                        </label>

                        <label>
                          <span className="text-xs font-black text-slate-600">
                            Ville
                          </span>

                          <input
                            name="city"
                            required
                            defaultValue={
                              zone.city
                            }
                            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
                          />
                        </label>

                        <label>
                          <span className="text-xs font-black text-slate-600">
                            Tarif F CFA
                          </span>

                          <input
                            name="fee"
                            type="number"
                            min="0"
                            step="1"
                            required
                            defaultValue={
                              Number(
                                zone.fee,
                              )
                            }
                            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
                          />
                        </label>

                        <label>
                          <span className="text-xs font-black text-slate-600">
                            Délai
                          </span>

                          <input
                            name="estimated_delivery"
                            defaultValue={
                              zone.estimated_delivery
                            }
                            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
                          />
                        </label>

                        <label>
                          <span className="text-xs font-black text-slate-600">
                            Ordre
                          </span>

                          <input
                            name="display_order"
                            type="number"
                            min="0"
                            defaultValue={
                              zone.display_order
                            }
                            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
                          />
                        </label>

                        <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 md:col-span-2">
                          <input
                            name="is_active"
                            type="checkbox"
                            defaultChecked={
                              zone.is_active
                            }
                          />
                          <span className="text-xs font-black">
                            Active
                          </span>
                        </label>

                        <div className="md:col-span-2 xl:col-span-3 xl:text-right">
                          <button
                            type="submit"
                            className="h-11 rounded-xl bg-[#0b4da2] px-5 text-xs font-black text-white"
                          >
                            Enregistrer les modifications
                          </button>
                        </div>
                      </form>
                    </details>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>
    </>
  );
}
