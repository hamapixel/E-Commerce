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
    ||
    typeof data !== "object"
  ) {
    return "Impossible d'envoyer votre avis pour le moment.";
  }

  const record =
    data as Record<string, unknown>;

  if (
    typeof record.detail ===
    "string"
  ) {
    return record.detail;
  }

  for (
    const value
    of Object.values(record)
  ) {
    if (
      Array.isArray(value)
      &&
      value.length > 0
    ) {
      return String(
        value[0],
      );
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
          const response =
            await fetch(
              `/api/reviews/${encodeURIComponent(slug)}`,
              {
                cache:
                  "no-store",
              },
            );

          if (!response.ok) {
            return;
          }

          const data =
            await response.json() as ReviewSummary;

          if (active) {
            setSummary(
              data,
            );
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
      const response =
        await fetch(
          `/api/reviews/${encodeURIComponent(slug)}`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                customer_name:
                  customerName,
                rating,
                comment,
              }),
          },
        );

      const data:
        unknown =
        await response.json();

      if (!response.ok) {
        setError(
          readableError(
            data,
          ),
        );
        return;
      }

      const result =
        data as {
          message?: string;
          summary?: ReviewSummary;
        };

      if (result.summary) {
        setSummary(
          result.summary,
        );
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
      className="mx-auto mt-12 max-w-[1440px] px-4 sm:px-6"
    >
      <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-gradient-to-br from-[#061f43] via-[#0b4da2] to-[#123f78] p-6 text-white sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <MessageSquareText
                size={24}
              />
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-orange-300">
              Avis clients
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Donnez votre avis
            </h2>

            {productName && (
              <p className="mt-2 text-sm text-blue-100/80">
                {productName}
              </p>
            )}

            <div className="mt-7 flex items-end gap-3">
              <span className="text-5xl font-black text-white">
                {formattedAverage}
              </span>

              <div className="pb-1">
                <div className="flex gap-1 text-amber-300">
                  {[1, 2, 3, 4, 5].map(
                    (value) => (
                      <Star
                        key={value}
                        size={16}
                        fill={
                          value <=
                          Math.round(
                            summary.average_rating,
                          )
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ),
                  )}
                </div>

                <p className="mt-1 text-xs text-blue-100/70">
                  {summary.count} avis
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-md text-sm leading-7 text-blue-100/80">
              Partagez votre expérience pour aider les autres clients à mieux choisir.
            </p>
          </div>

          <form
            onSubmit={submitReview}
            className="p-6 sm:p-8"
          >
            <div className="grid gap-5">
              <label>
                <span className="text-xs font-black text-slate-800">
                  Votre nom
                </span>

                <input
                  value={customerName}
                  onChange={(
                    event,
                  ) =>
                    setCustomerName(
                      event.target.value,
                    )}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Ex. Moussa"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
                />
              </label>

              <div>
                <span className="text-xs font-black text-slate-800">
                  Votre note
                </span>

                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setRating(
                            value,
                          )}
                        aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-amber-400 transition hover:border-amber-300"
                      >
                        <Star
                          size={20}
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

              <label>
                <span className="text-xs font-black text-slate-800">
                  Votre commentaire
                </span>

                <textarea
                  value={comment}
                  onChange={(
                    event,
                  ) =>
                    setComment(
                      event.target.value,
                    )}
                  required
                  minLength={5}
                  maxLength={1200}
                  rows={5}
                  placeholder="Que pensez-vous de ce produit ?"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-[#ff6b00]"
                />
              </label>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="min-h-12 rounded-xl bg-[#ff6b00] px-5 text-sm font-black text-white transition hover:bg-[#e86100] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending
                  ? "Envoi..."
                  : "Publier mon avis"}
              </button>
            </div>
          </form>
        </div>

        <div className="border-t border-slate-100 p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-xl font-black text-slate-950">
              Ce que pensent nos clients
            </h3>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">
              {summary.count} avis
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">
              Chargement des avis...
            </p>
          ) : summary.results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Aucun avis pour le moment. Soyez le premier à partager votre expérience.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {summary.results.map(
                (review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black text-slate-900">
                          {review.customer_name}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {new Intl.DateTimeFormat(
                            "fr-FR",
                            {
                              dateStyle:
                                "medium",
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
                              size={14}
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

                    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {review.comment}
                    </p>
                  </article>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
