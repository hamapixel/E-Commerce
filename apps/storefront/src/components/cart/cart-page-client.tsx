"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  formatMoney,
} from "@/lib/format";

import {
  useCartStore,
} from "@/store/cart-store";


export function CartPageClient() {
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

  const increment =
    useCartStore(
      (
        state,
      ) =>
        state.increment,
    );

  const decrement =
    useCartStore(
      (
        state,
      ) =>
        state.decrement,
    );

  const removeItem =
    useCartStore(
      (
        state,
      ) =>
        state.removeItem,
    );

  const clearCart =
    useCartStore(
      (
        state,
      ) =>
        state.clearCart,
    );


  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6">
        <div className="animate-pulse">
          <div className="h-9 w-48 rounded-lg bg-slate-200" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="h-72 rounded-[24px] bg-slate-200" />

            <div className="h-72 rounded-[24px] bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }


  const totalQuantity =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.quantity,
      0,
    );


  const subtotal =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.unitPrice *
          item.quantity,
      0,
    );


  const normalTotal =
    items.reduce(
      (
        total,
        item,
      ) =>
        total +
        item.normalPrice *
          item.quantity,
      0,
    );


  const savings =
    Math.max(
      0,
      normalTotal -
        subtotal,
    );


  if (!items.length) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-[#ff6b00]">
          <ShoppingBag
            size={42}
          />
        </div>

        <h1 className="mt-6 text-3xl font-black text-slate-950">
          Votre panier est vide
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
          Découvrez les produits
          SUGU KURA et ajoutez
          vos articles préférés.
        </p>

        <Link
          href="/"
          className="mx-auto mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-6 text-sm font-black text-white"
        >
          <ArrowLeft
            size={17}
          />

          Continuer mes achats
        </Link>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            SUGU KURA
          </p>

          <h1 className="mt-1 text-3xl font-black text-slate-950">
            Mon panier
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {totalQuantity}{" "}
            article
            {totalQuantity !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-bold text-red-500 transition hover:text-red-700"
        >
          Vider le panier
        </button>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-3">
          {items.map(
            (item) => {
              const lineTotal =
                item.unitPrice *
                item.quantity;

              const atMax =
                item.quantity >=
                item.availableQuantity;

              return (
                <article
                  key={item.key}
                  className="rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
                >
                  <div className="flex gap-3 sm:gap-5">
                    <Link
                      href={`/produits/${item.slug}`}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-50 sm:h-32 sm:w-32"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="128px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-black text-slate-300">
                          SUGU
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/produits/${item.slug}`}
                            className="line-clamp-2 text-sm font-black text-slate-900 hover:text-[#0b4da2] sm:text-base"
                          >
                            {item.name}
                          </Link>

                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            {item.sku}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.key,
                            )
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      {item.variantLabel && (
                        <p className="mt-2 w-fit rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#0b4da2]">
                          {item.variantLabel}
                        </p>
                      )}

                      <div className="mt-3">
                        {item.hasPromotion &&
                          item.normalPrice >
                            item.unitPrice && (
                            <span className="mr-2 text-xs font-semibold text-slate-400 line-through">
                              {formatMoney(
                                item.normalPrice,
                              )}
                            </span>
                          )}

                        <span className="text-base font-black text-[#ff6b00]">
                          {formatMoney(
                            item.unitPrice,
                          )}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              decrement(
                                item.key,
                              )
                            }
                            className="flex h-full w-10 items-center justify-center text-slate-600"
                          >
                            <Minus size={15} />
                          </button>

                          <span className="flex h-full min-w-11 items-center justify-center border-x border-slate-200 text-xs font-black">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increment(
                                item.key,
                              )
                            }
                            disabled={atMax}
                            className="flex h-full w-10 items-center justify-center text-slate-600 disabled:text-slate-300"
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <span className="text-base font-black text-slate-950">
                          {formatMoney(
                            lineTotal,
                          )}
                        </span>
                      </div>

                      {atMax && (
                        <p className="mt-2 text-[10px] font-bold text-orange-600">
                          Quantité maximale disponible atteinte ({item.availableQuantity}).
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </section>

        <aside className="h-fit rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-32">
          <h2 className="text-xl font-black text-slate-950">
            Résumé
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                Articles
              </span>

              <span className="font-bold">
                {totalQuantity}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                Sous-total
              </span>

              <span className="font-bold">
                {formatMoney(
                  subtotal,
                )}
              </span>
            </div>

            {savings > 0 && (
              <div className="flex items-center justify-between text-emerald-600">
                <span className="font-semibold">
                  Économies
                </span>

                <span className="font-black">
                  -{formatMoney(
                    savings,
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                Livraison
              </span>

              <span className="text-xs font-bold text-[#0b4da2]">
                Calculée à la commande
              </span>
            </div>
          </div>

          <div className="my-5 border-t border-slate-200" />

          <div className="flex items-end justify-between gap-3">
            <span className="font-black text-slate-950">
              Total produits
            </span>

            <span className="text-2xl font-black text-[#ff6b00]">
              {formatMoney(
                subtotal,
              )}
            </span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-[#0b4da2] text-sm font-black text-white transition hover:bg-[#083b7f]"
          >
            Continuer vers la commande
          </Link>

          <div className="mt-5 flex gap-2 rounded-xl bg-emerald-50 p-3">
            <ShieldCheck
              size={19}
              className="shrink-0 text-emerald-600"
            />

            <p className="text-[11px] leading-5 text-emerald-800">
              Les quantités du panier sont limitées au stock disponible. Le serveur vérifiera de nouveau les prix, les promotions, les variantes et le stock avant de réserver les articles.
            </p>
          </div>

          <Link
            href="/"
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={15} />

            Continuer mes achats
          </Link>
        </aside>
      </div>
    </div>
  );
}
