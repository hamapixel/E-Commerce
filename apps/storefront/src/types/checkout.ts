export interface CheckoutLinePayload {
  product_id: number;
  variant_id: number | null;
  quantity: number;
}


export interface CheckoutCreatePayload {
  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_email: string;

  delivery_method:
    | "DELIVERY"
    | "PICKUP";

  city: string;
  delivery_zone: string;
  address: string;
  notes: string;

  items: CheckoutLinePayload[];
}


export interface CheckoutItem {
  id: number;

  product_id: number;
  variant_id: number | null;

  product_slug: string;

  product_name: string;
  sku: string;

  variant_label: string;

  normal_price: string;
  unit_price: string;

  quantity: number;

  line_total: string;
}


export interface CheckoutSession {
  id: string;

  status:
    | "ACTIVE"
    | "EXPIRED"
    | "CANCELLED"
    | "CONVERTED";

  status_label: string;

  customer_name: string;
  customer_phone: string;
  customer_whatsapp: string;
  customer_email: string;

  delivery_method:
    | "DELIVERY"
    | "PICKUP";

  delivery_method_label: string;

  city: string;
  delivery_zone: string;
  address: string;
  notes: string;

  subtotal: string;
  delivery_fee: string;
  total: string;

  expires_at: string;
  remaining_seconds: number;

  created_at: string;

  items: CheckoutItem[];
}