"use client";

import Link from "next/link";

import {
  Grid2X2,
  Heart,
  Home,
  Menu,
  PackageSearch,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useCartStore,
} from "@/store/cart-store";


type CountryFlagProps = {
  country:
    | "ML"
    | "NE"
    | "BF"
    | "CI";
};


function CountryFlag({
  country,
}: CountryFlagProps) {
  if (
    country === "ML"
  ) {
    return (
      <svg
        viewBox="0 0 30 20"
        className="h-[14px] w-[21px] shrink-0 overflow-hidden rounded-[2px] shadow-sm ring-1 ring-white/30 sm:h-4 sm:w-6"
        aria-label="Drapeau du Mali"
        role="img"
      >
        <rect
          width="10"
          height="20"
          x="0"
          fill="#14B53A"
        />

        <rect
          width="10"
          height="20"
          x="10"
          fill="#FCD116"
        />

        <rect
          width="10"
          height="20"
          x="20"
          fill="#CE1126"
        />
      </svg>
    );
  }


  if (
    country === "NE"
  ) {
    return (
      <svg
        viewBox="0 0 30 20"
        className="h-[14px] w-[21px] shrink-0 overflow-hidden rounded-[2px] shadow-sm ring-1 ring-white/30 sm:h-4 sm:w-6"
        aria-label="Drapeau du Niger"
        role="img"
      >
        <rect
          width="30"
          height="6.67"
          y="0"
          fill="#E05206"
        />

        <rect
          width="30"
          height="6.67"
          y="6.67"
          fill="#FFFFFF"
        />

        <rect
          width="30"
          height="6.66"
          y="13.34"
          fill="#0DB02B"
        />

        <circle
          cx="15"
          cy="10"
          r="2.8"
          fill="#E05206"
        />
      </svg>
    );
  }


  if (
    country === "BF"
  ) {
    return (
      <svg
        viewBox="0 0 30 20"
        className="h-[14px] w-[21px] shrink-0 overflow-hidden rounded-[2px] shadow-sm ring-1 ring-white/30 sm:h-4 sm:w-6"
        aria-label="Drapeau du Burkina Faso"
        role="img"
      >
        <rect
          width="30"
          height="10"
          y="0"
          fill="#EF2B2D"
        />

        <rect
          width="30"
          height="10"
          y="10"
          fill="#009E49"
        />

        <polygon
          points="
            15,5.8
            16.2,8.5
            19.2,8.8
            17,10.8
            17.7,13.8
            15,12.2
            12.3,13.8
            13,10.8
            10.8,8.8
            13.8,8.5
          "
          fill="#FCD116"
        />
      </svg>
    );
  }


  return (
    <svg
      viewBox="0 0 30 20"
      className="h-[14px] w-[21px] shrink-0 overflow-hidden rounded-[2px] shadow-sm ring-1 ring-white/30 sm:h-4 sm:w-6"
      aria-label="Drapeau de Côte d'Ivoire"
      role="img"
    >
      <rect
        width="10"
        height="20"
        x="0"
        fill="#F77F00"
      />

      <rect
        width="10"
        height="20"
        x="10"
        fill="#FFFFFF"
      />

      <rect
        width="10"
        height="20"
        x="20"
        fill="#009E60"
      />
    </svg>
  );
}


