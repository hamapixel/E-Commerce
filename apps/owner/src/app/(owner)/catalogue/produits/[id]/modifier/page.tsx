import Link from "next/link";

import {
  ArrowLeft,
  Archive,
  CheckCircle2,
  Eye,
  ImagePlus,
  Images,
  PackageOpen,
  Save,
  Star,
  Trash2,
} from "lucide-react";

import {
  addProductImageAction,
  archiveProductAction,
  deleteProductImageAction,
  makePrimaryProductImageAction,
  updateProductAction,
} from "@/actions/catalogue";

import ProductVariantsManager from "@/components/catalogue/product-variants-manager";

import {
  ownerFetch,
} from "@/lib/backend";

import {
  formatMoney,
} from "@/lib/format";

import type {
  CatalogMetadata,
  OwnerProduct,
  OwnerProductImage,
  OwnerProductVariant,
  OwnerVariantMetadata,
} from "@/types/catalogue";


interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    updated?: string;
    archived?: string;
  }>;
}


export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
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
    metadata,
    images,
    variants,
    variantMetadata,
  ] = await Promise.all([
    ownerFetch<OwnerProduct>(
      `/owner/catalog/products/${productId}/`,
    ),

    ownerFetch<CatalogMetadata>(
      "/owner/catalog/metadata/",
    ),

    ownerFetch<OwnerProductImage[]>(
      `/owner/catalog/products/${productId}/images/`,
    ),

    ownerFetch<OwnerProductVariant[]>(
      `/owner/catalog/variants/?product=${productId}`,
    ),

    ownerFetch<OwnerVariantMetadata>(
      "/owner/catalog/variants/metadata/",
    ),
  ]);


  const updateAction =
    updateProductAction.bind(
      null,
      productId,
    );

  const addImageAction =
    addProductImageAction.bind(
      null,
      productId,
    );

  const archiveAction =
    archiveProductAction.bind(
      null,
      productId,
    );


  return (
    <>
      {/* =========================================
          EN-TÊTE
      ========================================= */}
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
            Modifier le produit
          </h1>


          <p className="mt-2 text-sm text-slate-500">
            {product.name}
          </p>
        </div>


        <div className="flex flex-wrap items-stretch gap-2">
          <Link
            href={`/catalogue/produits/${productId}`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-black text-emerald-700"
          >
            <Eye
              size={16}
            />

            Voir détails
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="block text-[10px] font-bold uppercase text-slate-400">
              Prix actuel
            </span>

            <strong className="mt-1 block text-lg font-black text-[#ff6b00]">
              {formatMoney(
                product.base_price,
              )}
            </strong>
          </div>
        </div>
      </div>


      {/* =========================================
          MESSAGES
      ========================================= */}
      {messages.updated ===
        "1" && (
        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          <CheckCircle2
            size={18}
          />

          Produit modifié avec succès.
        </div>
      )}


      {messages.archived ===
        "1" && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700">
          Produit archivé.
        </div>
      )}


      {/* =========================================
          FORMULAIRE PRODUIT
      ========================================= */}
      <form
        action={
          updateAction
        }
        className="mt-7 grid gap-5"
      >

        {/* INFORMATIONS */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex items-center gap-3">
            <PackageOpen
              className="text-[#ff6b00]"
            />

            <h2 className="font-black">
              Informations principales
            </h2>
          </div>


          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <label>
              <span className="text-xs font-black">
                Nom du produit *
              </span>

              <input
                name="name"
                required
                defaultValue={
                  product.name
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-[#ff6b00]"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                SKU *
              </span>

              <input
                name="sku"
                required
                defaultValue={
                  product.sku
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 uppercase outline-none focus:border-[#ff6b00]"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Catégorie *
              </span>

              <select
                name="category"
                required
                defaultValue={
                  String(
                    product.category,
                  )
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"
              >
                {metadata.categories.map(
                  (
                    category,
                  ) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              <span className="text-xs font-black">
                Marque
              </span>

              <select
                name="brand"
                defaultValue={
                  product.brand
                    ? String(
                        product.brand,
                      )
                    : ""
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"
              >
                <option value="">
                  Sans marque
                </option>

                {metadata.brands.map(
                  (
                    brand,
                  ) => (
                    <option
                      key={
                        brand.id
                      }
                      value={
                        brand.id
                      }
                    >
                      {
                        brand.name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              <span className="text-xs font-black">
                Code-barres
              </span>

              <input
                name="barcode"
                defaultValue={
                  product.barcode ??
                  ""
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Statut
              </span>

              <select
                name="status"
                defaultValue={
                  product.status
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"
              >
                {metadata.product_statuses.map(
                  (
                    item,
                  ) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {
                        item.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
        </section>


        {/* =====================================
            PRIX
        ===================================== */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <h2 className="font-black">
            Prix
          </h2>


          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <label>
              <span className="text-xs font-black">
                Prix de vente *
              </span>

              <input
                name="base_price"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={
                  product.base_price
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Prix d&apos;achat
              </span>

              <input
                name="purchase_price"
                type="number"
                min="0"
                step="1"
                defaultValue={
                  product.purchase_price ??
                  ""
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>
          </div>
        </section>


        {/* =====================================
            PRÉSENTATION
        ===================================== */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <h2 className="font-black">
            Présentation
          </h2>


          <div className="mt-5 grid gap-4">

            <label>
              <span className="text-xs font-black">
                Description courte
              </span>

              <input
                name="short_description"
                defaultValue={
                  product.short_description
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Description complète
              </span>

              <textarea
                name="description"
                rows={7}
                defaultValue={
                  product.description
                }
                className="mt-2 w-full rounded-xl border border-slate-200 p-4"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Remplacer uniquement
                la photo principale
              </span>

              <input
                name="primary_image"
                type="file"
                accept="image/*"
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-white p-3 text-xs"
              />

              <span className="mt-2 block text-[10px] text-slate-400">
                Laissez vide pour
                conserver la photo
                principale actuelle.
              </span>
            </label>


            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 px-4">
              <input
                name="is_featured"
                type="checkbox"
                defaultChecked={
                  product.is_featured
                }
              />

              <span className="text-xs font-black">
                Mettre ce produit en avant
              </span>
            </label>
          </div>
        </section>


        {/* =====================================
            SEO
        ===================================== */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <h2 className="font-black">
            SEO
          </h2>


          <div className="mt-5 grid gap-4">

            <label>
              <span className="text-xs font-black">
                Titre SEO
              </span>

              <input
                name="seo_title"
                defaultValue={
                  product.seo_title
                }
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4"
              />
            </label>


            <label>
              <span className="text-xs font-black">
                Description SEO
              </span>

              <textarea
                name="seo_description"
                rows={4}
                defaultValue={
                  product.seo_description
                }
                className="mt-2 w-full rounded-xl border border-slate-200 p-4"
              />
            </label>
          </div>
        </section>


        <button
          type="submit"
          className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b00] px-6 text-sm font-black text-white sm:w-fit"
        >
          <Save
            size={17}
          />

          Enregistrer les modifications
        </button>
      </form>


      {/* =========================================
          VARIANTES
      ========================================= */}
      <ProductVariantsManager
        key={
          variants
            .map(
              (
                variant,
              ) =>
                `${variant.id}-${variant.updated_at}`,
            )
            .join("|")
        }
        productId={
          productId
        }
        productBasePrice={
          product.base_price
        }
        initialVariants={
          variants
        }
        metadata={
          variantMetadata
        }
      />


      {/* =========================================
          GALERIE
      ========================================= */}
      <section className="mt-8 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <div className="flex flex-wrap items-start justify-between gap-3">

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0b4da2]">
              Médias
            </p>

            <h2 className="mt-2 text-xl font-black">
              Photos du produit
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              {images.length} photo(s)
            </p>
          </div>


          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500">
            <Images
              size={15}
              className="text-[#0b4da2]"
            />

            Défilement manuel uniquement
          </div>
        </div>


        {/* =========================================
            RAIL HORIZONTAL

            - aucun scrollIntoView
            - aucun scrollTo
            - aucun scroll automatique
            - l'utilisateur contrôle le scroll
        ========================================= */}
        {images.length >
        0 ? (
          <div
            className="
              mt-5
              flex
              touch-pan-x
              gap-4
              overflow-x-auto
              overscroll-x-contain
              scroll-auto
              pb-3
              [overflow-anchor:none]
              [scrollbar-width:thin]
            "
          >
            {images.map(
              (
                image,
              ) => {
                const primaryAction =
                  makePrimaryProductImageAction.bind(
                    null,
                    productId,
                    image.id,
                  );

                const deleteAction =
                  deleteProductImageAction.bind(
                    null,
                    productId,
                    image.id,
                  );


                return (
                  <article
                    key={
                      image.id
                    }
                    className="w-[220px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:w-[250px]"
                  >

                    {/* PHOTO */}
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
                        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#ff6b00] px-2.5 py-1 text-[9px] font-black text-white shadow">
                          <Star
                            size={11}
                          />

                          Principale
                        </span>
                      )}
                    </div>


                    {/* ACTIONS */}
                    <div className="p-3">

                      <p className="truncate text-xs font-bold text-slate-700">
                        {
                          image.alt_text ||
                          product.name
                        }
                      </p>


                      <div className="mt-3 grid gap-2">

                        {!image.is_primary && (
                          <form
                            action={
                              primaryAction
                            }
                          >
                            <button
                              type="submit"
                              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-[10px] font-black text-[#0b4da2] transition hover:bg-blue-100"
                            >
                              <Star
                                size={14}
                              />

                              Définir principale
                            </button>
                          </form>
                        )}


                        <form
                          action={
                            deleteAction
                          }
                        >
                          <button
                            type="submit"
                            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-[10px] font-black text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2
                              size={14}
                            />

                            Supprimer la photo
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <div className="mt-5 flex min-h-32 items-center justify-center rounded-2xl bg-slate-50 text-xs font-bold text-slate-400">
            Aucune photo pour ce produit.
          </div>
        )}


        {/* =====================================
            AJOUTER PLUSIEURS PHOTOS
        ===================================== */}
        <form
          action={
            addImageAction
          }
          className="mt-6 grid gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 md:grid-cols-2"
        >

          <div className="flex items-center gap-2 md:col-span-2">
            <ImagePlus
              size={18}
              className="text-[#ff6b00]"
            />

            <div>
              <strong className="block text-sm">
                Ajouter des photos
              </strong>

              <span className="mt-1 block text-[10px] text-slate-500">
                Sélectionnez plusieurs
                images en une seule fois
                si nécessaire.
              </span>
            </div>
          </div>


          <label className="md:col-span-2">
            <span className="text-xs font-black">
              Images *
            </span>

            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              required
              className="mt-2 block w-full cursor-pointer rounded-xl border border-slate-200 bg-white p-3 text-xs"
            />

            <span className="mt-2 block text-[10px] leading-5 text-slate-400">
              Sur ordinateur :
              sélection multiple avec
              Ctrl ou Shift.
              Sur téléphone :
              sélectionnez plusieurs
              photos dans votre galerie.
            </span>
          </label>


          <label>
            <span className="text-xs font-black">
              Texte alternatif
            </span>

            <input
              name="alt_text"
              defaultValue={
                product.name
              }
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"
            />
          </label>


          <label>
            <span className="text-xs font-black">
              Ordre de départ
            </span>

            <input
              name="display_order"
              type="number"
              min="0"
              defaultValue={
                images.length
              }
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4"
            />

            <span className="mt-2 block text-[10px] text-slate-400">
              Les autres photos
              suivent automatiquement :
              +1, +2, +3...
            </span>
          </label>


          <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 md:col-span-2">
            <input
              name="is_primary"
              type="checkbox"
            />

            <span className="text-xs font-black">
              Utiliser la première
              photo sélectionnée comme
              photo principale
            </span>
          </label>


          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-[10px] leading-5 text-[#0b4da2] md:col-span-2">
            Après l&apos;ajout ou la
            suppression d&apos;une photo,
            aucune redirection vers le haut
            de la page n&apos;est effectuée.
            Le rail ne défile pas
            automatiquement.
          </div>


          <button
            type="submit"
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0b4da2] px-5 text-xs font-black text-white transition hover:bg-[#083b7f] md:col-span-2 md:w-fit"
          >
            <ImagePlus
              size={16}
            />

            Ajouter les photos
          </button>
        </form>
      </section>


      {/* =========================================
          ARCHIVAGE
      ========================================= */}
      <section className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50 p-5 sm:p-6">

        <h2 className="font-black text-amber-900">
          Gestion du statut
        </h2>


        <p className="mt-2 max-w-2xl text-xs leading-5 text-amber-700">
          Archiver masque le produit
          sans supprimer son historique,
          ses commandes ou ses données
          liées.
        </p>


        {product.status !==
          "ARCHIVED" && (
          <form
            action={
              archiveAction
            }
            className="mt-4"
          >
            <button
              type="submit"
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 text-xs font-black text-amber-700"
            >
              <Archive
                size={16}
              />

              Archiver le produit
            </button>
          </form>
        )}
      </section>
    </>
  );
}