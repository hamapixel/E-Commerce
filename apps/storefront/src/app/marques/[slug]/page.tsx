import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ProductGrid,
} from "@/components/product/product-grid";

import {
  getBrand,
  getProducts,
} from "@/lib/api";

import {
  absoluteImageUrl,
  absoluteUrl,
  firstText,
  readTextField,
  safeJsonLd,
  SITE_NAME,
  truncateText,
} from "@/lib/seo";


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}


export const dynamic =
  "force-dynamic";


export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug,
  } = await params;

  const brand =
    await getBrand(
      slug,
    );

  if (!brand) {
    return {
      title:
        "Marque introuvable",

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
        brand,
        "seo_title",
      ),
      brand.name,
    );

  const description =
    truncateText(
      firstText(
        readTextField(
          brand,
          "seo_description",
        ),
        brand.description,
        `Découvrez les produits ${brand.name} disponibles sur SUGU KURA.`,
      ),
      160,
    );

  const canonical =
    `/marques/${brand.slug}`;

  const logo =
    absoluteImageUrl(
      readTextField(
        brand,
        "logo",
      ),
    );

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
        logo
          ? [logo]
          : undefined,
    },

    twitter: {
      card:
        "summary_large_image",

      title,

      description,

      images:
        logo
          ? [logo]
          : undefined,
    },
  };
}


export default async function BrandPage({
  params,
}: PageProps) {
  const {
    slug,
  } = await params;

  const [
    brand,
    products,
  ] = await Promise.all([
    getBrand(slug),

    getProducts(
      `brand=${encodeURIComponent(
        slug,
      )}&page_size=100`,
    ),
  ]);

  if (!brand) {
    notFound();
  }

  const brandUrl =
    absoluteUrl(
      `/marques/${brand.slug}`,
    );

  const description =
    truncateText(
      firstText(
        readTextField(
          brand,
          "seo_description",
        ),
        brand.description,
        `Découvrez les produits ${brand.name} disponibles sur SUGU KURA.`,
      ),
      160,
    );

  const brandJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "Brand",

    name:
      brand.name,

    description,

    url:
      brandUrl,

    logo:
      absoluteImageUrl(
        readTextField(
          brand,
          "logo",
        ),
      ) || undefined,
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
          brand.name,

        item:
          brandUrl,
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
              brandJsonLd,
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

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10">
          <Link
            href="/"
            className="text-xs font-black text-[#0b4da2]"
          >
            Retour à l&apos;accueil
          </Link>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
            Marque
          </p>

          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            {brand.name}
          </h1>

          {brand.description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              {brand.description}
            </p>
          )}
        </div>

        <div className="mt-8">
          <ProductGrid
            products={
              products.results
            }
          />
        </div>
      </div>
    </>
  );
}
