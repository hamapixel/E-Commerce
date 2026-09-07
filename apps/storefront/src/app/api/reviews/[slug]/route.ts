import {
  NextRequest,
  NextResponse,
} from "next/server";


const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api/v1";


interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}


async function proxyResponse(
  response: Response,
) {
  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    const data =
      await response.json();

    return NextResponse.json(
      data,
      {
        status: response.status,
      },
    );
  }

  return new NextResponse(
    await response.text(),
    {
      status: response.status,
    },
  );
}


export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  void request;

  const {
    slug,
  } = await context.params;

  const response =
    await fetch(
      `${API_URL}/reviews/products/${encodeURIComponent(slug)}/`,
      {
        cache: "no-store",
        headers: {
          Accept:
            "application/json",
        },
      },
    );

  return proxyResponse(
    response,
  );
}


export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const {
    slug,
  } = await context.params;

  const payload =
    await request.json();

  const response =
    await fetch(
      `${API_URL}/reviews/products/${encodeURIComponent(slug)}/`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept:
            "application/json",
          "Content-Type":
            "application/json",
        },
        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  return proxyResponse(
    response,
  );
}
