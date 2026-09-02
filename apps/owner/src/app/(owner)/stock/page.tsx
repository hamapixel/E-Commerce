import Link from "next/link";

import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Boxes,
  CheckCircle2,
  CircleAlert,
  PackageCheck,
  PackageOpen,
  Settings2,
  Warehouse,
} from "lucide-react";

import {
  adjustStockAction,
  receiveStockAction,
  removeStockAction,
  updateStockThresholdAction,
} from "@/actions/stock";

import StockSearch from "@/components/stock/stock-search";

import {
  ownerFetch,
} from "@/lib/backend";


// ============================================================
// TYPES
// ============================================================

interface InventorySummary {
  total_items: number;

  in_stock: number;

  low_stock: number;

  out_of_stock: number;

  total_on_hand: number;

  total_reserved: number;

  total_available: number;
}


interface InventoryRecord {
  id: number;

  product_id: number;

  product_name: string;

  sku: string;

  barcode: string;

  variant: string;

  quantity_on_hand: number;

  quantity_reserved: number;

  available: number;

  low_stock_threshold: number;

  status:
    | "IN_STOCK"
    | "LOW_STOCK"
    | "OUT_OF_STOCK";

  updated_at: string;
}


interface InventoryResponse {
  summary: InventorySummary;

  count: number;

  page: number;

  page_size: number;

  total_pages: number;

  results: InventoryRecord[];
}


interface StockPageProps {
  searchParams: Promise<{
    q?: string;

    status?: string;

    page?: string;

    stock_updated?: string;

    operation?: string;
  }>;
}


// ============================================================
// URL
// ============================================================

function makeStockUrl({
  q,
  status,
  page,
}: {
  q?: string;
  status?: string;
  page?: number;
}) {
  const params =
    new URLSearchParams();


  if (q) {
    params.set(
      "q",
      q,
    );
  }


  if (status) {
    params.set(
      "status",
      status,
    );
  }


  if (
    page
    &&
    page > 1
  ) {
    params.set(
      "page",
      String(page),
    );
  }


  const query =
    params.toString();


  return query
    ? `/stock?${query}`
    : "/stock";
}


// ============================================================
// PAGE
// ============================================================

