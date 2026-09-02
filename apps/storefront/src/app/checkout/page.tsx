import type {
  Metadata,
} from "next";

import {
  CheckoutForm,
} from "@/components/checkout/checkout-form";


export const metadata: Metadata = {
  title:
    "Finaliser ma commande | SUGU KURA",

  description:
    "Finalisez votre achat sur SUGU KURA.",
};


export default function CheckoutPage() {
  return (
    <CheckoutForm />
  );
}