"use client";

import Image from "next/image";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Advertisement,
} from "@/types/api";

import {
  Countdown,
} from "./countdown";


interface HeroAdSliderProps {
  advertisements: Advertisement[];
}


const PUBLIC_API =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api/v1";


const AUTO_SLIDE_DELAY =
  2800;


function formatPrice(
  value:
    | string
    | number
    | null
    | undefined,
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount,
    )
  ) {
    return "";
  }

  return (
    amount.toLocaleString(
      "fr-FR",
      {
        maximumFractionDigits:
          0,
      },
    )
    + " F CFA"
  );
}


function calculateDiscount(
  oldPrice:
    | string
    | number
    | null
    | undefined,

  newPrice:
    | string
    | number
    | null
    | undefined,
) {
  const oldAmount =
    Number(
      oldPrice,
    );

  const newAmount =
    Number(
      newPrice,
    );

  if (
    !Number.isFinite(
      oldAmount,
    )
    ||
    !Number.isFinite(
      newAmount,
    )
    ||
    oldAmount <= 0
    ||
    newAmount < 0
    ||
    newAmount >=
      oldAmount
  ) {
    return null;
  }

  return Math.round(
    (
      (
        oldAmount -
        newAmount
      )
      /
      oldAmount
    )
    * 100,
  );
}


