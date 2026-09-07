import Link from "next/link";

import {
  Eye,
  EyeOff,
  MessageSquareText,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import {
  deleteReviewAction,
  setReviewPublishedAction,
} from "@/actions/reviews";

import {
  ownerFetch,
} from "@/lib/backend";


interface OwnerReview {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
  };
  customer_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}


interface OwnerReviewList {
  summary: {
    total: number;
    published: number;
    hidden: number;
    average_rating: number;
  };
  count: number;
  page: number;
  pages: number;
  results: OwnerReview[];
}


interface ReviewsPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
}


function reviewUrl(
  page: number,
  status: string,
  search: string,
) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set(
      "page",
      String(page),
    );
  }

  if (
    status
    && status !== "all"
  ) {
    params.set(
      "status",
      status,
    );
  }

  if (search) {
    params.set(
      "q",
      search,
    );
  }

  const query = params.toString();

  return query
    ? `/avis?${query}`
    : "/avis";
}


export default async function ReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  const params = await searchParams;

  const page = Math.max(
    Number(params.page ?? "1") || 1,
    1,
  );

  const status = [
    "all",
    "published",
    "hidden",
  ].includes(params.status ?? "")
    ? String(params.status)
    : "all";

  const search = (
    params.q ?? ""
  ).trim();

  const apiParams = new URLSearchParams({
    page: String(page),
    page_size: "20",
    status,
  });

  if (search) {
    apiParams.set(
      "q",
      search,
    );
  }

  const data =
    await ownerFetch<OwnerReviewList>(
      `/owner/reviews/?${apiParams.toString()}`,
    );

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Relation client
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Avis clients
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Retrouvez ici les avis envoyés depuis les fiches produits. Vous pouvez les publier, les masquer ou les supprimer.
          </p>
        </div>

        <form
          method="get"
          className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
        >
          {status !== "all" && (
            <input
              type="hidden"
              name="status"
              value={status}
            />
          )}

          <Search
            size={18}
            className="ml-2 shrink-0 text-slate-400"
          />

          <input
            name="q"
            defaultValue={search}
            placeholder="Client, produit, commentaire..."
            className="h-10 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none"
          />

          <button
            type="submit"
            className="h-10 rounded-xl bg-slate-950 px-4 text-xs font-black text-white"
          >
            Rechercher
          </button>
        </form>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase text-slate-400">
            Total
          </span>
          <strong className="mt-1 block text-2xl font-black text-slate-950">
            {data.summary.total}
          </strong>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
          <span className="text-[10px] font-black uppercase text-emerald-600">
            Publiés
          </span>
          <strong className="mt-1 block text-2xl font-black text-emerald-700">
            {data.summary.published}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <span className="text-[10px] font-black uppercase text-slate-500">
            Masqués
          </span>
          <strong className="mt-1 block text-2xl font-black text-slate-700">
            {data.summary.hidden}
          </strong>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <span className="text-[10px] font-black uppercase text-amber-600">
            Note moyenne
          </span>
          <strong className="mt-1 flex items-center gap-1 text-2xl font-black text-amber-700">
            {data.summary.average_rating.toFixed(1)}
            <Star
              size={18}
              fill="currentColor"
            />
          </strong>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          ["all", "Tous"],
          ["published", "Publiés"],
          ["hidden", "Masqués"],
        ].map(([value, label]) => (
          <Link
            key={value}
            href={reviewUrl(
              1,
              value,
              search,
            )}
            className={`rounded-xl px-4 py-2 text-xs font-black transition ${
              status === value
                ? "bg-[#0b4da2] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <section className="mt-5 rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <MessageSquareText
              size={19}
              className="text-[#0b4da2]"
            />
            <h2 className="font-black text-slate-950">
              Commentaires reçus
            </h2>
          </div>

          <span className="text-xs font-bold text-slate-400">
            {data.count} résultat(s)
          </span>
        </div>

        {data.results.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Aucun avis trouvé.
          </div>
        ) : (
          <div className="grid gap-px bg-slate-100 md:grid-cols-2">
            {data.results.map((review) => (
              <article
                key={review.id}
                className="bg-white p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="truncate text-sm text-slate-950">
                        {review.customer_name}
                      </strong>

                      <span
                        className={`rounded-full px-2 py-1 text-[9px] font-black ${
                          review.is_approved
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {review.is_approved
                          ? "PUBLIÉ"
                          : "MASQUÉ"}
                      </span>
                    </div>

                    <Link
                      href={`/catalogue/produits/${review.product.id}`}
                      className="mt-1 block truncate text-xs font-bold text-[#0b4da2] hover:underline"
                    >
                      {review.product.name}
                    </Link>
                  </div>

                  <div className="flex shrink-0 gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        size={13}
                        fill={
                          value <= review.rating
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
                  {review.comment}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <span className="text-[10px] text-slate-400">
                    {new Intl.DateTimeFormat(
                      "fr-FR",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      },
                    ).format(
                      new Date(
                        review.created_at,
                      ),
                    )}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <form
                      action={
                        setReviewPublishedAction.bind(
                          null,
                          review.id,
                          !review.is_approved,
                        )
                      }
                    >
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-600 transition hover:bg-slate-50"
                      >
                        {review.is_approved ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                        {review.is_approved
                          ? "Masquer"
                          : "Publier"}
                      </button>
                    </form>

                    <form
                      action={
                        deleteReviewAction.bind(
                          null,
                          review.id,
                        )
                      }
                    >
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 text-[10px] font-black text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                        Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {data.pages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link
            href={reviewUrl(
              Math.max(data.page - 1, 1),
              status,
              search,
            )}
            aria-disabled={data.page <= 1}
            className={`rounded-xl border px-4 py-2.5 text-xs font-black ${
              data.page <= 1
                ? "pointer-events-none border-slate-100 bg-slate-50 text-slate-300"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            Précédent
          </Link>

          <span className="text-xs font-bold text-slate-500">
            Page {data.page} / {data.pages}
          </span>

          <Link
            href={reviewUrl(
              Math.min(data.page + 1, data.pages),
              status,
              search,
            )}
            aria-disabled={data.page >= data.pages}
            className={`rounded-xl border px-4 py-2.5 text-xs font-black ${
              data.page >= data.pages
                ? "pointer-events-none border-slate-100 bg-slate-50 text-slate-300"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            Suivant
          </Link>
        </div>
      )}
    </>
  );
}
