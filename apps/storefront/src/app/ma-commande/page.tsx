import type {
  Metadata,
} from "next";

import {
  MyOrderShortcut,
} from "@/components/order/my-order-shortcut";

export const metadata: Metadata = {
  title: "Ma commande",
  description:
    "Retrouvez rapidement votre dernière commande SUGU KURA sur cet appareil.",
};

export default function MyOrderPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-10 sm:px-6 lg:py-14">
      <MyOrderShortcut />
    </div>
  );
}
