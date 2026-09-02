"use client";

import Link from "next/link";

import {
  Grid2X2,
  Heart,
  Home,
  Search,
  ShoppingCart,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  useCartStore,
} from "@/store/cart-store";


export function MobileNav() {
  const pathname =
    usePathname();


  const items =
    useCartStore(
      (
        state,
      ) => state.items,
    );


  const hasHydrated =
    useCartStore(
      (
        state,
      ) =>
        state.hasHydrated,
    );


  const cartCount =
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


  const navigation = [
    {
      label:
        "Accueil",

      href:
        "/",

      icon:
        Home,

      active:
        pathname === "/",
    },

    {
      label:
        "Catégories",

      href:
        "/#categories",

      icon:
        Grid2X2,

      active:
        false,
    },

    {
      label:
        "Recherche",

      href:
        "/recherche",

      icon:
        Search,

      active:
        pathname ===
        "/recherche",
    },

    {
      label:
        "Favoris",

      href:
        "/favoris",

      icon:
        Heart,

      active:
        pathname ===
        "/favoris",
    },

    {
      label:
        "Panier",

      href:
        "/panier",

      icon:
        ShoppingCart,

      badge:
        cartCount,

      active:
        pathname ===
        "/panier",
    },
  ];


  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden"
    >

      <div className="mx-auto grid max-w-xl grid-cols-5">

        {navigation.map(
          (
            item,
          ) => {
            const Icon =
              item.icon;


            return (
              <Link
                key={
                  item.label
                }
                href={
                  item.href
                }
                aria-label={
                  item.label
                }
                className={`relative flex min-h-16 flex-col items-center justify-center gap-1 transition active:scale-95 ${
                  item.active
                    ? "text-[#0b4da2]"
                    : "text-slate-500"
                }`}
              >

                <div className="relative">

                  <div
                    className={`flex h-8 w-10 items-center justify-center rounded-xl transition ${
                      item.active
                        ? "bg-blue-50 text-[#0b4da2]"
                        : "text-slate-500"
                    }`}
                  >

                    <Icon
                      size={
                        20
                      }
                      strokeWidth={
                        item.active
                          ? 2.5
                          : 2
                      }
                    />

                  </div>


                  {item.badge !==
                    undefined
                    &&
                    item.badge >
                      0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6b00] px-1 text-[8px] font-black text-white shadow-sm">

                      {
                        item.badge >
                        99
                          ? "99+"
                          : item.badge
                      }

                    </span>
                  )}

                </div>


                <span
                  className={`text-[10px] ${
                    item.active
                      ? "font-black text-[#0b4da2]"
                      : "font-semibold"
                  }`}
                >
                  {
                    item.label
                  }
                </span>


                {item.active && (
                  <span className="absolute bottom-1 h-1 w-5 rounded-full bg-[#ff6b00]" />
                )}

              </Link>
            );
          },
        )}

      </div>

    </nav>
  );
}