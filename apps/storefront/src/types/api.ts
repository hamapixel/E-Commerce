export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CategoryMini {
  id: number;
  name: string;
  slug: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: CategoryMini | null;
  image: string | null;
  icon: string;
  display_order: number;
  is_featured_home: boolean;
  subcategories: CategoryMini[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description?: string;
  website?: string;
  is_featured?: boolean;
}

export interface PromotionSummary {
  id: number;
  name: string;
  type: string;
  badge: string;
  end_at: string;
  remaining_seconds: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;

  category: CategoryMini;

  brand: Brand | null;

  short_description: string;

  primary_image: string | null;

  normal_price: string;
  current_price: string;

  has_promotion: boolean;

  promotion: PromotionSummary | null;

  available_quantity: number;

  has_variants: boolean;

  is_featured: boolean;

  created_at: string;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
}

export interface AttributeValue {
  id: number;
  value: string;
  display_value: string;
  color_hex: string;
  display_order: number;
}

export interface Attribute {
  id: number;
  name: string;
  slug: string;
  data_type: string;
  values: AttributeValue[];
}

export interface ProductAttribute {
  id: number;
  attribute: Attribute;
  is_required: boolean;
  is_variant_axis: boolean;
  display_order: number;
}

export interface VariantAttribute {
  attribute: string;
  attribute_slug: string;
  value: string;
  color_hex: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  barcode: string | null;

  effective_price: string;
  current_price: string;

  has_promotion: boolean;

  image: string | null;

  is_active: boolean;

  attributes: VariantAttribute[];

  available_quantity: number;
}

export interface ProductDetail extends Product {
  barcode: string | null;

  description: string;

  seo_title: string;
  seo_description: string;

  images: ProductImage[];

  attributes: ProductAttribute[];

  variants: ProductVariant[];

  updated_at: string;
}

export interface Promotion {
  id: number;
  name: string;
  slug: string;

  campaign_type: string;
  discount_type: string;
  discount_value: string;

  target_mode: string;

  badge_text: string;

  start_at: string;
  end_at: string;

  remaining_seconds: number;

  priority: number;
}

export interface Advertisement {
  id: number;

  company_name: string;
  company_logo: string | null;

  title: string;
  text: string;

  desktop_image: string;
  mobile_image: string | null;

  button_text: string;
  effective_link: string;

  placement: string;

  priority_level: number;
  display_priority: number;

  promotion: Promotion | null;

  display_old_price: string | null;
  display_price: string | null;

  start_at: string;
  end_at: string;

  remaining_seconds: number;
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
  description: string;
  effective_link: string;
  display_order: number;
}