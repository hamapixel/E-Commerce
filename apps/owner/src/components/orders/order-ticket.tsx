"use client";

import {
  Printer,
  ReceiptText,
} from "lucide-react";

import QRCode from "qrcode";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

import {
  formatDate,
  formatMoney,
} from "@/lib/format";

import type {
  OwnerOrder,
} from "@/types/owner";


interface OrderTicketProps {
  order: OwnerOrder;
}


type PrintFormat =
  | "80mm"
  | "a4";


function numberValue(
  value:
    | string
    | number
    | null
    | undefined,
) {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(
      parsed,
    )
  ) {
    return 0;
  }

  return parsed;
}


export function OrderTicket({
  order,
}: OrderTicketProps) {
  const qrCanvasRef =
    useRef<
      HTMLCanvasElement | null
    >(
      null,
    );


  const payment =
    order.payments[0]
    ?? null;


  const savings =
    useMemo(
      () => {
        return order.items.reduce(
          (
            total,
            item,
          ) => {
            const normalPrice =
              numberValue(
                item.normal_price,
              );

            const unitPrice =
              numberValue(
                item.unit_price,
              );

            const unitSaving =
              Math.max(
                0,
                normalPrice
                -
                unitPrice,
              );

            return (
              total
              +
              (
                unitSaving
                *
                item.quantity
              )
            );
          },
          0,
        );
      },
      [
        order.items,
      ],
    );


  const address =
    [
      order.city,
      order.delivery_zone,
      order.address,
    ]
      .filter(
        Boolean,
      )
      .join(
        " • ",
      );


  const qrValue =
    useMemo(
      () => {
        const configuredOwnerUrl =
          process.env
            .NEXT_PUBLIC_OWNER_PUBLIC_URL
            ?.trim();

        if (
          configuredOwnerUrl
        ) {
          return (
            configuredOwnerUrl
              .replace(
                /\/+$/,
                "",
              )
            +
            `/commandes/${order.id}/ticket`
          );
        }

        /*
         * En développement, on évite d'inscrire
         * "localhost" dans le QR car localhost
         * désignerait le téléphone qui scanne.
         *
         * Sans URL publique configurée, le QR
         * contient donc uniquement le numéro
         * de commande.
         */
        return (
          "SUGU KURA | "
          +
          order.order_number
        );
      },
      [
        order.id,
        order.order_number,
      ],
    );


  useEffect(
    () => {
      const canvas =
        qrCanvasRef.current;

      if (
        !canvas
      ) {
        return;
      }

      void QRCode.toCanvas(
        canvas,
        qrValue,
        {
          width: 150,
          margin: 1,
          errorCorrectionLevel:
            "M",
        },
      );
    },
    [
      qrValue,
    ],
  );


  function printTicket(
    format:
      PrintFormat,
  ) {
    const previousStyle =
      document.getElementById(
        "sugu-kura-ticket-page-style",
      );

    previousStyle?.remove();


    const pageStyle =
      document.createElement(
        "style",
      );

    pageStyle.id =
      "sugu-kura-ticket-page-style";

    pageStyle.textContent =
      format === "80mm"
        ? (
          "@page { "
          +
          "size: 80mm auto; "
          +
          "margin: 4mm; "
          +
          "}"
        )
        : (
          "@page { "
          +
          "size: A4 portrait; "
          +
          "margin: 12mm; "
          +
          "}"
        );


    document.head.appendChild(
      pageStyle,
    );

    document.body.dataset
      .ticketPaper =
        format;


    window.requestAnimationFrame(
      () => {
        window.print();

        pageStyle.remove();

        delete document.body
          .dataset
          .ticketPaper;
      },
    );
  }


  return (
    <>
      <div className="ticket-no-print mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            printTicket(
              "80mm",
            )
          }
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-slate-800"
        >
          <Printer
            size={16}
          />

          Imprimer 80 mm
        </button>

        <button
          type="button"
          onClick={() =>
            printTicket(
              "a4",
            )
          }
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ReceiptText
            size={16}
          />

          Imprimer A4
        </button>
      </div>


      <article
        id="sugu-kura-order-ticket"
        className="mx-auto w-full max-w-[820px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
      >
        <header className="border-b border-dashed border-slate-300 px-5 py-6 text-center sm:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6b00] text-sm font-black text-white">
            SK
          </div>

          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
            SUGU KURA
          </h2>

          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#0b4da2]">
            Ticket de commande
          </p>

          <p className="mt-3 text-xs font-bold text-slate-500">
            Document interne propriétaire
          </p>
        </header>


        <section className="grid gap-4 border-b border-dashed border-slate-300 px-5 py-5 text-sm sm:grid-cols-2 sm:px-8">
          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Commande
            </span>

            <strong className="mt-1 block text-base text-slate-950">
              {
                order.order_number
              }
            </strong>
          </div>

          <div className="sm:text-right">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Date
            </span>

            <strong className="mt-1 block text-sm text-slate-800">
              {formatDate(
                order.created_at,
              )}
            </strong>
          </div>

          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Client
            </span>

            <strong className="mt-1 block text-sm text-slate-900">
              {
                order.customer_name
              }
            </strong>

            <span className="mt-1 block text-xs text-slate-500">
              {
                order.customer_phone
              }
            </span>
          </div>

          <div className="sm:text-right">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Statut
            </span>

            <span className="mt-1 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#0b4da2]">
              {
                order.status_label
              }
            </span>
          </div>

          <div>
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Réception
            </span>

            <strong className="mt-1 block text-sm text-slate-800">
              {
                order
                  .delivery_method_label
              }
            </strong>
          </div>

          <div className="sm:text-right">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Paiement
            </span>

            <strong className="mt-1 block text-sm text-slate-800">
              {
                payment
                  ?.method_label
                ??
                "Non renseigné"
              }
            </strong>

            {
              payment && (
                <span className="mt-1 block text-xs text-slate-500">
                  {
                    payment
                      .status_label
                  }
                </span>
              )
            }
          </div>

          {
            address && (
              <div className="sm:col-span-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Adresse
                </span>

                <strong className="mt-1 block text-sm leading-6 text-slate-800">
                  {address}
                </strong>
              </div>
            )
          }

          {
            order.notes && (
              <div className="sm:col-span-2">
                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Instructions client
                </span>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {
                    order.notes
                  }
                </p>
              </div>
            )
          }
        </section>


        <section className="px-5 py-5 sm:px-8">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-slate-950 px-4 py-3 text-[9px] font-black uppercase tracking-wider text-white">
              <span>
                Produit
              </span>

              <span className="text-right">
                Qté
              </span>

              <span className="text-right">
                Total
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {
                order.items.map(
                  (
                    item,
                  ) => (
                    <div
                      key={
                        item.id
                      }
                      className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <strong className="block text-xs text-slate-900">
                          {
                            item
                              .product_name
                          }
                        </strong>

                        {
                          item
                            .variant_label
                          && (
                            <span className="mt-0.5 block text-[10px] text-slate-500">
                              {
                                item
                                  .variant_label
                              }
                            </span>
                          )
                        }

                        <span className="mt-1 block text-[10px] text-slate-400">
                          {
                            formatMoney(
                              item
                                .unit_price,
                            )
                          }
                          {" / unité"}
                        </span>
                      </div>

                      <strong className="text-right text-xs text-slate-800">
                        {
                          item.quantity
                        }
                      </strong>

                      <strong className="whitespace-nowrap text-right text-xs text-slate-950">
                        {
                          formatMoney(
                            item
                              .line_total,
                          )
                        }
                      </strong>
                    </div>
                  ),
                )
              }
            </div>
          </div>


          <div className="ml-auto mt-5 w-full max-w-sm space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">
                Sous-total
              </span>

              <strong className="text-slate-900">
                {formatMoney(
                  order.subtotal,
                )}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">
                Livraison
              </span>

              <strong className="text-slate-900">
                {formatMoney(
                  order.delivery_fee,
                )}
              </strong>
            </div>

            {
              savings > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-emerald-700">
                    Économie promotion
                  </span>

                  <strong className="text-emerald-700">
                    -
                    {formatMoney(
                      savings,
                    )}
                  </strong>
                </div>
              )
            }

            <div className="mt-3 flex items-center justify-between gap-4 border-t-2 border-slate-950 pt-3">
              <span className="font-black uppercase tracking-wider text-slate-950">
                Total
              </span>

              <strong className="text-lg font-black text-[#ff6b00]">
                {formatMoney(
                  order.total,
                )}
              </strong>
            </div>
          </div>
        </section>


        <footer className="border-t border-dashed border-slate-300 px-5 py-6 text-center sm:px-8">
          <canvas
            ref={
              qrCanvasRef
            }
            className="mx-auto h-[130px] w-[130px]"
            aria-label={
              `QR commande ${order.order_number}`
            }
          />

          <p className="mt-2 text-[10px] font-bold text-slate-500">
            {
              order.order_number
            }
          </p>

          <p className="mt-5 text-sm font-black text-slate-950">
            SUGU KURA
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            La technologie au meilleur prix
          </p>
        </footer>
      </article>


      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          #sugu-kura-order-ticket,
          #sugu-kura-order-ticket * {
            visibility: visible !important;
          }

          #sugu-kura-order-ticket {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }

          body[data-ticket-paper="80mm"]
          #sugu-kura-order-ticket {
            width: 72mm !important;
            max-width: 72mm !important;
            margin: 0 !important;
          }

          body[data-ticket-paper="a4"]
          #sugu-kura-order-ticket {
            width: 180mm !important;
            max-width: 180mm !important;
            margin: 0 auto !important;
          }

          .ticket-no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
