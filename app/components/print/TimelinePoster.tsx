/**
 * A-series print poster for the golf majors radial timeline — a single,
 * resolution-independent SVG (viewBox 1240×1754, √2 / A-series ratio) so it
 * captures crisply at any size. It reuses the same geometry helpers and data as
 * the interactive RadialView, but renders a static, non-interactive composition
 * (no hover affordances) with an editorial title block + champions leaderboard.
 *
 * First-pass layout — the hero is the radial; title/legend/leaderboard are
 * supporting. Refine freely; nothing here is load-bearing beyond the #print-page
 * data-ready contract owned by app/print/page.tsx.
 */
import { WINNERS, PLAYERS, TOP_PLAYERS, FLAG, playerName } from "@/lib/data";
import { MM, MK, FOUNDED, RADII, DECADE_TICKS, toAngle, polar, arcPathD } from "@/lib/majors";

const MONT = "Montserrat, sans-serif";
const SERIF = "'Playfair Display', Georgia, serif";

// Native radial canvas (matches RadialView's ConcentricRings).
const CX = 400;
const CY = 340;
const NOW = 2026;

interface TimelinePosterProps {
  width: number;
  height: number;
}

export function TimelinePoster({ width, height }: TimelinePosterProps) {
  const nowA = toAngle(NOW);

  return (
    <svg
      viewBox="0 0 1240 1754"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <rect x={0} y={0} width={1240} height={1754} fill="#070E08" />

      {/* ---- Title block -------------------------------------------------- */}
      <text x={620} y={150} textAnchor="middle" fill="#3A6A3E" fontFamily={MONT} fontWeight={700}
        fontSize={18} letterSpacing={9}>SPORTSCHORD · GOLF</text>
      <text x={620} y={210} textAnchor="middle" fill="#5A7A5E" fontFamily={MONT} fontWeight={600}
        fontSize={22} letterSpacing={7}>A VISUAL HISTORY OF</text>
      <text x={620} y={296} textAnchor="middle" fill="#FFFFFF" fontFamily={MONT} fontWeight={900}
        fontSize={74} letterSpacing={5}>GOLF MAJORS</text>
      <line x1={520} y1={332} x2={720} y2={332} stroke="#2A4A2E" strokeWidth={1.5} />

      {/* ---- Radial hero -------------------------------------------------- */}
      <g transform="translate(68,346) scale(1.38)">
        {/* faint full rings */}
        {[...MK].reverse().map((k) => (
          <circle key={`ring-${k}`} cx={CX} cy={CY} r={RADII[k]} fill="none"
            stroke={MM[k].color} strokeOpacity={0.14} strokeWidth={1.5} />
        ))}

        {/* decade ticks + year labels */}
        {DECADE_TICKS.map((yr) => {
          const a = toAngle(yr);
          const [ox, oy] = polar(CX, CY, RADII.open + 28, a);
          const [ix, iy] = polar(CX, CY, RADII.masters - 18, a);
          const [lx, ly] = polar(CX, CY, RADII.open + 42, a);
          const big = yr % 100 === 0;
          return (
            <g key={`tick-${yr}`}>
              <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="#2A4A2E"
                strokeOpacity={big ? 0.6 : 0.35} strokeWidth={big ? 1.2 : 0.8} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fill="#4A6A4E" fillOpacity={big ? 0.85 : 0.55} fontSize={big ? 9 : 7.5}
                fontFamily={MONT} fontWeight={big ? 700 : 400}>{yr}</text>
            </g>
          );
        })}

        {/* 2026 "now" marker */}
        {(() => {
          const [ox, oy] = polar(CX, CY, RADII.open + 16, nowA);
          const [ix, iy] = polar(CX, CY, RADII.masters - 10, nowA);
          return <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="#4A7C59"
            strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="3 3" />;
        })()}

        {/* active arcs (founded → 2026) + ring name labels */}
        <defs>
          {MK.map((k) => (
            <path key={`arc-${k}`} id={`poster-ring-arc-${k}`}
              d={arcPathD(CX, CY, RADII[k] - 18, Math.PI * 0.15, Math.PI * 0.85)} />
          ))}
        </defs>
        {MK.map((k) => {
          const R = RADII[k];
          const m = MM[k];
          const foundedA = toAngle(FOUNDED[k]);
          const [fx, fy] = polar(CX, CY, R, foundedA);
          return (
            <g key={`active-${k}`}>
              <path d={arcPathD(CX, CY, R, foundedA, nowA)} fill="none"
                stroke={m.color} strokeOpacity={0.4} strokeWidth={2} />
              <circle cx={fx} cy={fy} r={3} fill={m.bright} fillOpacity={0.7} />
              <text fontSize={7.5} fontFamily={MONT} fontWeight={700} letterSpacing={3}
                fill={m.bright} fillOpacity={0.45}>
                <textPath href={`#poster-ring-arc-${k}`} startOffset="50%" textAnchor="middle">
                  {m.name.toUpperCase()}
                </textPath>
              </text>
            </g>
          );
        })}

        {/* win dots — every major championship, 1860→2026 */}
        {MK.flatMap((k) =>
          WINNERS[k].map(([year], i) => {
            const [px, py] = polar(CX, CY, RADII[k], toAngle(year));
            return <circle key={`dot-${k}-${i}`} cx={px} cy={py} r={4.5} fill={MM[k].color} />;
          }),
        )}

        {/* center mark */}
        <text x={CX} y={CY - 4} textAnchor="middle" fill="#FFFFFF" fillOpacity={0.1}
          fontSize={11} fontFamily={MONT} fontWeight={700} letterSpacing={3}>1860</text>
        <text x={CX} y={CY + 14} textAnchor="middle" fill="#FFFFFF" fillOpacity={0.1}
          fontSize={11} fontFamily={MONT} fontWeight={700} letterSpacing={3}>2026</text>
      </g>

      {/* ---- Majors legend ------------------------------------------------ */}
      {(() => {
        const gap = 270;
        const startX = 620 - (gap * (MK.length - 1)) / 2;
        return MK.map((k, i) => {
          const x = startX + i * gap;
          return (
            <g key={`legend-${k}`} transform={`translate(${x},1322)`}>
              <circle cx={-92} cy={-4} r={6} fill={MM[k].bright} />
              <text x={-78} y={0} fill="#9CB89E" fontFamily={MONT} fontWeight={600}
                fontSize={17} letterSpacing={1}>{MM[k].name}</text>
            </g>
          );
        });
      })()}

      {/* ---- Champions leaderboard --------------------------------------- */}
      <text x={620} y={1418} textAnchor="middle" fill="#4A6A4E" fontFamily={MONT} fontWeight={700}
        fontSize={15} letterSpacing={5}>MOST MAJOR TITLES</text>
      {TOP_PLAYERS.slice(0, 8).map((ps, idx) => {
        const col = idx < 4 ? 0 : 1;
        const row = idx % 4;
        const colX = col === 0 ? 175 : 695;
        const colRight = col === 0 ? 605 : 1125;
        const y = 1478 + row * 62;
        const country = PLAYERS[ps.pkey]?.country ?? "";
        const flag = FLAG[country] ?? "";
        return (
          <g key={`champ-${ps.pkey}`}>
            <text x={colX} y={y} fill="#2E4A30" fontFamily={MONT} fontWeight={700} fontSize={20}
              textAnchor="end">{idx + 1}</text>
            <text x={colX + 22} y={y} fill="#D8E8D8" fontFamily={MONT} fontWeight={700} fontSize={23}>
              {flag ? `${flag}  ` : ""}{playerName(ps.pkey)}
            </text>
            <text x={colRight} y={y} textAnchor="end" fill="#FFFFFF" fontFamily={SERIF}
              fontWeight={700} fontSize={30}>{ps.total}</text>
            <line x1={colX - 18} y1={y + 18} x2={colRight} y2={y + 18}
              stroke="#142016" strokeWidth={1} />
          </g>
        );
      })}

      {/* ---- Footer ------------------------------------------------------- */}
      <text x={620} y={1712} textAnchor="middle" fill="#3A5A3E" fontFamily={MONT} fontWeight={600}
        fontSize={13} letterSpacing={4}>
        THE MASTERS · PGA CHAMPIONSHIP · U.S. OPEN · THE OPEN CHAMPIONSHIP
      </text>
    </svg>
  );
}
