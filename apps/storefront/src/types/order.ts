export interface OrderItem {
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


export interface OrderPayment {
  id: string;

  reference: string;

  method:
    | "CASH_ON_DELIVERY"
    | "PAY_AT_PICKUP";

  method_label: string;

  status:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";

  status_label: string;

  amount: string;
  currency: string;

  provider: string;
  provider_reference: string;
  transaction_id: string;

  paid_at: string | null;

  created_at: string;
}


export interface Order {
  id: string;

  order_number: string;

  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";

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

  created_at: string;
  updated_at: string;

  items: OrderItem[];

  payments: OrderPayment[];
}