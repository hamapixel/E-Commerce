"use client";

import { create } from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";


export interface CartItem {
  key: string;

  productId: number;

  variantId: number | null;

  slug: string;

  name: string;

  sku: string;

  image: string | null;

  variantLabel: string;

  unitPrice: number;

  normalPrice: number;

  hasPromotion: boolean;

  quantity: number;

  availableQuantity: number;
}


export interface NewCartItem {
  productId: number;

  variantId?: number | null;

  slug: string;

  name: string;

  sku: string;

  image?: string | null;

  variantLabel?: string;

  unitPrice: number;

  normalPrice: number;

  hasPromotion?: boolean;

  availableQuantity: number;
}


export type AddToCartResult =
  | "added"
  | "out_of_stock"
  | "max_stock";


interface CartStore {
  items: CartItem[];

  hasHydrated: boolean;

  setHasHydrated: (
    value: boolean,
  ) => void;

  addItem: (
    item: NewCartItem,
    quantity?: number,
  ) => AddToCartResult;

  increment: (
    key: string,
  ) => boolean;

  decrement: (
    key: string,
  ) => void;

  setQuantity: (
    key: string,
    quantity: number,
  ) => void;

  removeItem: (
    key: string,
  ) => void;

  clearCart: () => void;
}


function createCartKey(
  productId: number,
  variantId?: number | null,
) {
  if (variantId) {
    return `${productId}:variant:${variantId}`;
  }

  return `${productId}:base`;
}


export const useCartStore =
  create<CartStore>()(
    persist(
      (
        set,
        get,
      ) => ({
        items: [],

        hasHydrated: false,

        setHasHydrated: (
          value,
        ) => {
          set({
            hasHydrated: value,
          });
        },

        addItem: (
          item,
          quantity = 1,
        ) => {
          const available =
            Math.max(
              0,
              Math.floor(
                item.availableQuantity,
              ),
            );

          if (available <= 0) {
            return "out_of_stock";
          }

          const requested =
            Math.max(
              1,
              Math.floor(
                quantity,
              ),
            );

          const key =
            createCartKey(
              item.productId,
              item.variantId,
            );

          const currentItems =
            get().items;

          const existing =
            currentItems.find(
              (cartItem) =>
                cartItem.key ===
                key,
            );

          if (existing) {
            const remaining =
              available -
              existing.quantity;

            if (remaining <= 0) {
              return "max_stock";
            }

            const quantityToAdd =
              Math.min(
                requested,
                remaining,
              );

            set({
              items:
                currentItems.map(
                  (cartItem) =>
                    cartItem.key ===
                    key
                      ? {
                          ...cartItem,

                          quantity:
                            cartItem.quantity +
                            quantityToAdd,

                          availableQuantity:
                            available,

                          unitPrice:
                            item.unitPrice,

                          normalPrice:
                            item.normalPrice,

                          hasPromotion:
                            item.hasPromotion ??
                            false,

                          image:
                            item.image ??
                            null,
                        }
                      : cartItem,
                ),
            });

            return "added";
          }

          const initialQuantity =
            Math.min(
              requested,
              available,
            );

          set({
            items: [
              ...currentItems,

              {
                key,

                productId:
                  item.productId,

                variantId:
                  item.variantId ??
                  null,

                slug:
                  item.slug,

                name:
                  item.name,

                sku:
                  item.sku,

                image:
                  item.image ??
                  null,

                variantLabel:
                  item.variantLabel ??
                  "",

                unitPrice:
                  item.unitPrice,

                normalPrice:
                  item.normalPrice,

                hasPromotion:
                  item.hasPromotion ??
                  false,

                quantity:
                  initialQuantity,

                availableQuantity:
                  available,
              },
            ],
          });

          return "added";
        },

        increment: (
          key,
        ) => {
          const currentItems =
            get().items;

          const item =
            currentItems.find(
              (currentItem) =>
                currentItem.key ===
                key,
            );

          if (!item) {
            return false;
          }

          if (
            item.quantity >=
            item.availableQuantity
          ) {
            return false;
          }

          set({
            items:
              currentItems.map(
                (currentItem) =>
                  currentItem.key ===
                  key
                    ? {
                        ...currentItem,

                        quantity:
                          currentItem.quantity +
                          1,
                      }
                    : currentItem,
              ),
          });

          return true;
        },

        decrement: (
          key,
        ) => {
          const currentItems =
            get().items;

          const item =
            currentItems.find(
              (currentItem) =>
                currentItem.key ===
                key,
            );

          if (!item) {
            return;
          }

          if (item.quantity <= 1) {
            set({
              items:
                currentItems.filter(
                  (currentItem) =>
                    currentItem.key !==
                    key,
                ),
            });

            return;
          }

          set({
            items:
              currentItems.map(
                (currentItem) =>
                  currentItem.key ===
                  key
                    ? {
                        ...currentItem,

                        quantity:
                          currentItem.quantity -
                          1,
                      }
                    : currentItem,
              ),
          });
        },

        setQuantity: (
          key,
          quantity,
        ) => {
          const currentItems =
            get().items;

          const item =
            currentItems.find(
              (currentItem) =>
                currentItem.key ===
                key,
            );

          if (!item) {
            return;
          }

          const safeQuantity =
            Math.max(
              1,
              Math.min(
                Math.floor(
                  quantity,
                ),
                item.availableQuantity,
              ),
            );

          set({
            items:
              currentItems.map(
                (currentItem) =>
                  currentItem.key ===
                  key
                    ? {
                        ...currentItem,

                        quantity:
                          safeQuantity,
                      }
                    : currentItem,
              ),
          });
        },

        removeItem: (
          key,
        ) => {
          set({
            items:
              get().items.filter(
                (item) =>
                  item.key !== key,
              ),
          });
        },

        clearCart: () => {
          set({
            items: [],
          });
        },
      }),

      {
        name:
          "sugu-kura-cart",

        version: 1,

        storage:
          createJSONStorage(
            () => localStorage,
          ),

        skipHydration: true,

        partialize: (
          state,
        ) => ({
          items:
            state.items,
        }),

        onRehydrateStorage:
          () =>
          (
            state,
            error,
          ) => {
            if (!error) {
              state?.setHasHydrated(
                true,
              );
            }
          },
      },
    ),
  );