export default async function StockPage({
  searchParams,
}: StockPageProps) {
  const params =
    await searchParams;


  const q =
    (
      params.q ??
      ""
    ).trim();


  const allowedStatuses = [
    "IN_STOCK",
    "LOW_STOCK",
    "OUT_OF_STOCK",
  ];


  const selectedStatus =
    allowedStatuses.includes(
      params.status ?? "",
    )
      ? params.status ?? ""
      : "";


  const requestedPage =
    Math.max(
      1,
      Number(
        params.page ?? "1",
      ) || 1,
    );


  const apiParams =
    new URLSearchParams();


  if (q) {
    apiParams.set(
      "q",
      q,
    );
  }


  if (selectedStatus) {
    apiParams.set(
      "status",
      selectedStatus,
    );
  }


  apiParams.set(
    "page",
    String(
      requestedPage,
    ),
  );


  apiParams.set(
    "page_size",
    "20",
  );


  const data =
    await ownerFetch<
      InventoryResponse
    >(
      `/owner/inventory/?${apiParams.toString()}`,
    );


  const returnTo =
    makeStockUrl({
      q,
      status:
        selectedStatus,
      page:
        data.page,
    });


  const successLabel =
    params.operation ===
    "receive"
      ? "Entrée de stock enregistrée."
      : params.operation ===
          "remove"
        ? "Sortie de stock enregistrée."
        : params.operation ===
            "adjust"
          ? "Inventaire ajusté avec succès."
          : params.operation ===
              "threshold"
            ? "Seuil d’alerte modifié."
            : "Stock mis à jour.";


  return (
    <>
      {/* =========================================
          HEADER
      ========================================= */}

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Inventaire
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Gestion du stock
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Consultez les quantités
            disponibles, ajoutez les
            arrivages, enregistrez les
            sorties et corrigez le stock
            après inventaire.
          </p>
        </div>


        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b4da2] text-white shadow-sm">
          <Warehouse
            size={22}
          />
        </div>
      </div>


      {/* =========================================
          SUCCÈS
      ========================================= */}

      {params.stock_updated ===
        "1" && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">

          <CheckCircle2
            size={18}
            className="shrink-0"
          />

          {successLabel}
        </div>
      )}


      {/* =========================================
          RÉSUMÉ
      ========================================= */}

      <section className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex items-center gap-2 text-slate-400">
            <Boxes
              size={16}
            />

            <span className="text-[10px] font-black uppercase">
              Lignes stock
            </span>
          </div>

          <strong className="mt-3 block text-2xl font-black text-slate-950">
            {
              data.summary
                .total_items
            }
          </strong>
        </article>


        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

          <div className="flex items-center gap-2 text-emerald-600">
            <PackageCheck
              size={16}
            />

            <span className="text-[10px] font-black uppercase">
              Disponibles
            </span>
          </div>

          <strong className="mt-3 block text-2xl font-black text-emerald-700">
            {
              data.summary
                .total_available
            }
          </strong>
        </article>


        <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4">

          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle
              size={16}
            />

            <span className="text-[10px] font-black uppercase">
              Stock faible
            </span>
          </div>

          <strong className="mt-3 block text-2xl font-black text-orange-700">
            {
              data.summary
                .low_stock
            }
          </strong>
        </article>


        <article className="rounded-2xl border border-red-200 bg-red-50 p-4">

          <div className="flex items-center gap-2 text-red-600">
            <CircleAlert
              size={16}
            />

            <span className="text-[10px] font-black uppercase">
              Ruptures
            </span>
          </div>

          <strong className="mt-3 block text-2xl font-black text-red-700">
            {
              data.summary
                .out_of_stock
            }
          </strong>
        </article>
      </section>


      {/* =========================================
          PHYSIQUE / RÉSERVÉ
      ========================================= */}

      <section className="mt-3 grid gap-3 sm:grid-cols-2">

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <span className="text-[10px] font-black uppercase text-slate-400">
            Stock physique total
          </span>

          <strong className="mt-2 block text-xl font-black">
            {
              data.summary
                .total_on_hand
            }
          </strong>
        </article>


        <article className="rounded-2xl border border-blue-100 bg-blue-50 p-4">

          <span className="text-[10px] font-black uppercase text-[#0b4da2]">
            Stock réservé commandes
          </span>

          <strong className="mt-2 block text-xl font-black text-[#0b4da2]">
            {
              data.summary
                .total_reserved
            }
          </strong>
        </article>
      </section>


      {/* =========================================
          RECHERCHE INSTANTANÉE
      ========================================= */}

      <StockSearch
        initialQuery={q}
        initialStatus={selectedStatus}
      />


      {/* =========================================
          LISTE
      ========================================= */}

      <section className="mt-5 grid gap-4">

        {data.results.length ===
          0 && (
          <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center shadow-sm">

            <PackageOpen
              size={34}
              className="mx-auto text-slate-300"
            />

            <strong className="mt-4 block text-slate-700">
              Aucun stock trouvé
            </strong>

            <p className="mt-2 text-xs text-slate-400">
              Modifiez votre recherche
              ou vos filtres.
            </p>
          </div>
        )}


        {data.results.map(
          (item) => {
            const receiveAction =
              receiveStockAction.bind(
                null,
                item.id,
              );


            const removeAction =
              removeStockAction.bind(
                null,
                item.id,
              );


            const adjustAction =
              adjustStockAction.bind(
                null,
                item.id,
              );


            const thresholdAction =
              updateStockThresholdAction.bind(
                null,
                item.id,
              );


            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
              >

                {/* =============================
                    PRODUIT
                ============================= */}

                <div className="p-5 sm:p-6">

                  <div className="flex flex-wrap items-start justify-between gap-3">

                    <div className="min-w-0">

                      <Link
                        href={`/catalogue/produits/${item.product_id}/modifier`}
                        className="text-base font-black text-slate-950 transition hover:text-[#0b4da2] sm:text-lg"
                      >
                        {
                          item.product_name
                        }
                      </Link>


                      <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold">

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                          SKU : {
                            item.sku
                          }
                        </span>


                        {item.variant && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[#0b4da2]">
                            Variante :{" "}
                            {
                              item.variant
                            }
                          </span>
                        )}


                        {item.barcode && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">
                            {
                              item.barcode
                            }
                          </span>
                        )}
                      </div>
                    </div>


                    <span
                      className={`h-fit rounded-full px-3 py-1.5 text-[10px] font-black ${
                        item.status ===
                        "OUT_OF_STOCK"
                          ? "bg-red-50 text-red-600"
                          : item.status ===
                              "LOW_STOCK"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {item.status ===
                      "OUT_OF_STOCK"
                        ? "Rupture"
                        : item.status ===
                            "LOW_STOCK"
                          ? "Stock faible"
                          : "En stock"}
                    </span>
                  </div>


                  {/* =============================
                      CHIFFRES
                  ============================= */}

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    <div className="rounded-xl bg-slate-50 p-3">

                      <span className="text-[10px] font-bold text-slate-400">
                        Physique
                      </span>

                      <strong className="mt-1 block text-xl font-black text-slate-950">
                        {
                          item.quantity_on_hand
                        }
                      </strong>
                    </div>


                    <div className="rounded-xl bg-blue-50 p-3">

                      <span className="text-[10px] font-bold text-[#0b4da2]">
                        Réservé
                      </span>

                      <strong className="mt-1 block text-xl font-black text-[#0b4da2]">
                        {
                          item.quantity_reserved
                        }
                      </strong>
                    </div>


                    <div className="rounded-xl bg-emerald-50 p-3">

                      <span className="text-[10px] font-bold text-emerald-600">
                        Disponible
                      </span>

                      <strong className="mt-1 block text-xl font-black text-emerald-700">
                        {
                          item.available
                        }
                      </strong>
                    </div>


                    <div className="rounded-xl bg-orange-50 p-3">

                      <span className="text-[10px] font-bold text-orange-600">
                        Seuil
                      </span>

                      <strong className="mt-1 block text-xl font-black text-orange-700">
                        {
                          item.low_stock_threshold
                        }
                      </strong>
                    </div>
                  </div>
                </div>


                {/* =============================
                    ACTIONS
                ============================= */}

                <details className="border-t border-slate-100 bg-slate-50">

                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-xs font-black text-[#0b4da2] sm:px-6">

                    <span className="flex items-center gap-2">
                      <Settings2
                        size={16}
                      />

                      Gérer ce stock
                    </span>

                    <span className="text-[10px] text-slate-400">
                      Entrée · Sortie · Inventaire
                    </span>
                  </summary>


                  <div className="grid gap-4 border-t border-slate-200 p-4 sm:p-5 xl:grid-cols-2">

                    {/* =========================
                        ENTRÉE
                    ========================= */}

                    <form
                      action={
                        receiveAction
                      }
                      className="rounded-2xl border border-emerald-200 bg-white p-4"
                    >

                      <input
                        type="hidden"
                        name="return_to"
                        value={
                          returnTo
                        }
                      />


                      <div className="flex items-center gap-2 text-emerald-700">

                        <ArrowDown
                          size={18}
                        />

                        <strong className="text-sm">
                          Entrée de stock
                        </strong>
                      </div>


                      <p className="mt-1 text-[10px] leading-5 text-slate-400">
                        Réception fournisseur,
                        nouvel arrivage ou
                        réapprovisionnement.
                      </p>


                      <div className="mt-4 grid gap-3">

                        <input
                          name="quantity"
                          type="number"
                          min="1"
                          step="1"
                          required
                          placeholder="Quantité à ajouter"
                          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
                        />


                        <input
                          name="reference"
                          placeholder="Référence, ex : LIV-001"
                          className="h-11 rounded-xl border border-slate-200 px-3 text-xs outline-none"
                        />


                        <textarea
                          name="note"
                          rows={2}
                          placeholder="Note facultative"
                          className="rounded-xl border border-slate-200 p-3 text-xs outline-none"
                        />


                        <button
                          type="submit"
                          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white"
                        >
                          <ArrowDown
                            size={15}
                          />

                          Ajouter au stock
                        </button>
                      </div>
                    </form>


                    {/* =========================
                        SORTIE
                    ========================= */}

                    <form
                      action={
                        removeAction
                      }
                      className="rounded-2xl border border-red-200 bg-white p-4"
                    >

                      <input
                        type="hidden"
                        name="return_to"
                        value={
                          returnTo
                        }
                      />


                      <div className="flex items-center gap-2 text-red-600">

                        <ArrowUp
                          size={18}
                        />

                        <strong className="text-sm">
                          Sortie de stock
                        </strong>
                      </div>


                      <p className="mt-1 text-[10px] leading-5 text-slate-400">
                        Casse, perte, utilisation
                        interne ou autre sortie
                        hors commande.
                      </p>


                      <div className="mt-4 grid gap-3">

                        <input
                          name="quantity"
                          type="number"
                          min="1"
                          max={
                            Math.max(
                              item.available,
                              0,
                            )
                          }
                          step="1"
                          required
                          disabled={
                            item.available <=
                            0
                          }
                          placeholder="Quantité à retirer"
                          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none disabled:bg-slate-100 disabled:text-slate-300"
                        />


                        <input
                          name="reference"
                          placeholder="Référence"
                          className="h-11 rounded-xl border border-slate-200 px-3 text-xs outline-none"
                        />


                        <textarea
                          name="note"
                          rows={2}
                          placeholder="Motif de la sortie"
                          className="rounded-xl border border-slate-200 p-3 text-xs outline-none"
                        />


                        <button
                          type="submit"
                          disabled={
                            item.available <=
                            0
                          }
                          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          <ArrowUp
                            size={15}
                          />

                          Retirer du stock
                        </button>
                      </div>
                    </form>


                    {/* =========================
                        INVENTAIRE
                    ========================= */}

                    <form
                      action={
                        adjustAction
                      }
                      className="rounded-2xl border border-blue-200 bg-white p-4"
                    >

                      <input
                        type="hidden"
                        name="return_to"
                        value={
                          returnTo
                        }
                      />


                      <div className="flex items-center gap-2 text-[#0b4da2]">

                        <Warehouse
                          size={18}
                        />

                        <strong className="text-sm">
                          Inventaire physique
                        </strong>
                      </div>


                      <p className="mt-1 text-[10px] leading-5 text-slate-400">
                        Indiquez la quantité
                        réellement comptée dans
                        la boutique.
                      </p>


                      <div className="mt-4 grid gap-3">

                        <input
                          name="new_quantity"
                          type="number"
                          min={
                            item.quantity_reserved
                          }
                          step="1"
                          required
                          defaultValue={
                            item.quantity_on_hand
                          }
                          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0b4da2]"
                        />


                        <input
                          name="reference"
                          placeholder="Référence inventaire"
                          className="h-11 rounded-xl border border-slate-200 px-3 text-xs outline-none"
                        />


                        <textarea
                          name="note"
                          rows={2}
                          placeholder="Observation"
                          className="rounded-xl border border-slate-200 p-3 text-xs outline-none"
                        />


                        <button
                          type="submit"
                          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0b4da2] px-4 text-xs font-black text-white"
                        >
                          <Warehouse
                            size={15}
                          />

                          Valider l’inventaire
                        </button>
                      </div>
                    </form>


                    {/* =========================
                        SEUIL
                    ========================= */}

                    <form
                      action={
                        thresholdAction
                      }
                      className="rounded-2xl border border-orange-200 bg-white p-4"
                    >

                      <input
                        type="hidden"
                        name="return_to"
                        value={
                          returnTo
                        }
                      />


                      <div className="flex items-center gap-2 text-orange-600">

                        <AlertTriangle
                          size={18}
                        />

                        <strong className="text-sm">
                          Seuil d’alerte
                        </strong>
                      </div>


                      <p className="mt-1 text-[10px] leading-5 text-slate-400">
                        Une alerte est déclenchée
                        lorsque le disponible
                        atteint ce niveau.
                      </p>


                      <div className="mt-4 grid gap-3">

                        <input
                          name="low_stock_threshold"
                          type="number"
                          min="0"
                          step="1"
                          required
                          defaultValue={
                            item.low_stock_threshold
                          }
                          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-orange-500"
                        />


                        <button
                          type="submit"
                          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-4 text-xs font-black text-white"
                        >
                          <AlertTriangle
                            size={15}
                          />

                          Modifier le seuil
                        </button>
                      </div>
                    </form>
                  </div>
                </details>
              </article>
            );
          },
        )}
      </section>


      {/* =========================================
          PAGINATION
      ========================================= */}

      {data.total_pages >
        1 && (
        <nav className="mt-7 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

          {data.page > 1 ? (
            <Link
              href={
                makeStockUrl({
                  q,
                  status:
                    selectedStatus,
                  page:
                    data.page -
                    1,
                })
              }
              className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-600"
            >
              <ArrowLeft
                size={15}
              />

              Précédent
            </Link>
          ) : (
            <span />
          )}


          <span className="text-[11px] font-black text-slate-500">
            Page {data.page} /{" "}
            {data.total_pages}
          </span>


          {data.page <
          data.total_pages ? (
            <Link
              href={
                makeStockUrl({
                  q,
                  status:
                    selectedStatus,
                  page:
                    data.page +
                    1,
                })
              }
              className="flex h-10 items-center gap-2 rounded-xl bg-[#0b4da2] px-3 text-xs font-black text-white"
            >
              Suivant

              <ArrowRight
                size={15}
              />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}