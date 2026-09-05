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
  useEffect,
  useState,
} from "react";

import {
  HeaderInstantSearch,
} from "@/components/search/header-instant-search";

import {
  useCartStore,
} from "@/store/cart-store";


type CountryCode =
  | "ML"
  | "NE"
  | "BF"
  | "CI";


function CountryFlag({
  country,
}: {
  country: CountryCode;
}) {
  if (country === "ML") {
    return (
      <svg
        viewBox="0 0 30 20"
        className="h-[14px] w-[21px] shrink-0 rounded-[2px] ring-1 ring-white/30 sm:h-4 sm:w-6"
        role="img"
        aria-label="Drapeau du Mali"
      >
        <rect width="10" height="20" x="0" fill="#14B53A" />
        <rect width="10" height="20" x="10" fill="#FCD116" />
        <rect width="10" height="20" x="20" fill="#CE1126" />
      </svg>
    );
  }

  if (country === "NE") {
    return (
      <svg
        viewBox="0 0 30 20"
        className="h-[14px] w-[21px] shrink-0 rounded-[2px] ring-1 ring-white/30 sm:h-4 sm:w-6"
        role="img"
        aria-label="Drapeau du Niger"
      >
        <rect width="30" height="6.67" y="0" fill="#E05206" />
        <rect width="30" height="6.67" y="6.67" fill="#FFFFFF" />
        <rect width="30" height="6.66" y="13.34" fill="#0DB02B" />
        <circle cx="15" cy="10" r="2.8" fill="#E05206" />
      </svg>
    );
  }

  if (country === "BF") {
    return (
      <svg
        viewBox="0 0 30 20"
        className="h-[14px] w-[21px] shrink-0 rounded-[2px] ring-1 ring-white/30 sm:h-4 sm:w-6"
        role="img"
        aria-label="Drapeau du Burkina Faso"
      >
        <rect width="30" height="10" y="0" fill="#EF2B2D" />
        <rect width="30" height="10" y="10" fill="#009E49" />
        <polygon
          points="15,5.8 16.2,8.5 19.2,8.8 17,10.8 17.7,13.8 15,12.2 12.3,13.8 13,10.8 10.8,8.8 13.8,8.5"
          fill="#FCD116"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 30 20"
      className="h-[14px] w-[21px] shrink-0 rounded-[2px] ring-1 ring-white/30 sm:h-4 sm:w-6"
      role="img"
      aria-label="Drapeau de Côte d'Ivoire"
    >
      <rect width="10" height="20" x="0" fill="#F77F00" />
      <rect width="10" height="20" x="10" fill="#FFFFFF" />
      <rect width="10" height="20" x="20" fill="#009E60" />
    </svg>
  );
}


const countries: Array<{
  code: CountryCode;
  name: string;
  dial: string;
}> = [
  {
    code: "ML",
    name: "Mali",
    dial: "+223",
  },
  {
    code: "NE",
    name: "Niger",
    dial: "+227",
  },
  {
    code: "BF",
    name: "Burkina Faso",
    dial: "+226",
  },
  {
    code: "CI",
    name: "Côte d’Ivoire",
    dial: "+225",
  },
];


export function Header() {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const items =
    useCartStore(
      (state) => state.items,
    );

  const hasHydrated =
    useCartStore(
      (state) => state.hasHydrated,
    );

  const totalItems =
    hasHydrated
      ? items.reduce(
          (
            total,
            item,
          ) =>
            total + item.quantity,
          0,
        )
      : 0;

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(
    () => {
      if (!menuOpen) {
        return;
      }

      const previousOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        "hidden";

      const onKeyDown = (
        event: KeyboardEvent,
      ) => {
        if (event.key === "Escape") {
          setMenuOpen(false);
        }
      };

      window.addEventListener(
        "keydown",
        onKeyDown,
      );

      return () => {
        document.body.style.overflow =
          previousOverflow;

        window.removeEventListener(
          "keydown",
          onKeyDown,
        );
      };
    },
    [menuOpen],
  );

  const menuLinks = [
    {
      href: "/",
      label: "Accueil",
      icon: Home,
      tone: "blue",
    },
    {
      href: "/#categories",
      label: "Catégories",
      icon: Grid2X2,
      tone: "orange",
    },
    {
      href: "/#products",
      label: "Produits",
      icon: PackageSearch,
      tone: "blue",
    },
    {
      href: "/recherche",
      label: "Rechercher",
      icon: Search,
      tone: "orange",
    },
    {
      href: "/favoris",
      label: "Mes favoris",
      icon: Heart,
      tone: "red",
    },
    {
      href: "/panier",
      label: "Mon panier",
      icon: ShoppingCart,
      tone: "blue",
    },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-[70] border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="bg-[#0b4da2] text-white">
          <div className="mx-auto flex max-w-[1440px] items-center gap-4 overflow-hidden px-3 py-2 sm:px-6">
            <span className="hidden shrink-0 text-xs font-bold lg:block">
              Livraison rapide
            </span>

            <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {countries.map(
                (
                  country,
                  index,
                ) => (
                  <div
                    key={country.code}
                    className="contents"
                  >
                    {index > 0 && (
                      <span className="text-white/30">
                        •
                      </span>
                    )}

                    <div className="flex shrink-0 items-center gap-1.5">
                      <CountryFlag
                        country={country.code}
                      />

                      <span className="text-[9px] font-bold sm:text-[11px]">
                        {country.name}
                      </span>

                      <span className="text-[9px] font-black text-orange-300 sm:text-[11px]">
                        {country.dial}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>

            <span className="hidden shrink-0 text-[10px] font-semibold text-blue-100 xl:block">
              SUGU KURA — Shopping nouvelle génération
            </span>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6 lg:gap-8">
          <button
            type="button"
            onClick={() =>
              setMenuOpen(true)
            }
            className="relative z-[75] flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 transition active:scale-95 lg:hidden"
            aria-label="Ouvrir le menu"
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
          >
            <Menu size={21} />
          </button>

          <Link
            href="/"
            className="shrink-0"
          >
            <div className="text-xl font-black tracking-tight sm:text-2xl">
              <span className="text-[#ff6b00]">
                SUGU
              </span>{" "}
              <span className="text-[#0b4da2]">
                KURA
              </span>
            </div>

            <div className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
              Shopping nouvelle génération
            </div>
          </Link>

          <HeaderInstantSearch
            variant="desktop"
          />

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/favoris"
              className="hidden h-11 w-11 items-center justify-center rounded-xl text-slate-700 transition hover:bg-orange-50 hover:text-[#ff6b00] sm:flex"
              aria-label="Favoris"
            >
              <Heart size={21} />
            </Link>

            <Link
              href="/panier"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#0b4da2] text-white transition hover:bg-[#083b7f]"
              aria-label={`Panier, ${totalItems} article(s)`}
            >
              <ShoppingCart size={21} />

              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff6b00] px-1 text-[10px] font-black text-white">
                  {totalItems > 99
                    ? "99+"
                    : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        <HeaderInstantSearch
          variant="mobile"
        />
      </header>

      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[100] lg:hidden ${
          menuOpen
            ? "pointer-events-auto visible"
            : "pointer-events-none invisible"
        }`}
      >
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={closeMenu}
          tabIndex={
            menuOpen
              ? 0
              : -1
          }
          className={`absolute inset-0 bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-200 ${
            menuOpen
              ? "opacity-100"
              : "opacity-0"
          }`}
        />

        <aside
          className={`absolute inset-y-0 left-0 flex w-[86%] max-w-[330px] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out ${
            menuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
            <Link
              href="/"
              onClick={closeMenu}
              tabIndex={
                menuOpen
                  ? 0
                  : -1
              }
            >
              <div className="text-xl font-black">
                <span className="text-[#ff6b00]">
                  SUGU
                </span>{" "}
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
              onClick={closeMenu}
              tabIndex={
                menuOpen
                  ? 0
                  : -1
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
              aria-label="Fermer"
            >
              <X size={21} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {menuLinks.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const iconClass =
                    item.tone === "orange"
                      ? "bg-orange-50 text-[#ff6b00]"
                      : item.tone === "red"
                        ? "bg-red-50 text-red-500"
                        : "bg-blue-50 text-[#0b4da2]";

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      tabIndex={
                        menuOpen
                          ? 0
                          : -1
                      }
                      className="flex items-center gap-4 rounded-2xl px-4 py-3.5 font-bold text-slate-700 transition active:bg-slate-100"
                    >
                      <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
                        <Icon size={20} />

                        {item.href === "/panier" && totalItems > 0 && (
                          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6b00] px-1 text-[8px] font-black text-white">
                            {totalItems > 99
                              ? "99+"
                              : totalItems}
                          </span>
                        )}
                      </div>

                      {item.label}
                    </Link>
                  );
                },
              )}
            </div>
          </nav>

          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="rounded-2xl bg-gradient-to-r from-[#0b4da2] to-[#07336d] p-4 text-white">
              <p className="text-xs font-black uppercase tracking-wider text-orange-300">
                SUGU KURA
              </p>

              <p className="mt-1 text-sm font-bold">
                La technologie au meilleur prix.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                {countries.map(
                  (country) => (
                    <div
                      key={country.code}
                      className="flex items-center gap-1.5"
                    >
                      <CountryFlag
                        country={country.code}
                      />

                      <span className="text-[9px] text-blue-100">
                        {country.name}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
