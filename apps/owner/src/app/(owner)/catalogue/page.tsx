import Link from "next/link";

import {
  Boxes,
  FolderTree,
  PackagePlus,
  Smartphone,
  Tags,
} from "lucide-react";

import {
  ownerFetch,
} from "@/lib/backend";

import type {
  CatalogMetadata,
  OwnerPaginatedProducts,
} from "@/types/catalogue";


export default async function CataloguePage() {
  const [
    metadata,
    products,
  ] = await Promise.all([
    ownerFetch<
      CatalogMetadata
    >(
      "/owner/catalog/metadata/"
    ),

    ownerFetch<
      OwnerPaginatedProducts
    >(
      (
        "/owner/catalog/products/"
        + "?page=1&page_size=1"
      )
    ),
  ]);

  const cards = [
    {
      href:
        "/catalogue/produits",

      title:
        "Produits",

      value:
        products.count,

      description:
        (
          "Créer et gérer "
          + "les produits."
        ),

      icon:
        Smartphone,
    },

    {
      href:
        "/catalogue/categories",

      title:
        "Catégories",

      value:
        metadata
          .categories
          .length,

      description:
        (
          "Catégories et "
          + "sous-catégories."
        ),

      icon:
        FolderTree,
    },

    {
      href:
        "/catalogue/marques",

      title:
        "Marques",

      value:
        metadata
          .brands
          .length,

      description:
        (
          "Marques et logos."
        ),

      icon:
        Tags,
    },
  ];


  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Gestion boutique
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Catalogue
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Gérez votre catalogue
            depuis votre plateforme.
          </p>
        </div>

        <Link
          href="/catalogue/produits/nouveau"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ff6b00] px-4 py-2 text-xs font-black text-white"
        >
          <PackagePlus
            size={17}
          />

          Nouveau produit
        </Link>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(
          ({
            href,
            title,
            value,
            description,
            icon: Icon,
          }) => (
            <Link
              key={href}
              href={href}
              className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#ff6b00]">
                <Icon
                  size={21}
                />
              </div>

              <strong className="mt-5 block text-2xl font-black text-slate-950">
                {value}
              </strong>

              <h2 className="mt-1 font-black text-slate-800">
                {title}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            </Link>
          ),
        )}
      </section>

      <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Boxes
            size={20}
            className="text-[#0b4da2]"
          />

          <div>
            <h2 className="font-black">
              Gestion avancée
            </h2>

            <p className="text-xs text-slate-500">
              Variantes et stock seront
              rattachés directement aux
              produits dans le prochain bloc.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}