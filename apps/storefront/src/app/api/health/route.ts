import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      service: "SUGU KURA Storefront",
      status: "ok",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
