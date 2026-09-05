import { NextResponse } from "next/server";


const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api/v1";


export async function GET(
  request: Request,
) {
  const url =
    new URL(request.url);

  const query =
    url.searchParams
      .get("q")
      ?.trim() ?? "";

  if (!query) {
    return NextResponse.json({
      count: 0,
      results: [],
    });
  }

  const params =
    new URLSearchParams({
      search: query,
      page: "1",
      page_size: "6",
      ordering: "-created_at",
    });

  try {
    const response = await fetch(
      `${API_URL}/catalog/products/?${params.toString()}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          detail:
            "Recherche indisponible pour le moment.",
        },
        {
          status: response.status,
        },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        detail:
          "Impossible de rechercher les produits.",
      },
      {
        status: 502,
      },
    );
  }
}
