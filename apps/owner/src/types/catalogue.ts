// ============================================================
// SUGU KURA — TYPES CATALOGUE OWNER
// ============================================================


// ============================================================
// CATÉGORIE
// ============================================================

export interface OwnerCategory {
  id: number;

  name: string;

  slug: string;

  description: string;

  parent: number | null;

  parent_name: string | null;

  image_url: string | null;

  icon: string;

  display_order: number;

  is_active: boolean;

  is_featured_home: boolean;

  seo_title: string;

  seo_description: string;

  products_count: number;

  created_at: string;

  updated_at: string;
}


// ============================================================
// MARQUE
// ============================================================

export interface OwnerBrand {
  id: number;

  name: string;

  slug: string;

  logo_url: string | null;

  description: string;

  website: string;

  display_order: number;

  is_active: boolean;

  is_featured: boolean;

  seo_title: string;

  seo_description: string;

  products_count: number;

  created_at: string;

  updated_at: string;
}


// ============================================================
// PRODUIT
// ============================================================

export interface OwnerProduct {
  id: number;

  name: string;

  slug: string;

  sku: string;

  barcode: string | null;

  category: number;

  category_name: string;

  brand: number | null;

  brand_name: string | null;

  short_description: string;

  description: string;

  base_price: string;

  purchase_price: string | null;

  status: string;

  is_featured: boolean;

  seo_title: string;

  seo_description: string;

  primary_image_url: string | null;

  images_count: number;

  variants_count: number;

  stock_on_hand: number;

  stock_reserved: number;

  stock_available: number;

  created_at: string;

  updated_at: string;
}


// ============================================================
// PAGINATION PRODUITS
// ============================================================

export interface OwnerPaginatedProducts {
  count: number;

  next: string | null;

  previous: string | null;

  results: OwnerProduct[];
}


// ============================================================
// CHOIX GÉNÉRIQUE
// ============================================================

export interface SelectChoice {
  value: string;

  label: string;
}


// ============================================================
// MÉTADONNÉES CATALOGUE
// ============================================================

export interface CatalogMetadataCategory {
  id: number;

  name: string;

  parent_id: number | null;

  is_active: boolean;
}


export interface CatalogMetadataBrand {
  id: number;

  name: string;

  is_active: boolean;
}


export interface CatalogMetadata {
  product_statuses: SelectChoice[];

  categories: CatalogMetadataCategory[];

  brands: CatalogMetadataBrand[];
}


// ============================================================
// IMAGE PRODUIT
// ============================================================

export interface OwnerProductImage {
  id: number;

  product: number;

  image_url: string | null;

  alt_text: string;

  is_primary: boolean;

  display_order: number;

  created_at: string;
}


// ============================================================
// VARIANTES PRODUIT
// ============================================================

export interface OwnerVariantAttribute {
  attribute_id: number;

  attribute: string;

  attribute_slug: string;

  value_id: number;

  value: string;

  color_hex: string;
}


export interface OwnerProductVariant {
  id: number;

  product: number;

  sku: string;

  barcode: string;

  price: string;

  image_url: string | null;

  is_active: boolean;

  attributes: OwnerVariantAttribute[];

  label: string;

  stock_on_hand: number;

  stock_reserved: number;

  stock_available: number;

  created_at: string;

  updated_at: string;
}


export interface OwnerVariantMetadataValue {
  id: number;

  value: string;

  display_value: string;

  color_hex: string;
}


export interface OwnerVariantMetadataAttribute {
  id: number;

  name: string;

  slug: string;

  data_type: string;

  values: OwnerVariantMetadataValue[];
}


export interface OwnerVariantMetadata {
  attributes: OwnerVariantMetadataAttribute[];
}