export function Header() {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(
    false,
  );


  const items =
    useCartStore(
      (
        state,
      ) =>
        state.items,
    );


  const hasHydrated =
    useCartStore(
      (
        state,
      ) =>
        state.hasHydrated,
    );


  const totalItems =
    hasHydrated
      ? items.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.quantity,
          0,
        )
      : 0;


  function closeMenu() {
    setMenuOpen(
      false,
    );
  }


  return (
    <>

      <header className="sticky top-0 z-[70] border-b border-slate-200 bg-white/95 backdrop-blur-xl">

        {/* =====================================
            TOP BAR INTERNATIONALE
        ===================================== */}

        <div className="bg-[#0b4da2] text-white">

          <div className="mx-auto flex max-w-[1440px] items-center gap-4 overflow-hidden px-3 py-2 sm:px-6">

            {/* LIVRAISON */}

            <span className="hidden shrink-0 text-xs font-bold lg:block">
              Livraison rapide
            </span>


            {/* PAYS */}

            <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">


              {/* MALI */}

              <div className="flex shrink-0 items-center gap-1.5">

                <CountryFlag
                  country="ML"
                />

                <span className="text-[9px] font-bold sm:text-[11px]">
                  Mali
                </span>

                <span className="text-[9px] font-black text-orange-300 sm:text-[11px]">
                  +223
                </span>

              </div>


              <span className="text-white/30">
                •
              </span>


              {/* NIGER */}

              <div className="flex shrink-0 items-center gap-1.5">

                <CountryFlag
                  country="NE"
                />

                <span className="text-[9px] font-bold sm:text-[11px]">
                  Niger
                </span>

                <span className="text-[9px] font-black text-orange-300 sm:text-[11px]">
                  +227
                </span>

              </div>


              <span className="text-white/30">
                •
              </span>


              {/* BURKINA FASO */}

              <div className="flex shrink-0 items-center gap-1.5">

                <CountryFlag
                  country="BF"
                />

                <span className="text-[9px] font-bold sm:text-[11px]">
                  Burkina Faso
                </span>

                <span className="text-[9px] font-black text-orange-300 sm:text-[11px]">
                  +226
                </span>

              </div>


              <span className="text-white/30">
                •
              </span>


              {/* COTE D'IVOIRE */}

              <div className="flex shrink-0 items-center gap-1.5">

                <CountryFlag
                  country="CI"
                />

                <span className="text-[9px] font-bold sm:text-[11px]">
                  Côte d&apos;Ivoire
                </span>

                <span className="text-[9px] font-black text-orange-300 sm:text-[11px]">
                  +225
                </span>

              </div>

            </div>


            {/* MESSAGE DESKTOP */}

            <span className="hidden shrink-0 text-[10px] font-semibold text-blue-100 xl:block">
              SUGU KURA — Shopping nouvelle génération
            </span>

          </div>

        </div>


        {/* =====================================
            HEADER PRINCIPAL
        ===================================== */}

        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6 lg:gap-8">

          {/* MENU HAMBURGER */}

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                true,
              )
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 transition hover:border-[#ff6b00] hover:text-[#ff6b00] active:scale-95 lg:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={
              menuOpen
            }
          >
            <Menu
              size={
                21
              }
            />
          </button>


          {/* =====================================
              LOGO
          ===================================== */}

          <Link
            href="/"
            className="shrink-0"
          >

            <div className="text-xl font-black tracking-tight sm:text-2xl">

              <span className="text-[#ff6b00]">
                SUGU
              </span>

              {" "}

              <span className="text-[#0b4da2]">
                KURA
              </span>

            </div>


            <div className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
              Shopping nouvelle génération
            </div>

          </Link>


          {/* =====================================
              RECHERCHE DESKTOP
          ===================================== */}

          <form
            action="/recherche"
            method="get"
            className="hidden flex-1 md:block"
          >

            <div className="flex h-12 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 transition focus-within:border-[#ff6b00] focus-within:bg-white">

              <div className="flex items-center pl-4 text-slate-400">

                <Search
                  size={
                    20
                  }
                />

              </div>


              <input
                type="search"
                name="search"
                placeholder="Rechercher téléphone, ampoule, casque, ventilateur..."
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              />


              <button
                type="submit"
                className="bg-[#ff6b00] px-6 text-sm font-bold text-white transition hover:bg-[#e85f00]"
              >
                Rechercher
              </button>

            </div>

          </form>


          {/* =====================================
              ACTIONS
          ===================================== */}

          <div className="ml-auto flex items-center gap-1 sm:gap-2">

            {/* FAVORIS */}

            <Link
              href="/favoris"
              className="hidden h-11 w-11 items-center justify-center rounded-xl text-slate-700 transition hover:bg-orange-50 hover:text-[#ff6b00] sm:flex"
              aria-label="Favoris"
            >

              <Heart
                size={
                  21
                }
              />

            </Link>


            {/* PANIER */}

            <Link
              href="/panier"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b4da2] text-white transition hover:bg-[#083b7f]"
              aria-label={`Panier, ${totalItems} article(s)`}
            >

              <ShoppingCart
                size={
                  21
                }
              />


              {totalItems >
                0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff6b00] px-1 text-[10px] font-black text-white">

                  {
                    totalItems >
                    99
                      ? "99+"
                      : totalItems
                  }

                </span>
              )}

            </Link>

          </div>

        </div>


        {/* =====================================
            RECHERCHE MOBILE
        ===================================== */}

        <form
          action="/recherche"
          method="get"
          className="px-4 pb-3 md:hidden"
        >

          <div className="flex h-11 items-center rounded-xl bg-slate-100 px-3">

            <Search
              size={
                18
              }
              className="text-slate-400"
            />


            <input
              type="search"
              name="search"
              placeholder="Que recherchez-vous ?"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
            />


            <button
              type="submit"
              className="text-xs font-black text-[#ff6b00]"
            >
              Chercher
            </button>

          </div>

        </form>

      </header>


      {/* =====================================
          MENU MOBILE
      ===================================== */}

      {menuOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">

          {/* FOND */}

          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={
              closeMenu
            }
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          />


          {/* =====================================
              DRAWER
          ===================================== */}

          <aside className="absolute inset-y-0 left-0 flex w-[86%] max-w-[330px] flex-col bg-white shadow-2xl">

            {/* ENTETE */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">

              <Link
                href="/"
                onClick={
                  closeMenu
                }
              >

                <div className="text-xl font-black">

                  <span className="text-[#ff6b00]">
                    SUGU
                  </span>

                  {" "}

                  <span className="text-[#0b4da2]">
                    KURA
                  </span>

                </div>


                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Shopping nouvelle génération
                </p>

              </Link>


              <button
                type="button"
                onClick={
                  closeMenu
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Fermer"
              >

                <X
                  size={
                    21
                  }
                />

              </button>

            </div>


            {/* =====================================
                LIENS MENU
            ===================================== */}

            <nav className="flex-1 overflow-y-auto px-3 py-4">

              <div className="space-y-1">


                {/* ACCUEIL */}

                <Link
                  href="/"
                  onClick={
                    closeMenu
                  }
                  className="flex items-center gap-4 rounded-2xl px-4 py-3.5 font-bold text-slate-700 transition hover:bg-blue-50 hover:text-[#0b4da2]"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0b4da2]">

                    <Home
                      size={
                        20
                      }
                    />

                  </div>

                  Accueil

                </Link>


                {/* CATEGORIES */}

                <Link
                  href="/#categories"
                  onClick={
                    closeMenu
                  }
                  className="flex items-center gap-4 rounded-2xl px-4 py-3.5 font-bold text-slate-700 transition hover:bg-orange-50 hover:text-[#ff6b00]"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00]">

                    <Grid2X2
                      size={
                        20
                      }
                    />

                  </div>

                  Catégories

                </Link>


                {/* PRODUITS */}

                <Link
                  href="/#products"
                  onClick={
                    closeMenu
                  }
                  className="flex items-center gap-4 rounded-2xl px-4 py-3.5 font-bold text-slate-700 transition hover:bg-blue-50 hover:text-[#0b4da2]"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0b4da2]">

                    <PackageSearch
                      size={
                        20
                      }
                    />

                  </div>

                  Produits

                </Link>


                {/* RECHERCHE */}

                <Link
                  href="/recherche"
                  onClick={
                    closeMenu
                  }
                  className="flex items-center gap-4 rounded-2xl px-4 py-3.5 font-bold text-slate-700 transition hover:bg-orange-50 hover:text-[#ff6b00]"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00]">

                    <Search
                      size={
                        20
                      }
                    />

                  </div>

                  Rechercher

                </Link>


                {/* FAVORIS */}

                <Link
                  href="/favoris"
                  onClick={
                    closeMenu
                  }
                  className="flex items-center gap-4 rounded-2xl px-4 py-3.5 font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">

                    <Heart
                      size={
                        20
                      }
                    />

                  </div>

                  Mes favoris

                </Link>


                {/* PANIER */}

                <Link
                  href="/panier"
                  onClick={
                    closeMenu
                  }
                  className="flex items-center gap-4 rounded-2xl px-4 py-3.5 font-bold text-slate-700 transition hover:bg-blue-50 hover:text-[#0b4da2]"
                >

                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0b4da2]">

                    <ShoppingCart
                      size={
                        20
                      }
                    />


                    {totalItems >
                      0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6b00] px-1 text-[8px] font-black text-white">

                        {
                          totalItems >
                          99
                            ? "99+"
                            : totalItems
                        }

                      </span>
                    )}

                  </div>

                  Mon panier

                </Link>

              </div>

            </nav>


            {/* =====================================
                BAS DU MENU
            ===================================== */}

            <div className="border-t border-slate-200 bg-slate-50 p-4">

              <div className="rounded-2xl bg-gradient-to-r from-[#0b4da2] to-[#07336d] p-4 text-white">

                <p className="text-xs font-black uppercase tracking-wider text-orange-300">
                  SUGU KURA
                </p>


                <p className="mt-1 text-sm font-bold">
                  La technologie au meilleur prix.
                </p>


                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">

                  <div className="flex items-center gap-1.5">

                    <CountryFlag
                      country="ML"
                    />

                    <span className="text-[9px] text-blue-100">
                      Mali
                    </span>

                  </div>


                  <div className="flex items-center gap-1.5">

                    <CountryFlag
                      country="NE"
                    />

                    <span className="text-[9px] text-blue-100">
                      Niger
                    </span>

                  </div>


                  <div className="flex items-center gap-1.5">

                    <CountryFlag
                      country="BF"
                    />

                    <span className="text-[9px] text-blue-100">
                      Burkina Faso
                    </span>

                  </div>


                  <div className="flex items-center gap-1.5">

                    <CountryFlag
                      country="CI"
                    />

                    <span className="text-[9px] text-blue-100">
                      Côte d&apos;Ivoire
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </aside>

        </div>
      )}

    </>
  );
}