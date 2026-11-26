import { NextResponse, type NextRequest } from "next/server";
import { printAuth, renderGolfSnapshot } from "@/lib/print/pipeline.server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * GET/POST /api/generate-print → render the golf timeline poster headlessly and
 * return the PNG/PDF. Render-only: no Google Drive upload yet.
 *
 * GET reads options from the query string; POST reads a JSON body. The shared
 * gate is open until PRINT_EXPORT_TOKEN is set (see lib/print/pipeline.server).
 */
async function handle(request: NextRequest, source: Record<string, string | undefined>) {
  if (!printAuth.isAuthorizedPrintRequest(request)) {
    return NextResponse.json(printAuth.UNAUTHORIZED_PRINT_BODY, { status: 401 });
  }

  try {
    const rendered = await renderGolfSnapshot(request, source);
    return new NextResponse(Buffer.from(rendered.output), {
      headers: {
        "Content-Type": rendered.contentType,
        "Content-Disposition": `attachment; filename="${rendered.fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Golf print generation error:", message);
    return NextResponse.json(
      { error: "Failed to generate print", message },
      { status: message.includes("not available") ? 501 : 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return handle(request, Object.fromEntries(searchParams.entries()));
}

export async function POST(request: NextRequest) {
  let body: Record<string, string | undefined> = {};
  try {
    body = (await request.json()) as Record<string, string | undefined>;
  } catch {
    body = {};
  }
  return handle(request, body);
}
