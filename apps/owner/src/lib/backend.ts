import {
  cookies,
} from "next/headers";

import {
  redirect,
} from "next/navigation";


const API_URL =
  process.env.INTERNAL_API_URL ??
  "http://127.0.0.1:8000/api/v1";


// ============================================================
// EXTRACTION DES ERREURS API
// ============================================================

function extractApiError(
  data: unknown,
): string {
  if (
    typeof data === "string"
  ) {
    return data;
  }

  if (
    !data
    ||
    typeof data !== "object"
  ) {
    return "Erreur serveur.";
  }

  const record =
    data as Record<
      string,
      unknown
    >;

  if (
    typeof record.detail
    === "string"
  ) {
    return record.detail;
  }

  const messages: string[] = [];

  for (
    const [
      field,
      value,
    ]
    of Object.entries(
      record
    )
  ) {
    if (
      Array.isArray(
        value
      )
    ) {
      for (
        const item
        of value
      ) {
        messages.push(
          `${field}: ${String(item)}`
        );
      }

      continue;
    }

    if (
      typeof value
      === "string"
    ) {
      messages.push(
        `${field}: ${value}`
      );

      continue;
    }

    if (
      value
      &&
      typeof value
      === "object"
    ) {
      messages.push(
        `${field}: ${JSON.stringify(value)}`
      );

      continue;
    }

    messages.push(
      `${field}: ${String(value)}`
    );
  }

  if (
    messages.length
  ) {
    return messages.join(
      " | "
    );
  }

  return "Erreur serveur.";
}


// ============================================================
// DÉTECTION FORM DATA
// ============================================================

function isFormDataBody(
  body: BodyInit | null | undefined,
): body is FormData {
  if (!body) {
    return false;
  }

  // Cas normal.
  if (
    typeof FormData
    !== "undefined"
    &&
    body instanceof FormData
  ) {
    return true;
  }

  // Sécurité supplémentaire pour Next.js / Node.js.
  // Certains objets FormData peuvent provenir
  // d'un contexte différent et échouer au instanceof.
  return (
    Object.prototype.toString.call(
      body
    ) === "[object FormData]"
  );
}


// ============================================================
// FETCH OWNER
// ============================================================

export async function ownerFetch<T>(
  path: string,
  options:
    RequestInit = {},
): Promise<T> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      "sk_owner_token",
    )?.value;

  if (!token) {
    redirect(
      "/login",
    );
  }


  // ----------------------------------------------------------
  // HEADERS
  // ----------------------------------------------------------

  const headers =
    new Headers(
      options.headers,
    );

  headers.set(
    "Accept",
    "application/json",
  );

  headers.set(
    "Authorization",
    `Token ${token}`,
  );


  // ----------------------------------------------------------
  // CONTENT TYPE
  // ----------------------------------------------------------

  const body =
    options.body;

  const isFormData =
    isFormDataBody(
      body
    );

  /*
   * IMPORTANT :
   *
   * Quand le body est un FormData,
   * il ne faut JAMAIS définir Content-Type
   * manuellement.
   *
   * Node/Next doit générer automatiquement :
   *
   * multipart/form-data;
   * boundary=----------------...
   *
   * Sinon Django/DRF peut essayer de lire
   * une image PNG/JPEG comme du JSON.
   */

  if (isFormData) {
    headers.delete(
      "Content-Type",
    );
  }
  else if (
    typeof body === "string"
    &&
    !headers.has(
      "Content-Type",
    )
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }


  // ----------------------------------------------------------
  // REQUÊTE
  // ----------------------------------------------------------

  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        ...options,

        headers,

        cache:
          "no-store",
      },
    );


  // ----------------------------------------------------------
  // AUTHENTIFICATION
  // ----------------------------------------------------------

  if (
    response.status === 401
    ||
    response.status === 403
  ) {
    redirect(
      "/login",
    );
  }


  // ----------------------------------------------------------
  // ERREUR API
  // ----------------------------------------------------------

  if (!response.ok) {
    let message =
      `Erreur API ${response.status}.`;

    const contentType =
      response.headers.get(
        "content-type"
      ) ?? "";

    try {
      if (
        contentType.includes(
          "application/json"
        )
      ) {
        const data:
          unknown =
          await response.json();

        message =
          extractApiError(
            data
          );
      }
      else {
        const text =
          await response.text();

        if (text.trim()) {
          message =
            text.trim();
        }
      }
    }
    catch {
      message =
        `Erreur API ${response.status}.`;
    }

    console.error(
      `[SUGU KURA OWNER API] ${options.method ?? "GET"} ${path}`,
      {
        status:
          response.status,

        message,
      },
    );

    throw new Error(
      message
    );
  }


  // ----------------------------------------------------------
  // PAS DE CONTENU
  // ----------------------------------------------------------

  if (
    response.status ===
    204
  ) {
    return undefined as T;
  }


  // ----------------------------------------------------------
  // RÉPONSE JSON
  // ----------------------------------------------------------

  const contentType =
    response.headers.get(
      "content-type"
    ) ?? "";

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    return undefined as T;
  }

  return (
    await response.json()
  ) as T;
}