"use client";

import {
  create,
} from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";


export interface FavoriteItem {
  productId: number;
  slug: string;
  name: string;
  sku: string;
  image: string | null;

  currentPrice: string;
  normalPrice: string;

  hasPromotion: boolean;
  hasVariants: boolean;

  availableQuantity: number;

  brandName?: string;
}


interface FavoritesState {
  items: FavoriteItem[];

  hasHydrated: boolean;

  setHasHydrated:
    (
      value: boolean,
    ) => void;

  isFavorite:
    (
      productId: number,
    ) => boolean;

  toggleItem:
    (
      item: FavoriteItem,
    ) => void;

  removeItem:
    (
      productId: number,
    ) => void;

  clear:
    () => void;
}


export const useFavoritesStore =
  create<FavoritesState>()(
    persist(
      (
        set,
        get,
      ) => ({
        items: [],

        hasHydrated: false,

        setHasHydrated:
          (
            value,
          ) => {
            set({
              hasHydrated:
                value,
            });
          },

        isFavorite:
          (
            productId,
          ) => {
            return get()
              .items
              .some(
                (
                  item,
                ) =>
                  item.productId ===
                  productId,
              );
          },

        toggleItem:
          (
            item,
          ) => {
            const exists =
              get()
                .items
                .some(
                  (
                    favorite,
                  ) =>
                    favorite
                      .productId ===
                    item.productId,
                );

            if (exists) {
              set(
                (
                  state,
                ) => ({
                  items:
                    state
                      .items
                      .filter(
                        (
                          favorite,
                        ) =>
                          favorite
                            .productId !==
                          item.productId,
                      ),
                }),
              );

              return;
            }

            set(
              (
                state,
              ) => ({
                items: [
                  item,
                  ...state.items,
                ],
              }),
            );
          },

        removeItem:
          (
            productId,
          ) => {
            set(
              (
                state,
              ) => ({
                items:
                  state.items.filter(
                    (
                      item,
                    ) =>
                      item.productId !==
                      productId,
                  ),
              }),
            );
          },

        clear:
          () => {
            set({
              items: [],
            });
          },
      }),
      {
        name:
          "sugu-kura-favorites",

        storage:
          createJSONStorage(
            () =>
              localStorage,
          ),

        /*
         * Important avec SSR/React 19 :
         * le serveur et le premier rendu client
         * commencent tous deux avec une liste vide.
         * La vraie liste locale est chargée ensuite.
         */
        skipHydration:
          true,

        partialize:
          (
            state,
          ) => ({
            items:
              state.items,
          }),

        onRehydrateStorage:
          () =>
            (
              state,
            ) => {
              state
                ?.setHasHydrated(
                  true,
                );
            },
      },
    ),
  );
