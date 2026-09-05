import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";


interface SearchPaginationProps {
  count: number;
  page: number;
  pageSize: number;
  params?: Record<
    string,
    string
  >;
  basePath?: string;
}


function createHref(
  params: Record<string, string>,
  page: number,
  basePath: string,
) {
  const query =
    new URLSearchParams(
      params
    );

  if (page <= 1) {
    query.delete("page");
  } else {
    query.set(
      "page",
      String(page),
    );
  }

  const value =
    query.toString();

  return value
    ? `${basePath}?${value}#catalogue-results`
    : `${basePath}#catalogue-results`;
}


function getVisiblePages(
  page: number,
  totalPages: number,
) {
  const candidates =
    new Set<number>([
      1,
      totalPages,
      page - 2,
      page - 1,
      page,
      page + 1,
      page + 2,
    ]);

  return Array.from(
    candidates,
  )
    .filter(
      (value) =>
        value >= 1 &&
        value <= totalPages,
    )
    .sort(
      (a, b) =>
        a - b,
    );
}


export function SearchPagination({
  count,
  page,
  pageSize,
  params = {},
  basePath = "/recherche",
}: SearchPaginationProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(
      count / pageSize,
    ),
  );

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages =
    getVisiblePages(
      page,
      totalPages,
    );

  return (
    <nav
      aria-label="Pagination des produits"
      className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:mt-10"
    >
      {page > 1 ? (
        <Link
          href={createHref(
            params,
            page - 1,
            basePath,
          )}
          aria-label="Page précédente"
          className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-[#0b4da2] sm:h-11 sm:px-4 sm:text-sm"
        >
          <ChevronLeft
            size={17}
          />
          <span className="hidden sm:inline">
            Précédent
          </span>
        </Link>
      ) : (
        <span className="flex h-10 cursor-not-allowed items-center rounded-xl border border-slate-100 bg-slate-100 px-3 text-slate-300 sm:h-11">
          <ChevronLeft
            size={17}
          />
        </span>
      )}

      <div className="flex items-center gap-1.5">
        {visiblePages.map(
          (
            pageNumber,
            index,
          ) => {
            const previous =
              visiblePages[
                index - 1
              ];

            const needsEllipsis =
              previous !== undefined &&
              pageNumber - previous > 1;

            return (
              <div
                key={pageNumber}
                className="flex items-center gap-1.5"
              >
                {needsEllipsis && (
                  <span className="px-1 text-xs font-bold text-slate-400">
                    …
                  </span>
                )}

                {pageNumber === page ? (
                  <span
                    aria-current="page"
                    className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#0b4da2] px-3 text-xs font-black text-white shadow-sm sm:h-11 sm:min-w-11"
                  >
                    {pageNumber}
                  </span>
                ) : (
                  <Link
                    href={createHref(
                      params,
                      pageNumber,
                      basePath,
                    )}
                    className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 transition hover:border-[#ff6b00] hover:text-[#ff6b00] sm:h-11 sm:min-w-11"
                  >
                    {pageNumber}
                  </Link>
                )}
              </div>
            );
          },
        )}
      </div>

      {page < totalPages ? (
        <Link
          href={createHref(
            params,
            page + 1,
            basePath,
          )}
          aria-label="Page suivante"
          className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-[#0b4da2] sm:h-11 sm:px-4 sm:text-sm"
        >
          <span className="hidden sm:inline">
            Suivant
          </span>
          <ChevronRight
            size={17}
          />
        </Link>
      ) : (
        <span className="flex h-10 cursor-not-allowed items-center rounded-xl border border-slate-100 bg-slate-100 px-3 text-slate-300 sm:h-11">
          <ChevronRight
            size={17}
          />
        </span>
      )}

      <p className="w-full pt-1 text-center text-[10px] font-semibold text-slate-400 sm:text-xs">
        Page {page} sur {totalPages}
      </p>
    </nav>
  );
}
