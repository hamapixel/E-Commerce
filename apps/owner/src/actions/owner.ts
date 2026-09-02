"use server";

import {
  cookies,
} from "next/headers";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";


const API_URL =
  process.env.INTERNAL_API_URL ??
  "http://127.0.0.1:8000/api/v1";


async function getToken() {
  const cookieStore =
    await cookies();

  return (
    cookieStore.get(
      "sk_owner_token",
    )?.value ??
    ""
  );
}


async function postOwner(
  path: string,
  body?: unknown,
) {
  const token =
    await getToken();

  if (!token) {
    redirect(
      "/login",
    );
  }

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        method: "POST",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",

          Authorization:
            `Token ${token}`,
        },

        body:
          body !== undefined
            ? JSON.stringify(
                body,
              )
            : undefined,

        cache: "no-store",
      },
    );

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    redirect(
      "/login",
    );
  }

  if (!response.ok) {
    let message =
      "Une erreur est survenue.";

    try {
      const data =
        await response.json();

      if (
        typeof data.detail ===
        "string"
      ) {
        message =
          data.detail;
      }
    } catch {
      // RÃ©ponse non JSON.
    }

    throw new Error(
      message,
    );
  }

  return response.json();
}


export async function loginAction(
  formData: FormData,
) {
  const username =
    String(
      formData.get(
        "username",
      ) ?? "",
    ).trim();

  const password =
    String(
      formData.get(
        "password",
      ) ?? "",
    );

  const response =
    await fetch(
      `${API_URL}/owner/auth/login/`,
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
            username,
            password,
          }),

        cache: "no-store",
      },
    );

  if (!response.ok) {
    /*
     * Le détail backend n'est jamais reflété dans l'URL.
     * Le message reste volontairement générique.
     */
    redirect(
      "/login?error=Identifiants%20incorrects.",
    );
  }

  const data =
    await response.json();

  const cookieStore =
    await cookies();

  cookieStore.set(
    "sk_owner_token",
    data.token,
    {
      httpOnly: true,

      sameSite: "strict",

      secure:
        process.env.NODE_ENV
        === "production",

      path: "/",

      priority: "high",

      maxAge:
        60 * 60 * 12,
    },
  );

  redirect(
    "/",
  );
}


export async function logoutAction() {
  const token =
    await getToken();

  if (token) {
    try {
      await fetch(
        `${API_URL}/owner/auth/logout/`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Token ${token}`,

            Accept:
              "application/json",
          },

          cache: "no-store",
        },
      );
    } catch {
      // MÃªme si Django est indisponible,
      // on supprime le cookie local.
    }
  }

  const cookieStore =
    await cookies();

  cookieStore.delete(
    "sk_owner_token",
  );

  redirect(
    "/login",
  );
}


export async function updateOrderStatusAction(
  formData: FormData,
) {
  const id =
    String(
      formData.get(
        "order_id",
      ) ?? "",
    );

  const status =
    String(
      formData.get(
        "status",
      ) ?? "",
    );

  await postOwner(
    `/owner/orders/${id}/set-status/`,
    {
      status,
    },
  );

  revalidatePath(
    "/commandes",
  );

  revalidatePath(
    "/",
  );
}


export async function markPaymentPaidAction(
  formData: FormData,
) {
  const id =
    String(
      formData.get(
        "payment_id",
      ) ?? "",
    );

  await postOwner(
    `/owner/payments/${id}/mark-paid/`,
  );

  revalidatePath(
    "/paiements",
  );

  revalidatePath(
    "/commandes",
  );

  revalidatePath(
    "/",
  );
}


export async function toggleAdvertisementAction(
  formData: FormData,
) {
  const id =
    String(
      formData.get(
        "advertisement_id",
      ) ?? "",
    );

  await postOwner(
    `/owner/advertisements/${id}/toggle/`,
  );

  revalidatePath(
    "/publicites",
  );

  revalidatePath(
    "/",
  );
}
