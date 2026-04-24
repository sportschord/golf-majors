'use client';

import { useMemo, useState } from 'react';
import { PLAYERS, FLAG, PLAYER_STATS, WINNERS, playerName, type MajorKey } from '@/lib/data';
import { MM, MK } from '@/lib/majors';
import { useIsMobile } from '@/app/hooks/useIsMobile';

const GY_MIN = 1856, GY_MAX = 2028, GY_SPAN = GY_MAX - GY_MIN;

const VW = 1160, ML = 88, MR = 16, MT = 36, MB = 28;
const ROW_H = 68, DOT_R = 5;
const PLOT_W = VW - ML - MR;
const SVG_H = MT + MK.length * ROW_H + MB;

function xOf(yr: number): number {
  return ML + (yr - GY_MIN) / GY_SPAN * PLOT_W;
}

const GRID_YRS: number[] = [];
for (let y = 1860; y <= 2026; y += 10) GRID_YRS.push(y);

interface GridWin { year: number; pkey: string; score: string | null; venue: string; note: string; }

interface GridViewProps {
  selectedPlayer: string | null;
  onSelect: (pkey: string | null) => void;
}

export function GridView({ selectedPlayer, onSelect }: GridViewProps) {
  const [hov, setHov] = useState<{ major: MajorKey; year: number } | null>(null);
  const isMobile = useIsMobile();

  const winsData = useMemo(() => {
    const out = { masters: [], pga: [], usopen: [], open: [] } as Record<MajorKey, GridWin[]>;
    MK.forEach(k => {
      out[k] = WINNERS[k].map(([yr, pk, sc, vn, nt]) => ({
        year: yr, pkey: pk, score: sc ?? null, venue: vn ?? '', note: nt ?? '',
      }));
    });
    return out;
  }, []);

  const hovWin = useMemo(() => {
    if (!hov) return null;
    return winsData[hov.major]?.find(w => w.year === hov.year) ?? null;
  }, [hov, winsData]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 12px' }}>
        <svg viewBox={`0 0 ${VW} ${SVG_H}`} style={{ width: '100%', display: 'block' }}>
          <defs>
            {MK.map(k => (
              <filter key={k} id={`gg-${k}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
          </defs>

          {GRID_YRS.map(yr => {
            const x = xOf(yr);
            const big = yr % 50 === 0;
            return (
              <g key={yr}>
                <line x1={x} y1={MT - 6} x2={x} y2={SVG_H - MB}
                  stroke={big ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'}
                  strokeWidth={big ? 1 : 0.7} />
                <text x={x} y={MT - 10} textAnchor="middle"
                  fill="#3E5E42" fillOpacity={big ? 0.9 : 0.55}
                  fontSize={big ? 9 : 7.5} fontFamily="Montserrat,sans-serif" fontWeight={big ? 700 : 400}>
                  {yr}
                </text>
              </g>
            );
          })}

          <line x1={xOf(2026)} y1={MT - 4} x2={xOf(2026)} y2={SVG_H - MB}
            stroke="#4A7C59" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 4" />
          <text x={xOf(2026)} y={SVG_H - MB + 14} textAnchor="middle"
            fill="#4A7C59" fontSize="7.5" fontFamily="Montserrat,sans-serif" fontWeight="700">NOW</text>

          {MK.map((k, ri) => {
            const m = MM[k];
            const cy = MT + ri * ROW_H + ROW_H / 2;

            return (
              <g key={k}>
                <line x1={ML} y1={cy} x2={VW - MR} y2={cy}
                  stroke={m.color} strokeOpacity="0.2" strokeWidth="1" />

                <text x={ML - 8} y={cy} textAnchor="end" dominantBaseline="middle"
                  fill={m.bright} fillOpacity="0.85"
                  fontSize="8" fontFamily="Montserrat,sans-serif" fontWeight="800" letterSpacing="1">
                  {m.short.toUpperCase()}
                </text>

                {winsData[k].map((win, i) => {
                  const x = xOf(win.year);
                  const isSel = selectedPlayer === win.pkey;
                  const isDim = !!selectedPlayer && !isSel;
                  const isHov = hov?.major === k && hov?.year === win.year;
                  const dr = isHov ? DOT_R + 2.5 : isSel ? DOT_R + 1.5 : DOT_R;

                  return (
                    <g key={i} style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHov({ major: k, year: win.year })}
                      onMouseLeave={() => setHov(null)}
                      onClick={() => onSelect(isSel ? null : win.pkey)}>
                      {isHov && <circle cx={x} cy={cy} r={DOT_R + 8} fill={m.color} fillOpacity="0.15" />}
                      {isSel && <circle cx={x} cy={cy} r={DOT_R + 5} fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.65" />}
                      <circle cx={x} cy={cy} r={dr}
                        fill={isDim ? '#1A2A1C' : (isHov ? m.bright : m.color)}
                        filter={isHov ? `url(#gg-${k})` : undefined}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          <line x1={ML} y1={MT} x2={ML} y2={SVG_H - MB} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </svg>
      </div>

      {hovWin && hov && (() => {
        const m = MM[hov.major];
        const p = PLAYERS[hovWin.pkey] || { name: '', country: '', era: '' };
        const ps = PLAYER_STATS[hovWin.pkey];
        const flag = FLAG[p.country] || '';
        return (
          <div style={isMobile ? {
            position: 'absolute', bottom: '8px', left: '10px', right: '10px',
            background: '#0B1A0C', border: `1px solid ${m.color}45`,
            borderRadius: '10px', padding: '10px 14px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.65)`,
            zIndex: 10, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
          } : {
            position: 'absolute', bottom: '24px', right: '28px',
            background: '#0B1A0C', border: `1px solid ${m.color}45`,
            borderRadius: '12px', padding: '16px 18px',
            boxShadow: `0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px ${m.color}20`,
            minWidth: '200px', zIndex: 10, pointerEvents: 'none',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,${m.color},${m.bright})`, borderRadius: '12px 12px 0 0' }} />
            <div style={{ fontSize: '7px', fontFamily: 'Montserrat,sans-serif', letterSpacing: '2px', color: m.bright, fontWeight: 700, marginBottom: '6px' }}>
              {m.name.toUpperCase()}
            </div>
            <div style={{ fontFamily: 'Playfair Display,Georgia,serif', fontWeight: 700, fontSize: '34px', color: 'white', lineHeight: 0.95, letterSpacing: '-1px', marginBottom: '10px' }}>
              {hovWin.year}
            </div>
            <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: '13px', color: 'white' }}>{playerName(hovWin.pkey)}</div>
            <div style={{ fontSize: '10px', color: '#5A7A5E', marginTop: '2px' }}>{flag} {p.era || ''}</div>
            {hovWin.score && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '20px', fontFamily: 'Montserrat,sans-serif', fontWeight: 900, color: m.bright }}>{hovWin.score}</span>
                <span style={{ fontSize: '7.5px', color: '#4A6A4E', letterSpacing: '1px', fontFamily: 'Montserrat,sans-serif' }}>TO PAR</span>
              </div>
            )}
            {hovWin.venue && <div style={{ fontSize: '9px', color: '#5A7A5E', marginTop: '4px', fontFamily: 'Exo 2,sans-serif' }}>{hovWin.venue}</div>}
            {ps && ps.total > 1 && (
              <div style={{ marginTop: '8px', fontSize: '8px', color: m.bright, fontFamily: 'Montserrat,sans-serif' }}>
                {ps.total} career majors
              </div>
            )}
          </div>
        );
      })()}

      {selectedPlayer && !hovWin && (() => {
        const ps = PLAYER_STATS[selectedPlayer];
        if (!ps) return null;
        return (
          <div style={{
            position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
            background: '#0B1A0C', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '6px 14px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '9px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, color: 'white' }}>
              {playerName(selectedPlayer)}
            </span>
            {MK.map(k => ps[k] > 0 && (
              <span key={k} style={{
                fontSize: '7.5px', fontFamily: 'Montserrat,sans-serif', fontWeight: 600,
                padding: '2px 6px', borderRadius: '4px',
                background: `${MM[k].color}30`, color: MM[k].bright,
              }}>
                {ps[k]}× {MM[k].short}
              </span>
            ))}
            <button onClick={() => onSelect(null)} style={{
              background: 'none', border: 'none', color: '#4A6A4E', cursor: 'pointer',
              fontSize: '13px', lineHeight: 1, padding: '0 2px',
            }}>×</button>
          </div>
        );
      })()}
    </div>
  );
}
