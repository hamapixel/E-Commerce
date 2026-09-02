"use client";

import Image from "next/image";

import {
  useMemo,
  useState,
} from "react";

import type {
  ProductImage,
} from "@/types/api";


interface ProductGalleryProps {
  images: ProductImage[];
  name: string;
  fallback: string | null;
}


export function ProductGallery({
  images,
  name,
  fallback,
}: ProductGalleryProps) {
  /*
   * Liste stable des images.
   *
   * useMemo évite de recréer inutilement
   * le tableau à chaque rendu.
   */
  const imageUrls =
    useMemo(
      () => {
        if (
          images.length >
          0
        ) {
          return images
            .filter(
              (item) =>
                Boolean(
                  item.image,
                ),
            )
            .map(
              (item) => ({
                url:
                  item.image,

                alt:
                  item.alt_text ||
                  name,
              }),
            );
        }


        if (fallback) {
          return [
            {
              url:
                fallback,

              alt:
                name,
            },
          ];
        }


        return [];
      },
      [
        images,
        name,
        fallback,
      ],
    );


  /*
   * On mémorise uniquement l'URL
   * choisie manuellement par l'utilisateur.
   *
   * Aucun useEffect.
   * Aucun scroll automatique.
   */
  const [
    selectedUrl,
    setSelectedUrl,
  ] = useState<string | null>(
    null,
  );


  /*
   * Si l'image sélectionnée existe encore :
   * on la garde.
   *
   * Si elle a été supprimée :
   * on affiche simplement la première restante.
   *
   * Aucun setState nécessaire.
   */
  const currentImage =
    imageUrls.find(
      (image) =>
        image.url ===
        selectedUrl,
    ) ??
    imageUrls[0] ??
    null;


  if (!currentImage) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[24px] border border-slate-200 bg-slate-100 text-xl font-black text-slate-300">
        SUGU KURA
      </div>
    );
  }


  return (
    <div className="min-w-0">

      {/* =========================================
          IMAGE PRINCIPALE
      ========================================= */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <Image
          src={
            currentImage.url
          }
          alt={
            currentImage.alt
          }
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-3 sm:p-4"
        />
      </div>


      {/* =========================================
          MINIATURES

          IMPORTANT :
          - aucun scroll automatique
          - aucun scrollIntoView
          - aucun scrollTo
          - aucun recentrage
          - déplacement uniquement manuel
      ========================================= */}
      {imageUrls.length >
        1 && (
        <div
          className="
            hide-scrollbar
            mt-3
            flex
            touch-pan-x
            gap-2
            overflow-x-auto
            overscroll-x-contain
            scroll-auto
            pb-1
            [overflow-anchor:none]
          "
        >
          {imageUrls.map(
            (
              image,
              index,
            ) => {
              const isSelected =
                currentImage.url ===
                image.url;


              return (
                <button
                  key={
                    image.url
                  }
                  type="button"
                  onClick={() => {
                    /*
                     * Change uniquement
                     * l'image principale.
                     *
                     * La bande de miniatures
                     * ne bouge pas.
                     */
                    setSelectedUrl(
                      image.url,
                    );
                  }}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors sm:h-20 sm:w-20 ${
                    isSelected
                      ? "border-[#ff6b00]"
                      : "border-slate-200"
                  }`}
                  aria-label={`Afficher l'image ${index + 1} de ${name}`}
                >
                  <Image
                    src={
                      image.url
                    }
                    alt={
                      image.alt
                    }
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                </button>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
