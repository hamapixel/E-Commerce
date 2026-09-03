import { NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL ??
  "http://127.0.0.1:8000/api/v1";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const response = await fetch(
      `${API_URL}/checkout/sessions/${encodeURIComponent(id)}/`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
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
          "Impossible d'annuler la réservation pour le moment.",
      },
      {
        status: 502,
      },
    );
  }
}
