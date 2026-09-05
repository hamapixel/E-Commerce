import type {
  CheckoutCreatePayload,
  CheckoutSession,
} from "@/types/checkout";


function customerSafeMessage(
  value: unknown,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const message =
    value.trim();

  if (!message) {
    return null;
  }

  const technicalWords =
    /\b(django|checkout|backend|server|serveur|api)\b/i;

  if (
    technicalWords.test(
      message,
    )
  ) {
    return null;
  }

  return message;
}


async function readError(
  response: Response,
): Promise<string> {
  try {
    const data = await response.json();

    const detail =
      customerSafeMessage(
        data.detail,
      );

    if (detail) {
      return detail;
    }

    if (data.address) {
      const addressMessage =
        customerSafeMessage(
          Array.isArray(
            data.address,
          )
            ? data.address[0]
            : data.address,
        );

      if (addressMessage) {
        return addressMessage;
      }
    }

    if (
      data.non_field_errors
    ) {
      const fieldMessage =
        customerSafeMessage(
          Array.isArray(
            data.non_field_errors,
          )
            ? data.non_field_errors[0]
            : data.non_field_errors,
        );

      if (fieldMessage) {
        return fieldMessage;
      }
    }

    return (
      "Vérifiez vos informations puis réessayez."
    );
  } catch {
    return (
      "Une erreur est survenue. Réessayez."
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
