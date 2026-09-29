import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  cookies,
} from "next/headers";


const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000/api/v1";


interface RouteContext {
  params: Promise<{
    id: string;
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
    return NextResponse.json(
      await response.json(),
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


async function getAccess(
  id: string,
) {
  const cookieStore =
    await cookies();

  return (
    cookieStore.get(
      `sugu-order-access-${id}`,
    )?.value ?? ""
  );
}


function missingAccess() {
  return NextResponse.json(
    {
      detail:
        "Vérifiez de nouveau la commande avant de donner votre avis.",
    },
    {
      status: 404,
    },
  );
}


export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  void request;

  const { id } =
    await context.params;

  const accessToken =
    await getAccess(id);

  if (!accessToken) {
    return missingAccess();
  }

  const response = await fetch(
    `${API_URL}/orders/${encodeURIComponent(id)}/satisfaction/`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-Order-Access-Token":
          accessToken,
      },
    },
  );

  return proxyResponse(response);
}


export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  const { id } =
    await context.params;

  const accessToken =
    await getAccess(id);

  if (!accessToken) {
    return missingAccess();
  }

  const body =
    await request.text();

  const response = await fetch(
    `${API_URL}/orders/${encodeURIComponent(id)}/satisfaction/`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/json",
        "X-Order-Access-Token":
          accessToken,
      },
      body,
    },
  );

  return proxyResponse(response);
}
