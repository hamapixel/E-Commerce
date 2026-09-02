import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";


interface SearchPaginationProps {
  count: number;
  page: number;
  pageSize: number;
  params: Record<
    string,
    string
  >;
}


function createHref(
  params: Record<string, string>,
  page: number,
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
    ? `/recherche?${value}`
    : "/recherche";
}


export function SearchPagination({
  count,
  page,
  pageSize,
  params,
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

  return (
    <nav className="mt-10 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link
          href={createHref(
            params,
            page - 1,
          )}
          className="flex h-11 items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-[#0b4da2]"
        >
          <ChevronLeft
            size={17}
          />
          Précédent
        </Link>
      ) : (
        <span className="flex h-11 cursor-not-allowed items-center gap-1 rounded-xl border border-slate-100 bg-slate-100 px-4 text-sm font-bold text-slate-300">
          <ChevronLeft
            size={17}
          />
          Précédent
        </span>
      )}

      <span className="rounded-xl bg-[#0b4da2] px-4 py-3 text-xs font-black text-white">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={createHref(
            params,
            page + 1,
          )}
          className="flex h-11 items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-[#0b4da2]"
        >
          Suivant
          <ChevronRight
            size={17}
          />
        </Link>
      ) : (
        <span className="flex h-11 cursor-not-allowed items-center gap-1 rounded-xl border border-slate-100 bg-slate-100 px-4 text-sm font-bold text-slate-300">
          Suivant
          <ChevronRight
            size={17}
          />
        </span>
      )}
    </nav>
  );
}