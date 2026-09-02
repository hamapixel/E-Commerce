import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  OrderTicket,
} from "@/components/orders/order-ticket";

import {
  ownerFetch,
} from "@/lib/backend";

import type {
  OwnerOrder,
} from "@/types/owner";


interface OrderTicketPageProps {
  params: Promise<{
    id: string;
  }>;
}


export default async function OrderTicketPage({
  params,
}: OrderTicketPageProps) {
  const resolvedParams =
    await params;

  const order =
    await ownerFetch<
      OwnerOrder
    >(
      `/owner/orders/${
        encodeURIComponent(
          resolvedParams.id,
        )
      }/`,
    );

  return (
    <>
      <div className="ticket-no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/commandes"
            className="inline-flex items-center gap-2 text-xs font-black text-[#0b4da2] transition hover:text-[#ff6b00]"
          >
            <ArrowLeft
              size={16}
            />

            Retour aux commandes
          </Link>

          <h1 className="mt-3 text-3xl font-black text-slate-950">
            Ticket de commande
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Document interne réservé au propriétaire.
          </p>
        </div>
      </div>

      <OrderTicket
        order={order}
      />
    </>
  );
}
