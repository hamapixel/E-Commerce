import Link from "next/link";

import {
  BadgeDollarSign,
  Bell,
  Boxes,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PackageCheck,
  ShoppingCart,
  Store,
} from "lucide-react";

import {
  logoutAction,
} from "@/actions/owner";

import {
  ownerFetch,
} from "@/lib/backend";

import type {
  OwnerUser,
} from "@/types/owner";


export default async function OwnerLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const user =
    await ownerFetch<OwnerUser>(
      "/owner/auth/me/",
    );

  const navigation = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/catalogue",
      icon: Store,
      label: "Catalogue",
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


  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      {/* =========================================
          SIDEBAR DESKTOP
      ========================================= */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col bg-slate-950 p-5 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff6b00] shadow-lg shadow-orange-500/20">
            <PackageCheck
              size={22}
            />
          </div>

          <div>
            <strong className="block text-lg font-black">
              SUGU KURA
            </strong>

            <span className="text-xs text-slate-400">
              Console propriétaire
            </span>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navigation.map(
            ({
              href,
              label,
              icon: Icon,
            }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <Icon
                  size={19}
                  className="shrink-0"
                />

                <span>
                  {label}
                </span>
              </Link>
            ),
          )}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Connecté comme
          </span>

          <strong className="mt-1 block truncate text-sm">
            {user.display_name}
          </strong>

          <form
            action={
              logoutAction
            }
            className="mt-4"
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-black text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut
                size={15}
              />

              Déconnexion
            </button>
          </form>
        </div>
      </aside>


      {/* =========================================
          HEADER MOBILE
      ========================================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00] text-white shadow-lg shadow-orange-500/20">
              <PackageCheck
                size={20}
              />
            </div>

            <div className="min-w-0">
              <strong className="block truncate text-sm font-black text-slate-950">
                SUGU KURA
              </strong>

              <span className="block truncate text-[10px] font-medium text-slate-400">
                Console propriétaire
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="block text-[8px] font-medium text-slate-400">
                Connecté
              </span>

              <strong className="block max-w-20 truncate text-[10px] font-black text-slate-700">
                {user.display_name}
              </strong>
            </div>

            <form
              action={
                logoutAction
              }
            >
              <button
                type="submit"
                title="Déconnexion"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition active:scale-95"
              >
                <LogOut
                  size={17}
                />
              </button>
            </form>
          </div>
        </div>


        {/* =====================================
            MENU MOBILE : 6 ÉLÉMENTS VISIBLES
            3 COLONNES × 2 LIGNES
        ===================================== */}
        <nav className="border-t border-slate-100 bg-white px-3 py-2.5">
          <div className="grid grid-cols-3 gap-2">
            {navigation.map(
              ({
                href,
                label,
                icon: Icon,
              }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex min-h-[46px] min-w-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-1.5 py-2 text-[10px] font-black text-slate-600 shadow-sm transition active:scale-[0.97] active:bg-blue-50"
                >
                  <Icon
                    size={15}
                    className="shrink-0 text-[#0b4da2]"
                  />

                  <span className="min-w-0 truncate">
                    {label}
                  </span>
                </Link>
              ),
            )}
          </div>
        </nav>
      </header>


      {/* =========================================
          CONTENU PRINCIPAL
      ========================================= */}
      <div className="min-w-0 lg:ml-72">
        {/* Barre desktop */}
        <header className="sticky top-0 z-40 hidden min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-xl lg:flex">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Connecté comme
            </span>

            <strong className="mt-0.5 block text-sm font-black text-slate-900">
              {user.display_name}
            </strong>
          </div>

          <form
            action={
              logoutAction
            }
          >
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <LogOut
                size={15}
              />

              Déconnexion
            </button>
          </form>
        </header>


        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}