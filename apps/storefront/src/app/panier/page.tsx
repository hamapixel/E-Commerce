import type {
  Metadata,
} from "next";

import {
  CartPageClient,
} from "@/components/cart/cart-page-client";


export const metadata: Metadata = {
  title: "Mon panier",

  description:
    "Consultez votre panier SUGU KURA.",
};


export default function CartPage() {
  return (
    <CartPageClient />
  );
}