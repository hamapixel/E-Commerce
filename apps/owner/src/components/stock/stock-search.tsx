"use client";

import {
  Search,
  X,
} from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useEffect,
  useState,
  useTransition,
} from "react";


interface StockSearchProps {
  initialQuery: string;
  initialStatus: string;
}


export default function StockSearch({
  initialQuery,
  initialStatus,
}: StockSearchProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [
    query,
    setQuery,
  ] = useState(
    initialQuery,
  );

  const [
    isPending,
    startTransition,
  ] = useTransition();


  // ============================================================
  // STATUT ACTUEL
  // ============================================================

  const currentStatus =
    searchParams.get(
      "status",
    ) ??
    initialStatus;


  // ============================================================
  // RECHERCHE INSTANTANÉE
  // ============================================================

  useEffect(() => {
    const timeout =
      window.setTimeout(
        () => {
          const cleanQuery =
            query.trim();

          const urlQuery =
            searchParams.get(
              "q",
            ) ?? "";


          if (
            cleanQuery ===
            urlQuery
          ) {
            return;
          }


          const params =
            new URLSearchParams(
              searchParams.toString(),
            );


          if (cleanQuery) {
            params.set(
              "q",
              cleanQuery,
            );
          } else {
            params.delete(
              "q",
            );
          }


          /*
           * Nouvelle recherche :
           * retour page 1.
           */
          params.delete(
            "page",
          );


          /*
           * Supprime les anciens
           * messages de succès.
           */
          params.delete(
            "stock_updated",
          );

          params.delete(
            "operation",
          );


          const queryString =
            params.toString();


          const url =
            queryString
              ? `${pathname}?${queryString}`
              : pathname;


          startTransition(
            () => {
              router.replace(
                url,
                {
                  scroll: false,
                },
              );
            },
          );
        },
        350,
      );


    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    pathname,
    query,
    router,
    searchParams,
  ]);


  // ============================================================
  // FILTRE STATUT
  // ============================================================

  function changeStatus(
    newStatus: string,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );


    if (newStatus) {
      params.set(
        "status",
        newStatus,
      );
    } else {
      params.delete(
        "status",
      );
    }


    params.delete(
      "page",
    );

    params.delete(
      "stock_updated",
    );

    params.delete(
      "operation",
    );


    const queryString =
      params.toString();


    const url =
      queryString
        ? `${pathname}?${queryString}`
        : pathname;


    startTransition(
      () => {
        router.replace(
          url,
          {
            scroll: false,
          },
        );
      },
    );
  }


  // ============================================================
  // EFFACER UNIQUEMENT LA RECHERCHE
  // ============================================================

  function clearQuery() {
    setQuery(
      "",
    );


    const params =
      new URLSearchParams(
        searchParams.toString(),
      );


    params.delete(
      "q",
    );

    params.delete(
      "page",
    );

    params.delete(
      "stock_updated",
    );

    params.delete(
      "operation",
    );


    const queryString =
      params.toString();


    startTransition(
      () => {
        router.replace(
          queryString
            ? `${pathname}?${queryString}`
            : pathname,
          {
            scroll: false,
          },
        );
      },
    );
  }


  // ============================================================
  // TOUT EFFACER
  // ============================================================

  function clearAll() {
    setQuery(
      "",
    );


    startTransition(
      () => {
        router.replace(
          pathname,
          {
            scroll: false,
          },
        );
      },
    );
  }


  return (
    <section className="mt-7 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

      <div className="grid gap-3 lg:grid-cols-[1fr_220px]">

        {/* =====================================================
            RECHERCHE
        ===================================================== */}

        <div className="relative">

          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />


          <input
            type="search"
            value={query}
            onChange={(
              event,
            ) => {
              setQuery(
                event.target.value,
              );
            }}
            autoComplete="off"
            spellCheck={false}
            placeholder="Rechercher nom, SKU ou code-barres..."
            className="
              h-12
              w-full
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-11
              pr-11
              text-sm
              text-slate-900
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-[#ff6b00]
              focus:bg-white
            "
          />


          {query.length >
            0 && (
            <button
              type="button"
              onClick={
                clearQuery
              }
              aria-label="Effacer la recherche"
              className="
                absolute
                right-3
                top-1/2
                flex
                h-8
                w-8
                -translate-y-1/2
                items-center
                justify-center
                rounded-lg
                text-slate-400
                transition
                hover:bg-slate-200
                hover:text-slate-700
              "
            >
              <X
                size={16}
              />
            </button>
          )}
        </div>


        {/* =====================================================
            FILTRE STOCK
        ===================================================== */}

        <select
          value={
            currentStatus
          }
          onChange={(
            event,
          ) => {
            changeStatus(
              event.target.value,
            );
          }}
          className="
            h-12
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-sm
            font-bold
            text-slate-700
            outline-none
            transition
            focus:border-[#0b4da2]
          "
        >
          <option value="">
            Tous les stocks
          </option>

          <option value="IN_STOCK">
            En stock
          </option>

          <option value="LOW_STOCK">
            Stock faible
          </option>

          <option value="OUT_OF_STOCK">
            Rupture
          </option>
        </select>
      </div>


      {/* =====================================================
          BAS DE RECHERCHE
      ===================================================== */}

      <div className="mt-3 flex min-h-6 flex-wrap items-center justify-between gap-3">

        <p className="text-[10px] font-semibold text-slate-400">
          La recherche se lance
          automatiquement pendant
          la saisie.
        </p>


        <div className="flex items-center gap-3">

          {isPending && (
            <span className="inline-flex items-center gap-2 text-[10px] font-black text-[#0b4da2]">

              <span className="h-2 w-2 animate-pulse rounded-full bg-[#0b4da2]" />

              Recherche...
            </span>
          )}


          {(query ||
            currentStatus) && (
            <button
              type="button"
              onClick={
                clearAll
              }
              className="text-[10px] font-black text-[#ff6b00] transition hover:underline"
            >
              Tout effacer
            </button>
          )}
        </div>
      </div>
    </section>
  );
}