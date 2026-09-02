import type {
  MetadataRoute,
} from "next";

import {
  getBrands,
  getCategories,
  getProducts,
} from "@/lib/api";

import {
  absoluteUrl,
} from "@/lib/seo";

import type {
  Product,
} from "@/types/api";


async function getAllProductsForSitemap() {
  const products:
    Product[] = [];

  let page =
    1;

  while (true) {
    const batch =
      await getProducts(
        `page=${page}&page_size=100&ordering=id`,
      );

    products.push(
      ...batch.results,
    );

    if (!batch.next) {
      break;
    }

    page +=
      1;

    /*
     * Garde-fou uniquement contre une API
     * qui renverrait "next" en boucle.
     * 10 000 pages * 100 produits est déjà
     * très largement au-dessus des besoins.
     */
    if (
      page > 10000
    ) {
      break;
    }
  }

  return products;
}


export default async function sitemap():
  Promise<MetadataRoute.Sitemap> {
  const [
    categories,
    brands,
    products,
  ] = await Promise.all([
    getCategories(),
    getBrands(),
    getAllProductsForSitemap(),
  ]);

  const home:
    MetadataRoute.Sitemap = [
    {
      url:
        absoluteUrl("/"),

      changeFrequency:
        "daily",

      priority:
        1,
    },
  ];

  const categoryEntries:
    MetadataRoute.Sitemap =
    categories.map(
      (category) => ({
        url:
          absoluteUrl(
            `/categories/${category.slug}`,
          ),

        changeFrequency:
          "daily",

        priority:
          0.8,
      }),
    );

  const brandEntries:
    MetadataRoute.Sitemap =
    brands.map(
      (brand) => ({
        url:
          absoluteUrl(
            `/marques/${brand.slug}`,
          ),

        changeFrequency:
          "weekly",

        priority:
          0.7,
      }),
    );

  const productEntries:
    MetadataRoute.Sitemap =
    products.map(
      (product) => ({
        url:
          absoluteUrl(
            `/produits/${product.slug}`,
          ),

        lastModified:
          product.created_at
            ? new Date(
                product.created_at,
              )
            : undefined,

        changeFrequency:
          "daily",

        priority:
          0.9,
      }),
    );

  return [
    ...home,
    ...categoryEntries,
    ...brandEntries,
    ...productEntries,
  ];
}
