import type {
  Metadata,
} from "next";

import {
  OrderTrackingForm,
} from "@/components/order/order-tracking-form";


export const metadata: Metadata = {
  title:
    "Suivre ma commande | SUGU KURA",

  description:
    "Suivez l'état de votre commande SUGU KURA avec votre numéro de commande et votre téléphone.",
};


export default function OrderTrackingPage() {
  return (
    <OrderTrackingForm />
  );
}
