import type {
  Order,
} from "@/types/order";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api/v1";


export type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "PAY_AT_PICKUP";


async function readError(
  response: Response,
): Promise<string> {
  try {
    const data =
      await response.json();

    if (
      typeof data.detail ===
      "string"
    ) {
      return data.detail;
    }

    return (
      "Impossible de créer la commande."
    );
  } catch {
    return (
      "Une erreur est survenue "
      + "pendant la création "
      + "de la commande."
    );
  }
}


export async function createOrder(
  checkoutId: string,
  paymentMethod: PaymentMethod,
): Promise<Order> {
  const response =
    await fetch(
      `${API_URL}/orders/`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",
        },

        body:
          JSON.stringify({
            checkout_id:
              checkoutId,

            payment_method:
              paymentMethod,
          }),
      },
    );

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
      ),
    );
  }

  return response.json();
}