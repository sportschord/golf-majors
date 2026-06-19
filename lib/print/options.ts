/**
 * Golf print domain logic — the app-specific seam the shared
 * `@sportschord/print-pipeline` engine renders against. Mirrors the f1app /
 * Tennis pattern: the app owns its page taxonomy, A-series geometry, file
 * naming, and (future) Drive folder tree; the package owns the engine.
 */

export type PrintPage = "timeline";
export type PrintFormat = "png" | "pdf";

export interface PrintOptions {
  page: PrintPage;
  size: string;
  format: PrintFormat;
}

export interface PrintSizePreset {
  id: string;
  label: string;
  widthMm: number;
  heightMm: number;
  /** CSS-pixel viewport the /print page renders at (portrait A-series). */
  viewportWidth: number;
  viewportHeight: number;
}

export const DEFAULT_PRINT_SIZE = "a1";

// Portrait A-series presets (the golf timeline poster is portrait). Viewport
// pixels match f1app's so 300-DPI output lands at the same physical scale.
export const PRINT_SIZE_PRESETS: PrintSizePreset[] = [
  { id: "a1", label: "A1", widthMm: 594, heightMm: 841, viewportWidth: 2100, viewportHeight: 2972 },
  { id: "a2", label: "A2", widthMm: 420, heightMm: 594, viewportWidth: 1486, viewportHeight: 2100 },
  { id: "a3", label: "A3", widthMm: 297, heightMm: 420, viewportWidth: 1050, viewportHeight: 1486 },
];

const PRINT_PAGES: PrintPage[] = ["timeline"];

export function getPrintSizePreset(id: string = DEFAULT_PRINT_SIZE): PrintSizePreset {
  return (
    PRINT_SIZE_PRESETS.find((preset) => preset.id === id) ??
    PRINT_SIZE_PRESETS.find((preset) => preset.id === DEFAULT_PRINT_SIZE)!
  );
}

export function parsePrintOptions(source: Record<string, string | undefined> = {}): PrintOptions {
  const page = PRINT_PAGES.includes(source.page as PrintPage)
    ? (source.page as PrintPage)
    : "timeline";
  const size = PRINT_SIZE_PRESETS.some((preset) => preset.id === source.size)
    ? (source.size as string)
    : DEFAULT_PRINT_SIZE;
  const format: PrintFormat = source.format === "pdf" ? "pdf" : "png";
  return { page, size, format };
}

export interface PrintGeometry {
  cssWidth: number;
  cssHeight: number;
  deviceScaleFactor: number;
  widthMm: number;
  heightMm: number;
}

export function getPrintGeometry(options: PrintOptions): PrintGeometry {
  const preset = getPrintSizePreset(options.size);
  return {
    cssWidth: preset.viewportWidth,
    cssHeight: preset.viewportHeight,
    deviceScaleFactor: options.format === "png" ? 2 : 1,
    widthMm: preset.widthMm,
    heightMm: preset.heightMm,
  };
}

/** Path of the chrome-free print page the engine captures. */
export function buildPrintPagePath(options: PrintOptions): string {
  const params = new URLSearchParams({
    page: options.page,
    size: options.size,
    format: options.format,
  });
  return `/print?${params.toString()}`;
}

function isoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Download / display file name for the rendered poster. */
export function buildPrintFileName(options: PrintOptions): string {
  return `golf-${options.page}_${options.size}_${isoDate()}.${options.format}`;
}

// --- Drive taxonomy (wired but unused until Drive creds land in Vercel) ------
// All golf output lives under a single "Golf" category in the shared Import
// Drive, mirroring f1app's "F1" / Tennis's "Tennis" top-level folders.
const DRIVE_TOP_CATEGORY = "Golf";

const PAGE_DRIVE_DESTINATION: Record<PrintPage, { category: string; design: string }> = {
  timeline: { category: "Visual History", design: "A Visual History of Golf Majors" },
};

function driveAspectRatio(size: string): string | null {
  return /^a[0-5]$/.test(size) ? "A" : null;
}

/** Where a rendered golf poster would land in the shared Import Drive. */
export function buildDriveTarget(options: PrintOptions): { folderPath: string[]; fileName: string } {
  const aspectRatio = driveAspectRatio(options.size);
  if (!aspectRatio) {
    throw new Error(`Golf Drive uploads support A-ratio assets; received '${options.size}'.`);
  }
  const dest = PAGE_DRIVE_DESTINATION[options.page];
  return {
    folderPath: [DRIVE_TOP_CATEGORY, dest.category, dest.design],
    fileName: `${aspectRatio}.${options.format}`,
  };
}
