export interface OwnerUser {
  id: number;
  username: string;
  email: string;
  role: string;
  display_name: string;
}


export interface DashboardSummary {
  orders: {
    total: number;
    today: number;
    pending: number;
    processing: number;
    delivered: number;
  };

  money: {
    paid_revenue: string;
    pending_amount: string;
    today_order_total: string;
  };

  catalog: {
    products: number;
    active_products: number;
    categories: number;
    brands: number;
  };

  inventory: {
    low_stock: number;
    out_of_stock: number;
  };

  checkout: {
    active: number;
  };

  marketing: {
    active_promotions: number;
    active_ads: number;
    active_partners: number;

    impressions: number;
    clicks: number;
    ctr: number;

    orders: number;
    revenue: string;
  };
}


export interface OwnerOrderItem {
  id: number;

  product_name: string;
  sku: string;
  variant_label: string;

  unit_price: string;
  quantity: number;
  line_total: string;
}


export interface OwnerPayment {
  id: string;

  reference: string;

  method: string;
  method_label: string;

  status: string;
  status_label: string;

  amount: string;
  currency: string;

  provider?: string;
  provider_reference?: string;
  transaction_id?: string;

  paid_at: string | null;
  created_at: string;
}


export interface OwnerOrder {
  id: string;

  order_number: string;

  status: string;
  status_label: string;

  customer_name: string;
  customer_phone: string;

  customer_whatsapp?: string;
  customer_email?: string;

  delivery_method: string;
  delivery_method_label: string;

  city: string;
  delivery_zone: string;
  address?: string;
  notes?: string;

  subtotal: string;
  delivery_fee: string;
  total: string;

  created_at: string;
  updated_at?: string;

  items: OwnerOrderItem[];

  payments: OwnerPayment[];
}


export interface InventoryAlert {
  id: number;

  product_id: number;

  product_name: string;
  sku: string;

  variant: string;

  quantity_on_hand: number;
  quantity_reserved: number;

  available: number;

  low_stock_threshold: number;

  status:
    | "LOW_STOCK"
    | "OUT_OF_STOCK";
}


export interface MarketingSummary {
  active_promotions: number;
  active_ads: number;
  active_partners: number;

  impressions: number;
  clicks: number;
  ctr: number;

  orders: number;
  revenue: string;
}




export interface AdvertisementStats {
  impressions: number;
  clicks: number;
  ctr: number;
  orders: number;
  revenue: string;
}


export interface AdvertisementRecord {
  id: number;

  company_name: string;
  company_logo: string | null;

  title: string;
  text: string;

  desktop_image: string;
  mobile_image: string | null;

  button_text: string;
  button_url: string;

  whatsapp: string;
  website: string;

  placement: string;
  placement_label: string;

  target_categories: number[];

  priority_level: number;
  priority_label: string;

  display_priority: number;

  promotion: number | null;

  display_old_price:
    | string
    | null;

  display_price:
    | string
    | null;

  destination_type: string;
  destination_label: string;

  destination_product:
    | number
    | null;

  destination_category:
    | number
    | null;

  destination_brand:
    | number
    | null;

  start_at: string;
  end_at: string;

  is_active: boolean;
  hide_after_expiry: boolean;

  effective_link: string;

  is_current: boolean;
  has_expired: boolean;

  stats: AdvertisementStats;

  created_at: string;
  updated_at: string;
}


export interface AdvertisementChoice {
  value:
    | string
    | number;

  label: string;
}


export interface AdvertisementMetadataEntity {
  id: number;
  name: string;
  slug?: string;
  sku?: string;
  is_current?: boolean;
}


export interface AdvertisementMetadata {
  placements:
    AdvertisementChoice[];

  priorities:
    AdvertisementChoice[];

  destination_types:
    AdvertisementChoice[];

  categories:
    AdvertisementMetadataEntity[];

  brands:
    AdvertisementMetadataEntity[];

  products:
    AdvertisementMetadataEntity[];

  promotions:
    AdvertisementMetadataEntity[];
}
