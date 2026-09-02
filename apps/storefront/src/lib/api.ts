import type {
  Advertisement,
  Brand,
  Category,
  PaginatedResponse,
  Partner,
  Product,
  ProductDetail,
  Promotion,
} from "@/types/api";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api/v1";

async function request<T>(
  path: string,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `API SUGU KURA : ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

async function safeRequest<T>(
  path: string,
  fallback: T,
): Promise<T> {
  try {
    return await request<T>(path);
  } catch {
    return fallback;
  }
}

function unwrap<T>(
  data: PaginatedResponse<T> | T[],
): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  return data.results;
}

export async function getCategories() {
  const data = await safeRequest<
    PaginatedResponse<Category> | Category[]
  >(
    "/catalog/categories/?page_size=100",
    [],
  );

  return unwrap(data);
}

export async function getBrands() {
  const data = await safeRequest<
    PaginatedResponse<Brand> | Brand[]
  >(
    "/catalog/brands/?page_size=100",
    [],
  );

  return unwrap(data);
}

export async function getProducts(
  query = "",
) {
  const suffix = query
    ? `?${query}`
    : "?page_size=24";

  return safeRequest<PaginatedResponse<Product>>(
    `/catalog/products/${suffix}`,
    {
      count: 0,
      next: null,
      previous: null,
      results: [],
    },
  );
}

export async function getProduct(
  slug: string,
): Promise<ProductDetail | null> {
  try {
    return await request<ProductDetail>(
      `/catalog/products/${encodeURIComponent(slug)}/`,
    );
  } catch {
    return null;
  }
}

export async function getSimilarProducts(
  product: ProductDetail,
  limit = 5,
): Promise<Product[]> {
  const category =
    encodeURIComponent(
      product.category.slug,
    );

  const brand =
    product.brand?.slug
      ? encodeURIComponent(
          product.brand.slug,
        )
      : null;

  const categoryQuery =
    `category=${category}&page_size=16&ordering=-created_at`;

  const sameBrandPromise =
    brand
      ? getProducts(
          `category=${category}&brand=${brand}&page_size=12&ordering=-created_at`,
        )
      : Promise.resolve({
          count: 0,
          next: null,
          previous: null,
          results: [] as Product[],
        });

  const [
    sameBrand,
    sameCategory,
  ] = await Promise.all([
    sameBrandPromise,
    getProducts(
      categoryQuery,
    ),
  ]);

  const candidates = [
    ...sameBrand.results,
    ...sameCategory.results,
  ];

  const unique =
    new Map<number, Product>();

  for (const candidate of candidates) {
    if (
      candidate.id === product.id
      || candidate.slug === product.slug
      || candidate.available_quantity <= 0
    ) {
      continue;
    }

    if (!unique.has(candidate.id)) {
      unique.set(
        candidate.id,
        candidate,
      );
    }

    if (unique.size >= limit) {
      break;
    }
  }

  return Array.from(
    unique.values(),
  ).slice(
    0,
    limit,
  );
}

export async function getCategory(
  slug: string,
): Promise<Category | null> {
  try {
    return await request<Category>(
      `/catalog/categories/${encodeURIComponent(slug)}/`,
    );
  } catch {
    return null;
  }
}

export async function getBrand(
  slug: string,
): Promise<Brand | null> {
  try {
    return await request<Brand>(
      `/catalog/brands/${encodeURIComponent(slug)}/`,
    );
  } catch {
    return null;
  }
}

export async function getPromotions() {
  return safeRequest<Promotion[]>(
    "/marketing/promotions/",
    [],
  );
}

export async function getAdvertisements(
  placement: string,
) {
  return safeRequest<Advertisement[]>(
    `/marketing/advertisements/?placement=${encodeURIComponent(
      placement,
    )}`,
    [],
  );
}

export async function getPartners() {
  return safeRequest<Partner[]>(
    "/marketing/partners/",
    [],
  );
}

export async function getHomeData() {
  const [
    categories,
    products,
    promotions,
    advertisements,
    partners,
  ] = await Promise.all([
    getCategories(),

    getProducts(
      "page_size=12&ordering=-created_at",
    ),

    getPromotions(),

    getAdvertisements(
      "HOME_HERO",
    ),

    getPartners(),
  ]);

  return {
    categories,
    products: products.results,
    promotions,
    advertisements,
    partners,
  };
}
