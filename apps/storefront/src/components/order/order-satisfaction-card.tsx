"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Heart,
  MessageCircle,
  Star,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import Swal from "sweetalert2";

import type {
  OrderSatisfaction,
  OrderSatisfactionExperience,
} from "@/types/order";


type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";


interface ProductLink {
  slug: string;
  name: string;
}


interface Props {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  initialSatisfaction:
    | OrderSatisfaction
    | null;
  products: ProductLink[];
}


const positiveTags = [
  [
    "DELIVERY_FAST",
    "Livraison rapide",
  ],
  [
    "PRODUCT_AS_EXPECTED",
    "Produit conforme",
  ],
  [
    "PACKAGING",
    "Bon emballage",
  ],
  [
    "SERVICE",
    "Bon service",
  ],
  [
    "EASY_ORDER",
    "Commande facile",
  ],
  [
    "GOOD_VALUE",
    "Bon rapport qualité/prix",
  ],
] as const;


const problemReasons = [
  ["LATE", "Livraison en retard"],
  ["DAMAGED", "Produit endommagé"],
  ["WRONG_ITEM", "Mauvais produit"],
  ["MISSING_ITEM", "Article manquant"],
  ["SERVICE", "Service client"],
  ["OTHER", "Autre"],
] as const;


const experienceOptions: Array<{
  value: OrderSatisfactionExperience;
  label: string;
  emoji: string;
}> = [
  {
    value: "VERY_SATISFIED",
    label: "Très satisfait",
    emoji: "😍",
  },
  {
    value: "SATISFIED",
    label: "Satisfait",
    emoji: "😊",
  },
  {
    value: "OK",
    label: "Correct",
    emoji: "🙂",
  },
  {
    value: "PROBLEM",
    label: "J'ai eu un problème",
    emoji: "😕",
  },
];


function experienceFromRating(
  rating: number,
): OrderSatisfactionExperience {
  if (rating >= 5) {
    return "VERY_SATISFIED";
  }

  if (rating >= 4) {
    return "SATISFIED";
  }

  if (rating >= 3) {
    return "OK";
  }

  return "PROBLEM";
}


function readError(
  data: unknown,
) {
  if (
    data
    && typeof data === "object"
    && "detail" in data
    && typeof data.detail === "string"
  ) {
    return data.detail;
  }

  if (
    data
    && typeof data === "object"
    && "problem_reason" in data
  ) {
    return "Choisissez le problème rencontré.";
  }

  return (
    "Impossible d'envoyer votre retour pour le moment."
  );
}


