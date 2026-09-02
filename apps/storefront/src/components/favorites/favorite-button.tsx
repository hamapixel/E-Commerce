"use client";

import {
  Heart,
} from "lucide-react";

import {
  useFavoritesStore,
} from "@/store/favorites-store";

import type {
  FavoriteItem,
} from "@/store/favorites-store";


interface FavoriteButtonProps {
  item: FavoriteItem;

  variant?:
    | "icon"
    | "overlay"
    | "wide";

  className?: string;
}


export function FavoriteButton({
  item,
  variant = "icon",
  className = "",
}: FavoriteButtonProps) {
  const items =
    useFavoritesStore(
      (
        state,
      ) => state.items,
    );

  const toggleItem =
    useFavoritesStore(
      (
        state,
      ) => state.toggleItem,
    );

  const isFavorite =
    items.some(
      (
        favorite,
      ) =>
        favorite.productId ===
        item.productId,
    );


  const common =
    "transition active:scale-95";


  if (
    variant === "wide"
  ) {
    return (
      <button
        type="button"
        onClick={
          () =>
            toggleItem(
              item,
            )
        }
        aria-pressed={
          isFavorite
        }
        className={`${common} ${className} flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 ${
          isFavorite
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:text-red-600"
        }`}
      >
        <Heart
          size={19}
          fill={
            isFavorite
              ? "currentColor"
              : "none"
          }
        />

        <span className="text-sm font-black">
          {isFavorite
            ? "Retirer des favoris"
            : "Ajouter aux favoris"}
        </span>
      </button>
    );
  }


  const overlayClasses =
    variant ===
    "overlay"
      ? (
        "absolute right-2 top-2 z-20 "
        + "shadow-sm backdrop-blur "
      )
      : "";


  return (
    <button
      type="button"
      onClick={
        () =>
          toggleItem(
            item,
          )
      }
      aria-label={
        isFavorite
          ? "Retirer des favoris"
          : "Ajouter aux favoris"
      }
      title={
        isFavorite
          ? "Retirer des favoris"
          : "Ajouter aux favoris"
      }
      aria-pressed={
        isFavorite
      }
      className={`${common} ${overlayClasses} ${className} flex h-9 w-9 items-center justify-center rounded-full border ${
        isFavorite
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-white/80 bg-white/95 text-slate-600 hover:text-red-600"
      }`}
    >
      <Heart
        size={17}
        fill={
          isFavorite
            ? "currentColor"
            : "none"
        }
      />
    </button>
  );
}
