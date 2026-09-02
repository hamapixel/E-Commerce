import type {
  CheckoutSession,
} from "@/types/checkout";


const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api/v1";


export async function getCheckoutSession(
  id: string,
): Promise<CheckoutSession | null> {
  try {
    const response =
      await fetch(
        `${API_URL}/checkout/sessions/${encodeURIComponent(id)}/`,
        {
          cache: "no-store",

          headers: {
            Accept:
              "application/json",
          },
        },
      );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}