"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BadgeDollarSign,
  Bell,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  MoreHorizontal,
  PackageCheck,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  logoutAction,
} from "@/actions/owner";


interface OwnerMobileNavigationProps {
  displayName: string;
}


const navigation = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/catalogue",
    label: "Catalogue",
    icon: Store,
  },
  {
    href: "/commandes",
    label: "Commandes",
    icon: ShoppingCart,
  },
  {
    href: "/paiements",
    label: "Paiements",
    icon: BadgeDollarSign,
  },
  {
    href: "/stock",
    label: "Stock",
    icon: Boxes,
  },
  {
    href: "/publicites",
    label: "Publicités",
    icon: Megaphone,
  },
  {
    href: "/notifications",
    label: "Notifications",
    icon: Bell,
  },
];


const bottomNavigation = [
  navigation[0],
  navigation[1],
  navigation[2],
  navigation[4],
];


export function OwnerMobileNavigation({
  displayName,
}: OwnerMobileNavigationProps) {
  const pathname = usePathname();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

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
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
    };
  }, [menuOpen]);

  function isActive(
    href: string,
  ) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(
      href,
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(true)
            }
            className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15 active:scale-95"
          >
            <Menu size={21} />
          </button>

          <Link
            href="/"
            className="flex min-w-0 flex-1 items-center justify-center gap-2.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00] text-white shadow-md shadow-orange-500/20">
              <PackageCheck
                size={18}
              />
            </span>

            <span className="min-w-0">
              <strong className="block truncate text-sm font-black text-slate-950">
                SUGU KURA
              </strong>
              <span className="block truncate text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Console OWNER
              </span>
            </span>
          </Link>

          <Link
            href="/notifications"
            aria-label="Notifications"
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition active:scale-95 ${
              isActive("/notifications")
                ? "border-orange-200 bg-orange-50 text-[#ff6b00]"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <Bell size={19} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#ff6b00] ring-2 ring-white" />
          </Link>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[90] bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() =>
          setMenuOpen(false)
        }
        aria-hidden={!menuOpen}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[100] flex w-[86%] max-w-[340px] flex-col bg-slate-950 p-5 text-white shadow-2xl transition-transform duration-300 lg:hidden ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ff6b00] text-white shadow-lg shadow-orange-500/20">
              <PackageCheck
                size={21}
              />
            </span>

            <div className="min-w-0">
              <strong className="block truncate text-base font-black">
                SUGU KURA
              </strong>
              <span className="block truncate text-[10px] font-semibold text-slate-400">
                Gestion propriétaire
              </span>
            </div>
          </div>

          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() =>
              setMenuOpen(false)
            }
            className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 active:scale-95"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Connecté comme
          </span>
          <strong className="mt-1 block truncate text-sm font-black text-white">
            {displayName}
          </strong>
        </div>

        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pb-4">
          {navigation.map(
            ({
              href,
              label,
              icon: Icon,
            }) => {
              const active =
                isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
                    active
                      ? "bg-[#ff6b00] text-white shadow-lg shadow-orange-500/15"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    size={19}
                    className="shrink-0"
                  />
                  <span>{label}</span>
                </Link>
              );
            },
          )}
        </nav>

        <form
          action={logoutAction}
          className="border-t border-white/10 pt-4"
        >
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 text-sm font-black text-white active:scale-[0.98]"
          >
            <LogOut size={17} />
            Déconnexion
          </button>
        </form>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-[80] border-t border-slate-200 bg-white/95 px-2 pb-2 pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {bottomNavigation.map(
            ({
              href,
              label,
              icon: Icon,
            }) => {
              const active =
                isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[9px] font-black transition active:scale-95 ${
                    active
                      ? "bg-orange-50 text-[#ff6b00]"
                      : "text-slate-500"
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={
                      active ? 2.7 : 2.2
                    }
                  />
                  <span className="max-w-full truncate">
                    {label}
                  </span>
                </Link>
              );
            },
          )}

          <button
            type="button"
            onClick={() =>
              setMenuOpen(true)
            }
            className={`flex min-h-[54px] min-w-0 touch-manipulation flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[9px] font-black transition active:scale-95 ${
              menuOpen
                ? "bg-slate-950 text-white"
                : "text-slate-500"
            }`}
          >
            <MoreHorizontal size={20} />
            <span>Plus</span>
          </button>
        </div>
      </nav>
    </>
  );
}
