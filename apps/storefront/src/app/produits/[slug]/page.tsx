import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ProductGallery,
} from "@/components/product/product-gallery";

import {
  ProductPurchasePanel,
} from "@/components/product/product-purchase-panel";

import {
  getProduct,
} from "@/lib/api";

import {
  absoluteUrl,
  firstText,
  readTextField,
  safeJsonLd,
  SITE_NAME,
  truncateText,
  uniqueUrls,
} from "@/lib/seo";


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}


export const dynamic =
  "force-dynamic";


function productDescription(
  product: unknown,
  productName: string,
) {
  const description =
    firstText(
      readTextField(
        product,
        "seo_description",
      ),
      readTextField(
        product,
        "short_description",
      ),
      readTextField(
        product,
        "description",
      ),
      `Découvrez ${productName} sur SUGU KURA. Prix, disponibilité et commande en ligne.`,
    );

  return truncateText(
    description,
    160,
  );
}


export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const product =
    await getProduct(
      slug,
    );

  if (!product) {
    return {
      title:
        "Produit introuvable",

      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }

  const title =
    firstText(
      readTextField(
        product,
        "seo_title",
      ),
      product.name,
    );

  const description =
    productDescription(
      product,
      product.name,
    );

  const images =
    uniqueUrls([
      product.primary_image,
      ...product.images.map(
        (image) =>
          image.image,
      ),
    ]);

  const canonical =
    `/produits/${product.slug}`;

  return {
    title,

    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type:
        "website",

      locale:
        "fr_ML",

      siteName:
        SITE_NAME,

      url:
        canonical,

      title,

      description,

      images:
        images.length
          ? images
          : undefined,
    },

    twitter: {
      card:
        "summary_large_image",

      title,

      description,

      images:
        images.length
          ? images
          : undefined,
    },

    robots: {
      index:
        true,

      follow:
        true,
    },
  };
}


export default async function ProductPage({
  params,
}: PageProps) {
  const {
    slug,
  } = await params;

  const product =
    await getProduct(
      slug,
    );

  if (!product) {
    notFound();
  }

  const description =
    productDescription(
      product,
      product.name,
    );

  const imageUrls =
    uniqueUrls([
      product.primary_image,
      ...product.images.map(
        (image) =>
          image.image,
      ),
    ]);

  const productUrl =
    absoluteUrl(
      `/produits/${product.slug}`,
    );

  const productJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "Product",

    name:
      product.name,

    description,

    sku:
      product.sku,

    image:
      imageUrls.length
        ? imageUrls
        : undefined,

    category:
      product.category.name,

    brand:
      product.brand
        ? {
            "@type":
              "Brand",

            name:
              product.brand.name,
          }
        : undefined,

    offers: {
      "@type":
        "Offer",

      url:
        productUrl,

      priceCurrency:
        "XOF",

      price:
        String(
          product.current_price,
        ),

      availability:
        product.available_quantity >
        0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition:
        "https://schema.org/NewCondition",
    },
  };

  const breadcrumbJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    itemListElement: [
      {
        "@type":
          "ListItem",

        position:
          1,

        name:
          "Accueil",

        item:
          absoluteUrl("/"),
      },
      {
        "@type":
          "ListItem",

        position:
          2,

        name:
          product.category.name,

        item:
          absoluteUrl(
            `/categories/${product.category.slug}`,
          ),
      },
      {
        "@type":
          "ListItem",

        position:
          3,

        name:
          product.name,

        item:
          productUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            safeJsonLd(
              productJsonLd,
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            safeJsonLd(
              breadcrumbJsonLd,
            ),
        }}
      />

      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:py-10">
        <div className="mb-5 text-xs font-semibold text-slate-400">
          <Link
            href="/"
            className="hover:text-[#0b4da2]"
          >
            Accueil
          </Link>

          {" / "}

          <Link
            href={`/categories/${product.category.slug}`}
            className="hover:text-[#0b4da2]"
          >
            {
              product.category
                .name
            }
          </Link>

          {" / "}

          <span>
            {product.name}
          </span>
        </div>

        <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={
              product.images
            }
            name={
              product.name
            }
            fallback={
              product.primary_image
            }
          />

          <div>
            {product.brand && (
              <Link
                href={`/marques/${product.brand.slug}`}
                className="text-xs font-black uppercase tracking-[0.18em] text-[#0b4da2]"
              >
                {
                  product.brand
                    .name
                }
              </Link>
            )}

            <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-2 text-xs font-semibold text-slate-400">
              Référence :{" "}
              {product.sku}
            </p>

            {product.short_description && (
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                {
                  product.short_description
                }
              </p>
            )}

            <ProductPurchasePanel
              product={
                product
              }
            />
          </div>
        </section>

        {product.description && (
          <section className="mt-12 rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black text-slate-950">
              Description du produit
            </h2>

            <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
              {
                product.description
              }
            </div>
          </section>
        )}
      </div>
    </>
  );
}
