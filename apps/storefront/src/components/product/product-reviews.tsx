"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MessageSquareText,
  Star,
} from "lucide-react";


interface ProductReview {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}


interface ReviewSummary {
  count: number;
  average_rating: number;
  results: ProductReview[];
}


interface ProductReviewsProps {
  slug: string;
  productName?: string;
}


function readableError(
  data: unknown,
) {
  if (
    !data
    || typeof data !== "object"
  ) {
    return "Impossible d'envoyer votre avis pour le moment.";
  }

  const record =
    data as Record<string, unknown>;

  if (
    typeof record.detail === "string"
  ) {
    return record.detail;
  }

  for (
    const value
    of Object.values(record)
  ) {
    if (
      Array.isArray(value)
      && value.length > 0
    ) {
      return String(value[0]);
    }
  }

  return "Impossible d'envoyer votre avis pour le moment.";
}


export function ProductReviews({
  slug,
  productName,
}: ProductReviewsProps) {
  const [
    summary,
    setSummary,
  ] = useState<ReviewSummary>({
    count: 0,
    average_rating: 0,
    results: [],
  });

  const [
    customerName,
    setCustomerName,
  ] = useState("");

  const [
    comment,
    setComment,
  ] = useState("");

  const [
    rating,
    setRating,
  ] = useState(5);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  useEffect(
    () => {
      let active = true;

      async function loadReviews() {
        try {
          const response = await fetch(
            `/api/reviews/${encodeURIComponent(slug)}`,
            {
              cache: "no-store",
            },
          );

          if (!response.ok) {
            return;
          }

          const data =
            await response.json() as ReviewSummary;

          if (active) {
            setSummary(data);
          }
        }
        finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void loadReviews();

      return () => {
        active = false;
      };
    },
    [slug],
  );

  const formattedAverage =
    useMemo(
      () => (
        summary.count > 0
          ? summary.average_rating.toFixed(1)
          : "0.0"
      ),
      [
        summary.average_rating,
        summary.count,
      ],
    );

  async function submitReview(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSending(true);

    try {
      const response = await fetch(
        `/api/reviews/${encodeURIComponent(slug)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_name: customerName,
            rating,
            comment,
          }),
        },
      );

      const data: unknown =
        await response.json();

      if (!response.ok) {
        setError(
          readableError(data),
        );
        return;
      }

      const result = data as {
        message?: string;
        summary?: ReviewSummary;
      };

      if (result.summary) {
        setSummary(result.summary);
      }

      setComment("");
      setRating(5);
      setSuccess(
        result.message ??
        "Merci pour votre avis.",
      );
    }
    catch {
      setError(
        "Impossible d'envoyer votre avis pour le moment.",
      );
    }
    finally {
      setSending(false);
    }
  }

  return (
    <section
      id="avis-clients"
      className="mx-auto mt-8 max-w-[1180px] px-4 sm:px-6"
    >
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
          <div className="bg-gradient-to-br from-[#061f43] via-[#0b4da2] to-[#123f78] p-4 text-white sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <MessageSquareText
                  size={18}
                />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-300">
                  Avis clients
                </p>
                <h2 className="mt-0.5 text-xl font-black">
                  Donnez votre avis
                </h2>
              </div>
            </div>

            {productName && (
              <p className="mt-3 line-clamp-1 text-xs text-blue-100/80">
                {productName}
              </p>
            )}

            <div className="mt-4 flex items-center gap-3">
              <span className="text-4xl font-black">
                {formattedAverage}
              </span>

              <div>
                <div className="flex gap-0.5 text-amber-300">
                  {[1, 2, 3, 4, 5].map(
                    (value) => (
                      <Star
                        key={value}
                        size={14}
                        fill={
                          value <= Math.round(
                            summary.average_rating,
                          )
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ),
                  )}
                </div>

                <p className="mt-1 text-[10px] text-blue-100/70">
                  {summary.count} avis
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-blue-100/75">
              Votre expérience aide les autres clients à mieux choisir.
            </p>
          </div>

          <form
            onSubmit={submitReview}
            className="p-4 sm:p-5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-[11px] font-black text-slate-800">
                  Votre nom
                </span>

                <input
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(
                      event.target.value,
                    )}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Ex. Moussa"
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#ff6b00]"
                />
              </label>

              <div>
                <span className="text-[11px] font-black text-slate-800">
                  Votre note
                </span>

                <div className="mt-1.5 flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setRating(value)
                        }
                        aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-amber-400 transition hover:border-amber-300"
                      >
                        <Star
                          size={17}
                          fill={
                            value <= rating
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    ),
                  )}
                </div>
              </div>

              <label className="sm:col-span-2">
                <span className="text-[11px] font-black text-slate-800">
                  Votre commentaire
                </span>

                <textarea
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value,
                    )}
                  required
                  minLength={5}
                  maxLength={1200}
                  rows={3}
                  placeholder="Que pensez-vous de ce produit ?"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#ff6b00]"
                />
              </label>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 sm:col-span-2">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:col-span-2">
                  {success}
                </div>
              )}

              <div className="sm:col-span-2 sm:flex sm:justify-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="min-h-10 w-full rounded-xl bg-[#ff6b00] px-5 text-xs font-black text-white transition hover:bg-[#e86100] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {sending
                    ? "Envoi..."
                    : "Publier mon avis"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="border-t border-slate-100 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-black text-slate-950 sm:text-lg">
              Avis publiés
            </h3>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black text-slate-500">
              {summary.count}
            </span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500">
              Chargement des avis...
            </p>
          ) : summary.results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              Aucun avis pour le moment. Soyez le premier à partager votre expérience.
            </div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto pr-1">
              <div className="grid gap-3 md:grid-cols-2">
                {summary.results.map(
                  (review) => (
                    <article
                      key={review.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {review.customer_name}
                          </p>

                          <p className="mt-0.5 text-[9px] text-slate-400">
                            {new Intl.DateTimeFormat(
                              "fr-FR",
                              {
                                dateStyle: "medium",
                              },
                            ).format(
                              new Date(
                                review.created_at,
                              ),
                            )}
                          </p>
                        </div>

                        <div className="flex gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map(
                            (value) => (
                              <Star
                                key={value}
                                size={12}
                                fill={
                                  value <= review.rating
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            ),
                          )}
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-4 text-xs leading-5 text-slate-600">
                        {review.comment}
                      </p>
                    </article>
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
