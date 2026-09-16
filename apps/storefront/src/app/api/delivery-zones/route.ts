import { NextResponse } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL ??
  "http://127.0.0.1:8000/api/v1";


export async function GET() {
  try {
    const response = await fetch(
      `${API_URL}/checkout/delivery-zones/`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const text = await response.text();

    return new NextResponse(
      text,
      {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get(
              "content-type",
            ) ??
            "application/json",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        detail:
          "Les zones de livraison sont momentanément indisponibles.",
      },
      {
        status: 502,
      },
    );
  }
}