export function HeroAdSlider({
  advertisements,
}: HeroAdSliderProps) {
  const [
    index,
    setIndex,
  ] = useState(
    0,
  );

  const touchStart =
    useRef<
      number | null
    >(
      null,
    );


  const total =
    advertisements.length;


  const safeIndex =
    total > 0
      ? index % total
      : 0;


  const current =
    advertisements[
      safeIndex
    ];


  const currentId =
    current?.id ??
    null;


  const goNext =
    useCallback(
      () => {
        if (
          total <= 0
        ) {
          return;
        }

        setIndex(
          (
            value,
          ) =>
            (
              value + 1
            )
            %
            total,
        );
      },
      [
        total,
      ],
    );


  const goPrevious =
    useCallback(
      () => {
        if (
          total <= 0
        ) {
          return;
        }

        setIndex(
          (
            value,
          ) =>
            (
              value -
              1 +
              total
            )
            %
            total,
        );
      },
      [
        total,
      ],
    );


  /*
   * CARROUSEL AUTOMATIQUE
   *
   * Défilement rapide :
   * 2,8 secondes.
   *
   * Pas de pause
   * au survol.
   */
  useEffect(
    () => {
      if (
        total <= 1
      ) {
        return;
      }

      const timer =
        window.setInterval(
          goNext,
          AUTO_SLIDE_DELAY,
        );

      return () => {
        window.clearInterval(
          timer,
        );
      };
    },
    [
      total,
      goNext,
    ],
  );


  /*
   * STATISTIQUES
   * IMPRESSION PUBLICITAIRE
   */
  useEffect(
    () => {
      if (
        currentId ===
        null
      ) {
        return;
      }

      fetch(
        (
          `${PUBLIC_API}`
          + "/marketing/"
          + "advertisements/"
          + `${currentId}/`
          + "impression/"
        ),
        {
          method:
            "POST",
        },
      ).catch(
        () =>
          undefined,
      );
    },
    [
      currentId,
    ],
  );


  /*
   * CLIC PUBLICITAIRE
   */
  async function handleClick(
    advertisement:
      Advertisement,
  ) {
    let destination =
      advertisement
        .effective_link;

    try {
      const response =
        await fetch(
          (
            `${PUBLIC_API}`
            + "/marketing/"
            + "advertisements/"
            + `${advertisement.id}/`
            + "click/"
          ),
          {
            method:
              "POST",
          },
        );

      if (
        response.ok
      ) {
        const data =
          await response
            .json();

        destination =
          data.redirect_url
          ??
          destination;
      }
    } catch {
      /*
       * Même si le tracking
       * échoue,
       * la publicité reste
       * cliquable.
       */
    }

    if (
      destination
    ) {
      window.location.assign(
        destination,
      );
    }
  }


  /*
   * SWIPE MOBILE
   */
  function handleTouchEnd(
    event:
      React.TouchEvent,
  ) {
    if (
      touchStart.current
      === null
    ) {
      return;
    }

    const end =
      event
        .changedTouches[
          0
        ]
        .clientX;

    const difference =
      touchStart.current
      -
      end;


    if (
      difference >
      45
    ) {
      goNext();
    }


    if (
      difference <
      -45
    ) {
      goPrevious();
    }


    touchStart.current =
      null;
  }


  /*
   * AUCUNE PUBLICITÉ
   */
  if (
    !current
  ) {
    return (
      <section className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-[20px] bg-gradient-to-r from-[#0b4da2] to-[#061f43] px-5 py-7 text-white sm:px-8">

        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">
          SUGU KURA
        </p>

        <h1 className="mt-2 text-2xl font-black sm:text-3xl">
          Tout ce qu&apos;il vous faut,
          au meilleur prix.
        </h1>

        <p className="mt-2 text-sm text-blue-100">
          Découvrez nos produits,
          nouveautés et promotions.
        </p>

      </section>
    );
  }


  return (
    <section className="mx-auto w-full max-w-[1080px]">

      <div
        className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm"
        onTouchStart={(
          event,
        ) => {
          touchStart.current =
            event
              .touches[
                0
              ]
              .clientX;
        }}
        onTouchEnd={
          handleTouchEnd
        }
      >

        {/* ================================
            CARROUSEL
        ================================= */}

        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform:
              `translateX(-${
                safeIndex
                *
                100
              }%)`,
          }}
        >

          {
            advertisements.map(
              (
                advertisement,
                position,
              ) => {

                const discount =
                  calculateDiscount(
                    advertisement
                      .display_old_price,

                    advertisement
                      .display_price,
                  );


                const hasPricePromotion =
                  discount !== null
                  &&
                  advertisement
                    .display_old_price
                    !== null
                  &&
                  advertisement
                    .display_old_price
                    !== undefined
                  &&
                  advertisement
                    .display_price
                    !== null
                  &&
                  advertisement
                    .display_price
                    !== undefined;


                const imageSource =
                  advertisement
                    .mobile_image
                  ??
                  advertisement
                    .desktop_image;


                return (
                  <article
                    key={
                      advertisement.id
                    }
                    className="min-w-full bg-white"
                  >

                    {/* ========================
                        IMAGE PUBLICITAIRE
                    ========================= */}

                    <div className="relative h-[165px] w-full overflow-hidden bg-slate-900 sm:h-[195px] md:h-[215px] lg:h-[240px]">

                      {/* FOND FLOUTÉ */}

                      <Image
                        src={
                          position
                          ===
                          safeIndex
                            ? imageSource
                            : advertisement
                                .desktop_image
                        }
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="(max-width: 1100px) 100vw, 1080px"
                        className="scale-110 object-cover opacity-35 blur-xl"
                      />


                      <div className="absolute inset-0 bg-slate-950/15" />


                      {/* IMAGE MOBILE */}

                      <Image
                        src={
                          imageSource
                        }
                        alt={
                          advertisement
                            .title
                        }
                        fill
                        priority={
                          position
                          ===
                          0
                        }
                        sizes="100vw"
                        className="object-contain p-1.5 md:hidden"
                      />


                      {/* IMAGE DESKTOP */}

                      <Image
                        src={
                          advertisement
                            .desktop_image
                        }
                        alt={
                          advertisement
                            .title
                        }
                        fill
                        priority={
                          position
                          ===
                          0
                        }
                        sizes="(max-width: 1100px) 100vw, 1080px"
                        className="hidden object-contain p-2 md:block"
                      />


                      {/* SPONSORISÉ */}

                      <span className="absolute left-3 top-3 z-20 rounded-full bg-[#ff6b00] px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-white shadow-lg sm:text-[9px]">
                        Sponsorisé
                      </span>


                      {/* ========================
                          POURCENTAGE PROMOTION
                      ========================= */}

                      {
                        discount !==
                        null && (
                        <div className="absolute right-3 top-3 z-20 rounded-xl border-2 border-yellow-300 bg-red-600 px-3 py-1.5 text-center shadow-xl">

                          <span className="block text-[7px] font-black uppercase tracking-wider text-yellow-100">
                            Promo
                          </span>

                          <strong className="block text-xl font-black leading-none text-white sm:text-2xl">
                            -
                            {
                              discount
                            }
                            %
                          </strong>

                        </div>
                      )}

                    </div>


                    {/* ========================
                        INFOS SOUS LA PUB
                    ========================= */}

                    <div className="flex min-h-[74px] flex-col gap-2 border-t border-slate-100 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="text-[9px] font-black uppercase tracking-wider text-[#0b4da2] sm:text-[10px]">
                            {
                              advertisement
                                .company_name
                            }
                          </p>


                          {
                            advertisement
                              .promotion
                              ?.badge_text
                            &&
                            (
                              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[8px] font-black text-[#ff6b00]">

                                {
                                  advertisement
                                    .promotion
                                    .badge_text
                                }

                              </span>
                            )
                          }

                        </div>


                        <h2 className="mt-0.5 truncate text-sm font-black text-slate-950 sm:text-base">
                          {
                            advertisement
                              .title
                          }
                        </h2>

                      </div>


                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">

                        {/* =====================
                            PRIX PROMOTION
                        ====================== */}

                        {
                          hasPricePromotion
                          &&
                          (
                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-2">

                              <span className="text-[10px] font-bold text-slate-400 line-through decoration-red-500 decoration-2 sm:text-xs">

                                {
                                  formatPrice(
                                    advertisement
                                      .display_old_price,
                                  )
                                }

                              </span>


                              <strong className="text-sm font-black text-[#0b4da2] sm:text-base">

                                {
                                  formatPrice(
                                    advertisement
                                      .display_price,
                                  )
                                }

                              </strong>

                            </div>
                          )
                        }


                        {/* COMPTE À REBOURS */}

                        {
                          advertisement
                            .remaining_seconds
                          >
                          0
                          &&
                          (
                            <div className="hidden rounded-lg bg-orange-50 px-2.5 py-2 text-[9px] font-bold text-orange-700 lg:block">

                              Fin dans{" "}

                              <Countdown
                                seconds={
                                  advertisement
                                    .remaining_seconds
                                }
                              />

                            </div>
                          )
                        }


                        {/* CTA */}

                        <button
                          type="button"
                          onClick={() =>
                            handleClick(
                              advertisement,
                            )
                          }
                          className="rounded-xl bg-[#ff6b00] px-3.5 py-2.5 text-[10px] font-black text-white transition hover:bg-[#e85f00] sm:text-xs"
                        >

                          {
                            advertisement
                              .button_text
                            ||
                            "Voir l'offre"
                          }

                        </button>

                      </div>

                    </div>

                  </article>
                );
              },
            )
          }

        </div>


        {/* ================================
            FLÈCHES
        ================================= */}

        {
          total > 1
          &&
          (
            <>

              <button
                type="button"
                onClick={
                  goPrevious
                }
                aria-label="Publicité précédente"
                className="absolute left-2 top-[82px] z-30 hidden h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-white hover:text-slate-900 sm:top-[98px] sm:flex md:top-[108px] lg:top-[120px]"
              >

                <ChevronLeft
                  size={
                    18
                  }
                />

              </button>


              <button
                type="button"
                onClick={
                  goNext
                }
                aria-label="Publicité suivante"
                className="absolute right-2 top-[82px] z-30 hidden h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-white hover:text-slate-900 sm:top-[98px] sm:flex md:top-[108px] lg:top-[120px]"
              >

                <ChevronRight
                  size={
                    18
                  }
                />

              </button>

            </>
          )
        }

      </div>


      {/* ================================
          INDICATEURS
      ================================= */}

      {
        total > 1
        &&
        (
          <div className="mt-2.5 flex justify-center gap-1.5">

            {
              advertisements.map(
                (
                  advertisement,
                  position,
                ) => (
                  <button
                    key={
                      advertisement.id
                    }
                    type="button"
                    onClick={() =>
                      setIndex(
                        position,
                      )
                    }
                    aria-label={
                      `Publicité ${
                        position
                        +
                        1
                      }`
                    }
                    className={`h-2 rounded-full transition-all ${
                      position
                      ===
                      safeIndex
                        ? "w-7 bg-[#ff6b00]"
                        : "w-2 bg-slate-300"
                    }`}
                  />
                ),
              )
            }

          </div>
        )
      }

    </section>
  );
}