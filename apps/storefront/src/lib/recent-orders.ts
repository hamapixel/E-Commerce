export const RECENT_ORDERS_STORAGE_KEY =
  "sugu-kura-recent-orders";

export const LEGACY_LAST_ORDER_STORAGE_KEY =
  "sugu-kura-last-order";

export const RECENT_ORDERS_EVENT =
  "sugu-kura-recent-orders-changed";

export interface StoredOrder {
  id: string;
  orderNumber: string;
  savedAt: string;
}

const MAX_RECENT_ORDERS = 5;

function isStoredOrder(
  value: unknown,
): value is StoredOrder {
  if (
    !value
    || typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<StoredOrder>;

  return (
    typeof candidate.id === "string"
    && Boolean(candidate.id.trim())
    && typeof candidate.orderNumber === "string"
    && Boolean(candidate.orderNumber.trim())
    && typeof candidate.savedAt === "string"
  );
}

export function parseStoredOrders(
  raw: string,
): StoredOrder[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    const candidates = Array.isArray(parsed)
      ? parsed
      : [parsed];

    const seen = new Set<string>();

    return candidates
      .filter(isStoredOrder)
      .filter((order) => {
        if (seen.has(order.id)) {
          return false;
        }

        seen.add(order.id);
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.savedAt).getTime()
          - new Date(a.savedAt).getTime(),
      )
      .slice(0, MAX_RECENT_ORDERS);
  } catch {
    return [];
  }
}

export function getRecentOrdersSnapshot() {
  const recent = window.localStorage.getItem(
    RECENT_ORDERS_STORAGE_KEY,
  );

  if (recent) {
    return recent;
  }

  return window.localStorage.getItem(
    LEGACY_LAST_ORDER_STORAGE_KEY,
  ) ?? "";
}

export function saveRecentOrder(
  order: {
    id: string;
    orderNumber: string;
  },
) {
  const current = parseStoredOrders(
    getRecentOrdersSnapshot(),
  );

  const stored: StoredOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    savedAt: new Date().toISOString(),
  };

  const next = [
    stored,
    ...current.filter(
      (item) => item.id !== order.id,
    ),
  ].slice(0, MAX_RECENT_ORDERS);

  window.localStorage.setItem(
    RECENT_ORDERS_STORAGE_KEY,
    JSON.stringify(next),
  );

  window.localStorage.setItem(
    LEGACY_LAST_ORDER_STORAGE_KEY,
    JSON.stringify(stored),
  );

  window.dispatchEvent(
    new Event(
      RECENT_ORDERS_EVENT,
    ),
  );
}
