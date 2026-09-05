import { NextResponse } from "next/server";


const API_URL =
  process.env.INTERNAL_API_URL ??
  "http://127.0.0.1:8000/api/v1";

const API_ORIGIN =
  new URL(
    API_URL,
  ).origin;


interface RouteContext {
  params: Promise<{
    path: string[];
  }>;
}


export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const {
      path,
    } = await context.params;

    if (
      !path.length ||
      path.some(
        (
          segment,
        ) =>
          segment === ".." ||
          segment.includes(
            "\\",
          ),
      )
    ) {
      return NextResponse.json(
        {
          detail:
            "Chemin média invalide.",
        },
        {
          status: 400,
        },
      );
    }

    const mediaPath =
      path
        .map(
          (
            segment,
          ) =>
            encodeURIComponent(
              segment,
            ),
        )
        .join(
          "/",
        );

    const response =
      await fetch(
        `${API_ORIGIN}/media/${mediaPath}`,
        {
          cache: "no-store",
        },
      );

    if (
      !response.ok
    ) {
      return NextResponse.json(
        {
          detail:
            "Image introuvable.",
        },
        {
          status:
            response.status,
        },
      );
    }

    const body =
      await response.arrayBuffer();

    return new NextResponse(
      body,
      {
        status: 200,
        headers: {
          "Content-Type":
            response.headers.get(
              "content-type",
            ) ??
            "application/octet-stream",
          "Cache-Control":
            "public, max-age=3600",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        detail:
          "Impossible de charger cette image.",
      },
      {
        status: 502,
      },
    );
  }
}
