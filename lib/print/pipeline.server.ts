/**
 * Thin adapter over the shared print engine. Golf injects three seams — the
 * print-page path + geometry, the data-ready dataset, and (future) the Drive
 * target — and the package owns browser launch, the data-ready render loop,
 * the >8192px slice-and-stitch PNG codec, and Drive upload.
 *
 * Render-only today: `renderGolfSnapshot` returns the PNG/PDF buffer. Drive
 * upload is intentionally not called yet (golf's Vercel project has no
 * GOOGLE_* creds); `buildDriveTarget` + `uploadToDrive` make wiring it a
 * one-line addition once those land.
 */
import {
  renderSnapshot,
  createPrintAuth,
  type RenderSpec,
  type RenderedPrint,
} from "@sportschord/print-pipeline";
import {
  parsePrintOptions,
  getPrintGeometry,
  buildPrintPagePath,
  buildPrintFileName,
  type PrintOptions,
} from "./options";

/** Shared-secret gate. Opt-in: while PRINT_EXPORT_TOKEN is unset, it allows all. */
export const printAuth = createPrintAuth("golf_print_token");

function toRenderSpec(options: PrintOptions): RenderSpec {
  return {
    pagePath: buildPrintPagePath(options),
    geometry: getPrintGeometry(options),
    expectedDataset: { page: options.page, size: options.size },
    format: options.format,
    fileName: buildPrintFileName(options),
    settleMs: 300, // pure-SVG poster — no map tiles to wait on
  };
}

export async function renderGolfSnapshot(
  request: Request,
  source: Record<string, string | undefined>,
): Promise<RenderedPrint> {
  return renderSnapshot(request, toRenderSpec(parsePrintOptions(source)));
}
