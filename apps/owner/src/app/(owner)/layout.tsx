import Link from "next/link";

import {
  BadgeDollarSign,
  Bell,
  Boxes,
  Handshake,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquareText,
  PackageCheck,
  Rocket,
  ShoppingCart,
  Store,
  Truck,
  UserRound,
} from "lucide-react";

import {
  logoutAction,
} from "@/actions/owner";

import {
  OwnerMobileNavigation,
} from "@/components/layout/owner-mobile-navigation";

import {
  ownerFetch,
} from "@/lib/backend";
import {
  ownerMediaUrl,
} from "@/lib/media";

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
      "/owner/auth/profile/",
    );

  const profilePhoto =
    ownerMediaUrl(
      user.profile_photo_url,
    );

  const storeLogo =
    ownerMediaUrl(
      user.store_logo_url,
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
      href: "/livraison",
      label: "Livraison",
      icon: Truck,
    },
    {
      href: "/publicites",
      label: "Publicités",
      icon: Megaphone,
    },
    {
      href: "/boosting",
      label: "Booster mes produits",
      icon: Rocket,
    },
    {
      href: "/partenaires",
      label: "Partenaires",
      icon: Handshake,
    },
    {
      href: "/avis",
      label: "Avis clients",
      icon: MessageSquareText,
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      href: "/profil",
      label: "Mon profil",
      icon: UserRound,
    },
  ];


  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <OwnerMobileNavigation
        displayName={
          user.display_name
        }
        profilePhoto={
          profilePhoto
        }
        storeLogo={
          storeLogo
        }
      />

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col bg-slate-950 p-5 text-white lg:flex">
        <Link
          href="/profil"
          className="flex items-center gap-3 rounded-2xl transition hover:bg-white/5"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#ff6b00] bg-contain bg-center bg-no-repeat shadow-lg shadow-orange-500/20"
            style={
              storeLogo
                ? {
                    backgroundImage:
                      `url(${storeLogo})`,
                    backgroundColor:
                      "white",
                  }
                : undefined
            }
          >
            {!storeLogo && (
              <PackageCheck
                size={22}
              />
            )}
          </div>

          <div className="min-w-0">
            <strong className="block truncate text-lg font-black">
              SUGU KURA
            </strong>

            <span className="text-xs text-slate-400">
              Console propriétaire
            </span>
          </div>
        </Link>

        <nav className="mt-8 space-y-2 overflow-y-auto pb-4">
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
          <Link
            href="/profil"
            className="flex items-center gap-3 rounded-xl transition hover:bg-white/5"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 bg-cover bg-center text-white"
              style={
                profilePhoto
                  ? {
                      backgroundImage:
                        `url(${profilePhoto})`,
                    }
                  : undefined
              }
            >
              {!profilePhoto && (
                <UserRound size={20} />
              )}
            </div>

            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Connecté comme
              </span>

              <strong className="mt-1 block truncate text-sm">
                {user.display_name}
              </strong>
            </div>
          </Link>

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

      <div className="min-w-0 lg:ml-72">
        <header className="sticky top-0 z-40 hidden min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-xl lg:flex">
          <Link
            href="/profil"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 bg-cover bg-center text-[#0b4da2]"
              style={
                profilePhoto
                  ? {
                      backgroundImage:
                        `url(${profilePhoto})`,
                    }
                  : undefined
              }
            >
              {!profilePhoto && (
                <UserRound size={18} />
              )}
            </div>

            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Connecté comme
              </span>

              <strong className="mt-0.5 block text-sm font-black text-slate-900">
                {user.display_name}
              </strong>
            </div>
          </Link>

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

        <main className="mx-auto w-full max-w-[1600px] p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
