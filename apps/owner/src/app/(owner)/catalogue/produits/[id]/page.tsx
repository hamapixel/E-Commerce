import Link from "next/link";

import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  Eye,
  Image as ImageIcon,
  PackageCheck,
  Pencil,
  Tags,
} from "lucide-react";

import {
  ownerFetch,
} from "@/lib/backend";

import {
  formatMoney,
} from "@/lib/format";

import type {
  OwnerProduct,
  OwnerProductImage,
  OwnerProductVariant,
} from "@/types/catalogue";


interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    created?: string;
  }>;
}


function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value),
  );
}


export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const resolvedParams =
    await params;

  const messages =
    await searchParams;

  const productId =
    Number(
      resolvedParams.id,
    );


  const [
    product,
    images,
    variants,
  ] = await Promise.all([
    ownerFetch<OwnerProduct>(
      `/owner/catalog/products/${productId}/`,
    ),

    ownerFetch<OwnerProductImage[]>(
      `/owner/catalog/products/${productId}/images/`,
    ),

    ownerFetch<OwnerProductVariant[]>(
      `/owner/catalog/variants/?product=${productId}`,
    ),
  ]);


  const primaryImage =
    images.find(
      (
        image,
      ) =>
        image.is_primary,
    )
    ??
    images[0]
    ??
    null;


  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/catalogue/produits"
            className="inline-flex items-center gap-2 text-xs font-black text-[#0b4da2]"
          >
            <ArrowLeft
              size={15}
            />

            Retour aux produits
          </Link>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Catalogue
          </p>

          <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
            Détails du produit
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Consultation complète sans ouvrir
            le formulaire de modification.
          </p>
        </div>


        <Link
          href={`/catalogue/produits/${productId}/modifier`}
          className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b4da2] px-4 text-xs font-black text-white"
        >
          <Pencil
            size={15}
          />

          Modifier le produit
        </Link>
      </div>


      {messages.created ===
        "1" && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          Produit créé avec succès.
        </div>
      )}


      <section className="mt-7 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-h-[300px] bg-slate-50 p-5 sm:p-7">
            {primaryImage?.image_url ? (
              <div
                role="img"
                aria-label={
                  primaryImage.alt_text ||
                  product.name
                }
                className="h-full min-h-[280px] w-full bg-contain bg-center bg-no-repeat"
                style={{
                  backgroundImage:
                    `url("${primaryImage.image_url}")`,
                }}
              />
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-300 text-xs font-bold text-slate-400">
                Aucune photo
              </div>
            )}
          </div>


          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0b4da2]">
                  {
                    product.category_name
                  }
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  {
                    product.name
                  }
                </h2>

                <p className="mt-2 text-xs text-slate-500">
                  Référence : {
                    product.sku
                  }
                </p>

                {product.brand_name && (
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Marque : {
                      product.brand_name
                    }
                  </p>
                )}
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-600">
                {
                  product.status
                }
              </span>
            </div>


            <strong className="mt-6 block text-3xl font-black text-[#ff6b00]">
              {formatMoney(
                product.base_price,
              )}
            </strong>


            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-3">
                <PackageCheck
                  size={17}
                  className="text-emerald-600"
                />

                <span className="mt-2 block text-[9px] font-bold uppercase text-slate-400">
                  Disponible
                </span>

                <strong className="mt-1 block text-lg">
                  {
                    product.stock_available
                  }
                </strong>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <Boxes
                  size={17}
                  className="text-[#0b4da2]"
                />

                <span className="mt-2 block text-[9px] font-bold uppercase text-slate-400">
                  Variantes
                </span>

                <strong className="mt-1 block text-lg">
                  {
                    product.variants_count
                  }
                </strong>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <ImageIcon
                  size={17}
                  className="text-[#ff6b00]"
                />

                <span className="mt-2 block text-[9px] font-bold uppercase text-slate-400">
                  Photos
                </span>

                <strong className="mt-1 block text-lg">
                  {
                    product.images_count
                  }
                </strong>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <Tags
                  size={17}
                  className="text-violet-600"
                />

                <span className="mt-2 block text-[9px] font-bold uppercase text-slate-400">
                  Physique
                </span>

                <strong className="mt-1 block text-lg">
                  {
                    product.stock_on_hand
                  }
                </strong>
              </div>
            </div>


            {product.short_description && (
              <p className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
                {
                  product.short_description
                }
              </p>
            )}


            <div className="mt-6 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
              <p>
                Code-barres :{" "}
                <strong className="text-slate-700">
                  {
                    product.barcode ||
                    "—"
                  }
                </strong>
              </p>

              <p>
                Prix d&apos;achat :{" "}
                <strong className="text-slate-700">
                  {
                    product.purchase_price
                      ? formatMoney(
                          product.purchase_price,
                        )
                      : "—"
                  }
                </strong>
              </p>

              <p>
                Stock réservé :{" "}
                <strong className="text-slate-700">
                  {
                    product.stock_reserved
                  }
                </strong>
              </p>

              <p>
                Mise en avant :{" "}
                <strong className="text-slate-700">
                  {
                    product.is_featured
                      ? "Oui"
                      : "Non"
                  }
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="mt-8 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <Boxes
            className="text-[#0b4da2]"
          />

          <div>
            <h2 className="text-xl font-black">
              Variantes
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Stock et configuration de chaque
              option.
            </p>
          </div>
        </div>


        {variants.length >
        0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {variants.map(
              (
                variant,
              ) => (
                <article
                  key={
                    variant.id
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black">
                        {
                          variant.label ||
                          variant.sku
                        }
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-500">
                        SKU : {
                          variant.sku
                        }
                      </p>
                    </div>

                    <span
                      className={
                        variant.is_active
                          ? "rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700"
                          : "rounded-full bg-slate-200 px-2.5 py-1 text-[9px] font-black text-slate-500"
                      }
                    >
                      {
                        variant.is_active
                          ? "Active"
                          : "Inactive"
                      }
                    </span>
                  </div>


                  <strong className="mt-4 block text-lg text-[#ff6b00]">
                    {formatMoney(
                      variant.price,
                    )}
                  </strong>


                  {variant.attributes.length >
                  0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {variant.attributes.map(
                        (
                          attribute,
                        ) => (
                          <span
                            key={
                              `${attribute.attribute_id}-${attribute.value_id}`
                            }
                            className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[10px] font-bold text-[#0b4da2]"
                          >
                            {
                              attribute.attribute
                            } :{" "}
                            {
                              attribute.value
                            }
                          </span>
                        ),
                      )}
                    </div>
                  )}


                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white p-2 text-center">
                      <span className="block text-[9px] text-slate-400">
                        Physique
                      </span>

                      <strong className="text-sm">
                        {
                          variant.stock_on_hand
                        }
                      </strong>
                    </div>

                    <div className="rounded-xl bg-white p-2 text-center">
                      <span className="block text-[9px] text-slate-400">
                        Réservé
                      </span>

                      <strong className="text-sm">
                        {
                          variant.stock_reserved
                        }
                      </strong>
                    </div>

                    <div className="rounded-xl bg-white p-2 text-center">
                      <span className="block text-[9px] text-slate-400">
                        Disponible
                      </span>

                      <strong className="text-sm text-emerald-700">
                        {
                          variant.stock_available
                        }
                      </strong>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-xs leading-5 text-slate-500">
            Produit simple : aucune variante.
            Le stock est géré directement sur
            le produit.
          </div>
        )}
      </section>


      <section className="mt-8 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <Eye
            className="text-[#ff6b00]"
          />

          <div>
            <h2 className="text-xl font-black">
              Galerie
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Défilement manuel des photos.
            </p>
          </div>
        </div>


        {images.length >
        0 ? (
          <div className="mt-5 flex touch-pan-x gap-4 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:thin]">
            {images.map(
              (
                image,
              ) => (
                <article
                  key={
                    image.id
                  }
                  className="w-[220px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="relative aspect-square bg-slate-100">
                    {image.image_url ? (
                      <div
                        role="img"
                        aria-label={
                          image.alt_text ||
                          product.name
                        }
                        className="h-full w-full bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage:
                            `url("${image.image_url}")`,
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">
                        Aucune image
                      </div>
                    )}

                    {image.is_primary && (
                      <span className="absolute left-2 top-2 rounded-full bg-[#ff6b00] px-2.5 py-1 text-[9px] font-black text-white">
                        Principale
                      </span>
                    )}
                  </div>
                </article>
              ),
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-xs text-slate-500">
            Aucune photo.
          </div>
        )}
      </section>


      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-black">
            Description complète
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {
              product.description ||
              "Aucune description complète."
            }
          </p>
        </article>


        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-black">
            SEO & suivi
          </h2>

          <div className="mt-4 grid gap-4 text-sm">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Titre SEO
              </span>

              <p className="mt-1 text-slate-700">
                {
                  product.seo_title ||
                  "—"
                }
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Description SEO
              </span>

              <p className="mt-1 text-slate-700">
                {
                  product.seo_description ||
                  "—"
                }
              </p>
            </div>

            <div className="grid gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <CalendarDays
                  size={14}
                />

                Créé : {
                  formatDate(
                    product.created_at,
                  )
                }
              </p>

              <p className="flex items-center gap-2">
                <CalendarDays
                  size={14}
                />

                Modifié : {
                  formatDate(
                    product.updated_at,
                  )
                }
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
