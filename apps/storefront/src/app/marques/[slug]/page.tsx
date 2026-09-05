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
  SearchPagination,
} from "@/components/search/search-pagination";

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


const PRODUCTS_PER_PAGE = 16;


interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<
    Record<
      string,
      string |
      string[] |
      undefined
    >
  >;
}


export const dynamic =
  "force-dynamic";


function readPage(
  value:
    | string
    | string[]
    | undefined,
) {
  const raw =
    Array.isArray(value)
      ? value[0]
      : value;

  return Math.max(
    1,
    Number(
      raw || "1",
    ) || 1,
  );
}


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
  searchParams,
}: PageProps) {
  const {
    slug,
  } = await params;

  const rawSearchParams =
    await searchParams;

  const page =
    readPage(
      rawSearchParams.page,
    );

  const [
    brand,
    products,
  ] = await Promise.all([
    getBrand(slug),

    getProducts(
      `brand=${encodeURIComponent(
        slug,
      )}&page_size=${PRODUCTS_PER_PAGE}&page=${page}&ordering=-created_at`,
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

        <section
          id="catalogue-results"
          className="mt-8 scroll-mt-36"
        >
          <div className="mb-5 flex items-end justify-between gap-3">
            <p className="text-sm font-black text-slate-700">
              {products.count} produit
              {products.count !== 1
                ? "s"
                : ""}
            </p>

            <p className="text-xs font-semibold text-slate-400">
              Page {page}
            </p>
          </div>

          <ProductGrid
            products={products.results}
          />

          <SearchPagination
            count={products.count}
            page={page}
            pageSize={
              PRODUCTS_PER_PAGE
            }
            basePath={
              `/marques/${brand.slug}`
            }
          />
        </section>
      </div>
    </>
  );
}
