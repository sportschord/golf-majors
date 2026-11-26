import { NextResponse, type NextRequest } from "next/server";
import { printAuth } from "@/lib/print/pipeline.server";

export const dynamic = "force-dynamic";

/**
 * GET /api/print-auth?token=<PRINT_EXPORT_TOKEN> — sets the HTTP-only print
 * cookie once per browser so the Print Studio UI's same-origin fetches to
 * /api/generate-print pass the gate. No-op while PRINT_EXPORT_TOKEN is unset.
 */
export async function GET(request: NextRequest) {
  const token = (new URL(request.url).searchParams.get("token") ?? "").trim();
  const expected = printAuth.getPrintExportToken();

  if (!expected) {
    return NextResponse.json({
      ok: true,
      message: "PRINT_EXPORT_TOKEN is not set; the print gate is currently open.",
    });
  }
  if (token !== expected) {
    return NextResponse.json(printAuth.UNAUTHORIZED_PRINT_BODY, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, message: "Print authorization cookie set." });
  response.cookies.set(printAuth.PRINT_AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return response;
}
