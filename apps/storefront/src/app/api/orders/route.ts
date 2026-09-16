import { NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL ??
  "http://127.0.0.1:8000/api/v1";

const ORDER_ACCESS_MAX_AGE =
  60 * 60 * 24 * 90;

function orderCookieName(id: string) {
  return `sugu-order-access-${id}`;
}

export async function POST(
  request: Request,
) {
  try {
    const body = await request.text();

    const response = await fetch(
      `${API_URL}/orders/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body,
        cache: "no-store",
      },
    );

    const text = await response.text();

    if (!response.ok) {
      return new NextResponse(text, {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("content-type") ??
            "application/json",
        },
      });
    }

    const data = JSON.parse(text) as {
      id?: string;
      access_token?: string;
      [key: string]: unknown;
    };

    const accessToken =
      typeof data.access_token === "string"
        ? data.access_token
        : "";

    const orderId =
      typeof data.id === "string"
        ? data.id
        : "";

    delete data.access_token;

    const nextResponse =
      NextResponse.json(
        data,
        {
          status: response.status,
        },
      );

    if (orderId && accessToken) {
      nextResponse.cookies.set(
        orderCookieName(orderId),
        accessToken,
        {
          httpOnly: true,
          sameSite: "lax",
          secure:
            process.env.NODE_ENV ===
            "production",
          path: "/",
          maxAge:
            ORDER_ACCESS_MAX_AGE,
        },
      );
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      {
        detail:
          "Le serveur de commande est momentanément indisponible.",
      },
      {
        status: 502,
      },
    );
  }
}
