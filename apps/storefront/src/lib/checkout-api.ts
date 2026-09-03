import type {
  CheckoutCreatePayload,
  CheckoutSession,
} from "@/types/checkout";


async function readError(
  response: Response,
): Promise<string> {
  try {
    const data = await response.json();

    if (
      typeof data.detail ===
      "string"
    ) {
      return data.detail;
    }

    if (data.address) {
      if (
        Array.isArray(
          data.address,
        )
      ) {
        return String(
          data.address[0],
        );
      }

      return String(
        data.address,
      );
    }

    if (
      data.non_field_errors
    ) {
      if (
        Array.isArray(
          data.non_field_errors,
        )
      ) {
        return String(
          data.non_field_errors[0],
        );
      }

      return String(
        data.non_field_errors,
      );
    }

    return (
      "Les informations du checkout sont invalides."
    );
  } catch {
    return (
      "Une erreur est survenue pendant le checkout."
    );
  }
}


export async function createCheckout(
  payload: CheckoutCreatePayload,
): Promise<CheckoutSession> {
  const response = await fetch(
    "/api/checkout",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        Accept:
          "application/json",
      },

      body: JSON.stringify(
        payload,
      ),
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


export async function cancelCheckout(
  id: string,
): Promise<{
  status: string;
  detail: string;
}> {
  const response = await fetch(
    `/api/checkout/${encodeURIComponent(id)}`,
    {
      method: "DELETE",

      headers: {
        Accept:
          "application/json",
      },
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