export function OrderSatisfactionCard({
  orderId,
  orderNumber,
  status,
  initialSatisfaction,
  products,
}: Props) {
  const [saved, setSaved] =
    useState<OrderSatisfaction | null>(
      initialSatisfaction,
    );

  const [rating, setRating] =
    useState(
      initialSatisfaction?.rating ?? 0,
    );

  const [experience, setExperience] =
    useState<OrderSatisfactionExperience>(
      initialSatisfaction?.experience
      ?? "VERY_SATISFIED",
    );

  const [tags, setTags] =
    useState<string[]>(
      initialSatisfaction?.tags ?? [],
    );

  const [comment, setComment] =
    useState(
      initialSatisfaction?.comment ?? "",
    );

  const [problemReason, setProblemReason] =
    useState(
      initialSatisfaction?.problem_reason
      ?? "",
    );

  const [wantsContact, setWantsContact] =
    useState(
      initialSatisfaction?.wants_contact
      ?? false,
    );

  const [submitting, setSubmitting] =
    useState(false);

  const uniqueProducts = useMemo(
    () => {
      const seen = new Set<string>();

      return products.filter(
        (product) => {
          if (seen.has(product.slug)) {
            return false;
          }

          seen.add(product.slug);
          return true;
        },
      );
    },
    [products],
  );

  const whatsapp = (
    process.env.NEXT_PUBLIC_STORE_WHATSAPP
    ?? ""
  ).replace(/\D/g, "");

  if (status !== "DELIVERED") {
    return (
      <section className="rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-7">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0b4da2] shadow-sm">
            <Heart size={22} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-[#0b4da2]">
              Votre avis compte
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950">
              Après la livraison, dites-nous comment cela s'est passé
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Dès que la commande sera marquée livrée, vous pourrez noter l'expérience, signaler un problème et laisser un avis sur les produits reçus.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (saved) {
    return (
      <section className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
            <CheckCircle2 size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
              Merci pour votre retour
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              Votre expérience a bien été enregistrée
            </h2>

            <div className="mt-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(
                (value) => (
                  <Star
                    key={value}
                    size={21}
                    className={
                      value <= saved.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }
                  />
                ),
              )}
            </div>

            {uniqueProducts.length > 0 && (
              <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-black text-slate-900">
                  Vous aimez vos produits ? Donnez aussi votre avis produit.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {uniqueProducts.map(
                    (product) => (
                      <Link
                        key={product.slug}
                        href={`/produits/${product.slug}#avis`}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-[#0b4da2] transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        {product.name}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  function toggleTag(
    value: string,
  ) {
    setTags(
      (current) => (
        current.includes(value)
          ? current.filter(
              (item) => item !== value,
            )
          : [...current, value]
      ),
    );
  }

  async function submit() {
    if (rating < 1) {
      await Swal.fire({
        icon: "info",
        title: "Une petite note ?",
        text: "Choisissez de 1 à 5 étoiles avant d'envoyer votre retour.",
        confirmButtonText: "D'accord",
      });
      return;
    }

    if (
      experience === "PROBLEM"
      && !problemReason
    ) {
      await Swal.fire({
        icon: "info",
        title: "Quel problème avez-vous rencontré ?",
        text: "Choisissez un motif afin que SUGU KURA puisse mieux vous aider.",
        confirmButtonText: "D'accord",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(orderId)}/satisfaction`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rating,
            experience,
            tags:
              experience === "PROBLEM"
                ? []
                : tags,
            comment,
            problem_reason:
              experience === "PROBLEM"
                ? problemReason
                : "",
            wants_contact:
              experience === "PROBLEM"
                ? wantsContact
                : false,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          readError(data),
        );
      }

      setSaved(data.satisfaction);

      await Swal.fire({
        icon: "success",
        title: "Merci ❤️",
        text: "Votre retour aide SUGU KURA à améliorer chaque commande.",
        confirmButtonText: "Parfait",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Envoi impossible",
        text:
          error instanceof Error
            ? error.message
            : "Réessayez dans quelques instants.",
        confirmButtonText: "Fermer",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const supportMessage = encodeURIComponent(
    `Bonjour SUGU KURA, j'ai besoin d'aide concernant la commande ${orderNumber}.`,
  );

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6b00]">
          <Heart size={26} />
        </div>

        <p className="mt-4 text-xs font-black uppercase tracking-[0.15em] text-[#ff6b00]">
          Commande livrée
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
          Comment s'est passée votre expérience ?
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          Cela prend moins d'une minute et nous aide à améliorer le service.
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map(
          (value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRating(value);
                setExperience(
                  experienceFromRating(value),
                );
              }}
              className="rounded-xl p-1.5 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-200"
              aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
            >
              <Star
                size={32}
                className={
                  value <= rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }
              />
            </button>
          ),
        )}
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {experienceOptions.map(
          (option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setExperience(option.value);

                if (
                  option.value === "PROBLEM"
                  && rating > 2
                ) {
                  setRating(2);
                }
              }}
              className={
                "rounded-2xl border px-4 py-3 text-left transition "
                + (
                  experience === option.value
                    ? "border-[#0b4da2] bg-blue-50 text-[#0b4da2]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
                )
              }
            >
              <span className="text-xl">
                {option.emoji}
              </span>
              <span className="ml-2 text-sm font-black">
                {option.label}
              </span>
            </button>
          ),
        )}
      </div>

      {experience !== "PROBLEM" ? (
        <div className="mt-6">
          <p className="text-sm font-black text-slate-800">
            Qu'avez-vous apprécié ?
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {positiveTags.map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleTag(value)}
                  className={
                    "rounded-full border px-3 py-2 text-xs font-bold transition "
                    + (
                      tags.includes(value)
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:border-emerald-200"
                    )
                  }
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
          <div className="flex gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-rose-600"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900">
                Dites-nous ce qui n'a pas été
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {problemReasons.map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setProblemReason(value)}
                      className={
                        "rounded-xl border px-3 py-2 text-left text-xs font-bold transition "
                        + (
                          problemReason === value
                            ? "border-rose-300 bg-white text-rose-700"
                            : "border-rose-100 bg-white/60 text-slate-600"
                        )
                      }
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>

              <label className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={wantsContact}
                  onChange={(event) => setWantsContact(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Je souhaite être recontacté par SUGU KURA
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <label
          htmlFor="order-satisfaction-comment"
          className="text-sm font-black text-slate-800"
        >
          Un commentaire ? <span className="font-medium text-slate-400">(facultatif)</span>
        </label>

        <textarea
          id="order-satisfaction-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={1200}
          rows={4}
          placeholder="Dites-nous ce que nous pouvons améliorer ou ce que vous avez apprécié..."
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0b4da2] focus:bg-white focus:ring-4 focus:ring-blue-50"
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="flex h-12 items-center justify-center rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white transition hover:bg-[#e85f00] disabled:cursor-wait disabled:opacity-60"
        >
          {submitting
            ? "Envoi en cours..."
            : "Envoyer mon avis"}
        </button>

        {experience === "PROBLEM" && whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}?text=${supportMessage}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
          >
            <MessageCircle size={18} />
            Contacter SUGU KURA
          </a>
        ) : (
          <div className="flex h-12 items-center justify-center rounded-xl bg-slate-50 px-5 text-center text-xs font-semibold text-slate-500">
            Votre retour reste lié uniquement à cette commande.
          </div>
        )}
      </div>
    </section>
  );
}
