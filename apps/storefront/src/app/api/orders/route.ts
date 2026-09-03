import { NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL ??
  "http://127.0.0.1:8000/api/v1";

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

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ??
          "application/json",
      },
    });
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
