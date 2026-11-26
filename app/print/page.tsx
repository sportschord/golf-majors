"use client";

/**
 * Chrome-free print surface the shared engine captures. It renders the poster
 * at the exact A-series viewport for the requested size, then flips
 * `#print-page[data-ready="true"]` (with matching `data-page`/`data-size`) once
 * fonts have loaded and layout has settled — the handshake the engine polls for
 * before screenshotting. Reads options client-side from the URL to avoid Next
 * 16's async `searchParams`.
 */
import { useEffect, useState } from "react";
import { TimelinePoster } from "@/app/components/print/TimelinePoster";
import { getPrintGeometry, parsePrintOptions, type PrintOptions } from "@/lib/print/options";

export default function PrintPage() {
  const [options, setOptions] = useState<PrintOptions | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Client-only: read options from the URL once on mount (avoids Next 16's
    // async searchParams). setState-in-effect is the intended pattern for a
    // mount-time external read here.
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptions(parsePrintOptions(Object.fromEntries(params.entries())));
  }, []);

  useEffect(() => {
    if (!options) return;
    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setReady(true);
    };
    const fontsReady =
      typeof document !== "undefined" && document.fonts ? document.fonts.ready : Promise.resolve();
    // Flip data-ready once fonts have loaded. Deliberately NOT via
    // requestAnimationFrame: rAF is throttled in the occluded/headless context
    // the print engine captures in, which would stall the handshake. The
    // engine's own settleMs covers paint settling after this flips.
    fontsReady.then(markReady);
    // Fallback so a stalled document.fonts.ready can never hang the capture.
    const fallback = setTimeout(markReady, 1500);
    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, [options]);

  if (!options) return null;
  const geo = getPrintGeometry(options);

  return (
    <div
      id="print-page"
      data-ready={ready ? "true" : "false"}
      data-page={options.page}
      data-size={options.size}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: `${geo.cssWidth}px`,
        height: `${geo.cssHeight}px`,
        overflow: "hidden",
        background: "#070E08",
      }}
    >
      <TimelinePoster width={geo.cssWidth} height={geo.cssHeight} />
    </div>
  );
}
