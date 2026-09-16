import {
  Check,
  Circle,
  PackageCheck,
  Truck,
} from "lucide-react";

import type {
  Order,
} from "@/types/order";


interface OrderStatusTimelineProps {
  status: Order["status"];
  deliveryMethod: Order["delivery_method"];
}


const DELIVERY_STEPS = [
  {
    status: "PENDING",
    label: "Reçue",
  },
  {
    status: "CONFIRMED",
    label: "Confirmée",
  },
  {
    status: "PREPARING",
    label: "Préparation",
  },
  {
    status: "READY",
    label: "Prête",
  },
  {
    status: "SHIPPED",
    label: "Expédiée",
  },
  {
    status: "DELIVERED",
    label: "Livrée",
  },
] as const;


const PICKUP_STEPS = [
  {
    status: "PENDING",
    label: "Reçue",
  },
  {
    status: "CONFIRMED",
    label: "Confirmée",
  },
  {
    status: "PREPARING",
    label: "Préparation",
  },
  {
    status: "READY",
    label: "Prête au retrait",
  },
  {
    status: "DELIVERED",
    label: "Retirée",
  },
] as const;


export function OrderStatusTimeline({
  status,
  deliveryMethod,
}: OrderStatusTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <strong className="text-red-700">
          Commande annulée
        </strong>

        <p className="mt-1 text-xs leading-5 text-red-600">
          Cette commande ne poursuit plus le circuit de préparation et de livraison.
        </p>
      </div>
    );
  }

  const steps =
    deliveryMethod === "PICKUP"
      ? PICKUP_STEPS
      : DELIVERY_STEPS;

  const currentIndex =
    steps.findIndex(
      (step) =>
        step.status === status,
    );

  const safeCurrentIndex =
    currentIndex >= 0
      ? currentIndex
      : 0;

  return (
    <section className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b4da2] text-white">
          {deliveryMethod === "DELIVERY"
            ? <Truck size={19} />
            : <PackageCheck size={19} />}
        </span>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0b4da2]">
            Suivi de commande
          </p>

          <p className="mt-0.5 text-sm font-bold text-slate-600">
            Étape actuelle :{" "}
            {steps[
              safeCurrentIndex
            ].label}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map(
          (step, index) => {
            const completed =
              index < safeCurrentIndex;

            const current =
              index === safeCurrentIndex;

            return (
              <div
                key={step.status}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${
                  current
                    ? "border-orange-200 bg-orange-50"
                    : completed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    current
                      ? "bg-[#ff6b00] text-white"
                      : completed
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {completed ? (
                    <Check size={16} />
                  ) : (
                    <Circle size={13} />
                  )}
                </span>

                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Étape {index + 1}
                  </span>

                  <strong
                    className={`text-xs ${
                      current
                        ? "text-[#ff6b00]"
                        : completed
                          ? "text-emerald-700"
                          : "text-slate-600"
                    }`}
                  >
                    {step.label}
                  </strong>
                </div>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}
