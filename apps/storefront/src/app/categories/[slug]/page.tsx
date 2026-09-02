import type {
  Metadata,
} from "next";

import {
  notFound,
} from "next/navigation";

import {
  ProductGrid,
} from "@/components/product/product-grid";

import {
  getCategory,
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

  const category =
    await getCategory(
      slug,
    );

  if (!category) {
    return {
      title:
        "Catégorie introuvable",

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
        category,
        "seo_title",
      ),
      category.name,
    );

  const description =
    truncateText(
      firstText(
        readTextField(
          category,
          "seo_description",
        ),
        category.description,
        `Découvrez les produits ${category.name} disponibles sur SUGU KURA.`,
      ),
      160,
    );

  const canonical =
    `/categories/${category.slug}`;

  const categoryImage =
    absoluteImageUrl(
      readTextField(
        category,
        "image",
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
        categoryImage
          ? [categoryImage]
          : undefined,
    },

    twitter: {
      card:
        "summary_large_image",

      title,

      description,

      images:
        categoryImage
          ? [categoryImage]
          : undefined,
    },
  };
}


export default async function CategoryPage({
  params,
}: PageProps) {
  const {
    slug,
  } = await params;

  const [
    category,
    products,
  ] = await Promise.all([
    getCategory(slug),

    getProducts(
      `category=${encodeURIComponent(
        slug,
      )}&page_size=100`,
    ),
  ]);

  if (!category) {
    notFound();
  }

  const categoryUrl =
    absoluteUrl(
      `/categories/${category.slug}`,
    );

  const description =
    truncateText(
      firstText(
        readTextField(
          category,
          "seo_description",
        ),
        category.description,
        `Découvrez les produits ${category.name} disponibles sur SUGU KURA.`,
      ),
      160,
    );

  const collectionJsonLd = {
    "@context":
      "https://schema.org",

    "@type":
      "CollectionPage",

    name:
      category.name,

    description,

    url:
      categoryUrl,

    mainEntity: {
      "@type":
        "ItemList",

      numberOfItems:
        products.results.length,

      itemListElement:
        products.results.map(
          (
            product,
            index,
          ) => ({
            "@type":
              "ListItem",

            position:
              index + 1,

            name:
              product.name,

            url:
              absoluteUrl(
                `/produits/${product.slug}`,
              ),
          }),
        ),
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
          category.name,

        item:
          categoryUrl,
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
              collectionJsonLd,
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
        <div className="rounded-[28px] bg-gradient-to-br from-[#0b4da2] to-[#061f43] px-6 py-10 text-white sm:px-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">
            Catégorie
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {category.name}
          </h1>

          {category.description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              {category.description}
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
