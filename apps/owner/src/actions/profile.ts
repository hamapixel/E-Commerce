"use server";

import {
  cookies,
} from "next/headers";
import {
  revalidatePath,
} from "next/cache";


const API_URL =
  process.env.INTERNAL_API_URL ??
  "http://127.0.0.1:8000/api/v1";


export interface ProfileActionState {
  status:
    | "idle"
    | "success"
    | "error";
  message: string;
}


const INITIAL_STATE: ProfileActionState = {
  status: "idle",
  message: "",
};


async function getOwnerToken() {
  const cookieStore =
    await cookies();

  return (
    cookieStore.get(
      "sk_owner_token",
    )?.value ?? ""
  );
}


function extractMessage(
  data: unknown,
) {
  if (
    data
    && typeof data === "object"
  ) {
    const record = data as Record<
      string,
      unknown
    >;

    if (
      typeof record.detail ===
      "string"
    ) {
      return record.detail;
    }

    for (const value of Object.values(record)) {
      if (
        Array.isArray(value)
        && value.length
      ) {
        return String(value[0]);
      }

      if (
        typeof value === "string"
      ) {
        return value;
      }

      if (
        value
        && typeof value === "object"
      ) {
        const nested =
          Object.values(
            value as Record<string, unknown>,
          );

        if (
          Array.isArray(nested[0])
          && nested[0].length
        ) {
          return String(nested[0][0]);
        }
      }
    }
  }

  return "Une erreur est survenue.";
}


export async function updateOwnerProfileAction(
  _previousState: ProfileActionState = INITIAL_STATE,
  formData: FormData,
): Promise<ProfileActionState> {
  const token =
    await getOwnerToken();

  if (!token) {
    return {
      status: "error",
      message:
        "Votre session a expiré. Reconnectez-vous.",
    };
  }

  const payload = new FormData();

  for (
    const field
    of [
      "username",
      "first_name",
      "last_name",
      "email",
      "phone",
      "whatsapp",
    ]
  ) {
    payload.set(
      field,
      String(
        formData.get(field) ?? "",
      ).trim(),
    );
  }

  for (
    const field
    of [
      "profile_photo",
      "store_logo",
    ]
  ) {
    const file =
      formData.get(field);

    if (
      file instanceof File
      && file.size > 0
    ) {
      payload.set(
        field,
        file,
      );
    }
  }

  if (
    formData.get(
      "remove_profile_photo"
    )
  ) {
    payload.set(
      "remove_profile_photo",
      "true",
    );
  }

  if (
    formData.get(
      "remove_store_logo"
    )
  ) {
    payload.set(
      "remove_store_logo",
      "true",
    );
  }

  try {
    const response =
      await fetch(
        `${API_URL}/owner/auth/profile/`,
        {
          method: "PATCH",
          headers: {
            Authorization:
              `Token ${token}`,
            Accept:
              "application/json",
          },
          body: payload,
          cache: "no-store",
        },
      );

    const data: unknown =
      await response.json();

    if (!response.ok) {
      return {
        status: "error",
        message:
          extractMessage(data),
      };
    }

    revalidatePath(
      "/profil"
    );
    revalidatePath(
      "/",
      "layout",
    );

    return {
      status: "success",
      message:
        "Profil mis à jour avec succès.",
    };
  } catch {
    return {
      status: "error",
      message:
        "Impossible de mettre à jour le profil pour le moment.",
    };
  }
}


export async function changeOwnerPasswordAction(
  _previousState: ProfileActionState = INITIAL_STATE,
  formData: FormData,
): Promise<ProfileActionState> {
  const token =
    await getOwnerToken();

  if (!token) {
    return {
      status: "error",
      message:
        "Votre session a expiré. Reconnectez-vous.",
    };
  }

  const payload = {
    current_password:
      String(
        formData.get(
          "current_password",
        ) ?? "",
      ),
    new_password:
      String(
        formData.get(
          "new_password",
        ) ?? "",
      ),
    confirm_password:
      String(
        formData.get(
          "confirm_password",
        ) ?? "",
      ),
  };

  try {
    const response =
      await fetch(
        `${API_URL}/owner/auth/change-password/`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Token ${token}`,
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify(payload),
          cache: "no-store",
        },
      );

    const data =
      await response.json() as {
        token?: string;
        detail?: string;
      };

    if (!response.ok) {
      return {
        status: "error",
        message:
          extractMessage(data),
      };
    }

    if (!data.token) {
      return {
        status: "error",
        message:
          "Le mot de passe a été modifié, mais la session n'a pas pu être renouvelée.",
      };
    }

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

    return {
      status: "success",
      message:
        "Mot de passe modifié. Votre session sécurisée a été renouvelée.",
    };
  } catch {
    return {
      status: "error",
      message:
        "Impossible de modifier le mot de passe pour le moment.",
    };
  }
}
