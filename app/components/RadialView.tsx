'use client';

import { useMemo } from 'react';
import { PLAYER_STATS, PLAYERS, TOP_PLAYERS, FLAG, WINNERS, playerName, type MajorKey, type Win } from '@/lib/data';
import { MM, MK, FOUNDED, RADII, DECADE_TICKS, toAngle, polar, arcPathD } from '@/lib/majors';

interface WinsByMajor { masters: Win[]; pga: Win[]; usopen: Win[]; open: Win[]; }

interface ConcentricRingsProps {
  wins: WinsByMajor;
  selectedPlayer: string | null;
  hoveredWin: Win | null;
  onHover: (win: Win | null) => void;
  onSelect: (pkey: string | null) => void;
}

function ConcentricRings({ wins, selectedPlayer, hoveredWin, onHover, onSelect }: ConcentricRingsProps) {
  const VW = 800, VH = 680, cx = VW / 2, cy = VH / 2;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
      <defs>
        {MK.map(k => (
          <filter key={k} id={`gl2-${k}`} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        ))}
        {MK.map(k => (
          <radialGradient key={k} id={`rg2-${k}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={MM[k].color} stopOpacity="0.04" />
            <stop offset="100%" stopColor={MM[k].color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {[...MK].reverse().map(k => (
        <circle key={k} cx={cx} cy={cy} r={RADII[k] + 4} fill={`url(#rg2-${k})`} />
      ))}

      {DECADE_TICKS.map(yr => {
        const a = toAngle(yr);
        const [ox, oy] = polar(cx, cy, RADII.open + 28, a);
        const [ix, iy] = polar(cx, cy, RADII.masters - 18, a);
        const [lx, ly] = polar(cx, cy, RADII.open + 42, a);
        const big = yr % 100 === 0;
        return (
          <g key={yr}>
            <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="#2A4A2E" strokeOpacity={big ? 0.6 : 0.35} strokeWidth={big ? 1.2 : 0.8} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fill="#4A6A4E" fillOpacity={big ? 0.8 : 0.5} fontSize={big ? 9 : 7.5}
              fontFamily="Montserrat,sans-serif" fontWeight={big ? 700 : 400}>
              {yr}
            </text>
          </g>
        );
      })}

      {(() => {
        const a = toAngle(2026);
        const [ox, oy] = polar(cx, cy, RADII.open + 16, a);
        const [ix, iy] = polar(cx, cy, RADII.masters - 10, a);
        return <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="#4A7C59" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="3 3" />;
      })()}

      {MK.map(k => {
        const R = RADII[k];
        const m = MM[k];
        const foundedA = toAngle(FOUNDED[k]);
        const nowA = toAngle(2026);
        const activeD = arcPathD(cx, cy, R, foundedA, nowA);
        const labelR = R - 18;
        const arcLabelD = arcPathD(cx, cy, labelR, Math.PI * 0.15, Math.PI * 0.85);
        const arcId = `ring-label-arc-${k}`;
        const [fx, fy] = polar(cx, cy, R, foundedA);

        return (
          <g key={k}>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={m.color} strokeOpacity="0.12" strokeWidth="1.5" />
            <path d={activeD} fill="none" stroke={m.color} strokeOpacity="0.35" strokeWidth="2" />
            <circle cx={fx} cy={fy} r={3} fill={m.bright} fillOpacity="0.6" />
            <defs>
              <path id={arcId} d={arcLabelD} />
            </defs>
            <text fontSize="7.5" fontFamily="Montserrat,sans-serif" fontWeight="700" letterSpacing="3" fill={m.bright} fillOpacity="0.4">
              <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                {m.name.toUpperCase()}
              </textPath>
            </text>
          </g>
        );
      })}

      {[false, true].flatMap(bright =>
        MK.flatMap(k => {
          const R = RADII[k];
          const m = MM[k];
          return (wins[k] || []).map((win, i) => {
            const a = toAngle(win.year);
            const [px, py] = polar(cx, cy, R, a);
            const isHov = hoveredWin?.year === win.year && hoveredWin?.major === k;
            const isSel = selectedPlayer === win.pkey;
            const isDim = !!selectedPlayer && !isSel;
            const isBright = !isDim;
            if (bright !== isBright) return null;
            const dr = isHov ? 7 : isSel ? 6.5 : 4.5;
            return (
              <g key={`${k}-${i}`} style={{ cursor: 'pointer' }}
                onMouseEnter={() => onHover({ ...win, major: k })}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(isSel ? null : win.pkey)}>
                {isHov && <>
                  <circle cx={px} cy={py} r={16} fill={m.glow} />
                  <circle cx={px} cy={py} r={10} fill={m.color} fillOpacity="0.2" />
                </>}
                {isSel && <circle cx={px} cy={py} r={11} fill="none" stroke="white" strokeWidth="1.8" strokeOpacity="0.75" />}
                <circle cx={px} cy={py} r={dr}
                  fill={isDim ? '#1A2A1C' : (isHov ? m.bright : m.color)}
                  filter={isHov ? `url(#gl2-${k})` : undefined}
                />
              </g>
            );
          }).filter(Boolean);
        })
      )}

      <text x={cx} y={cy - 12} textAnchor="middle" fill="white" fillOpacity="0.12" fontSize="9" fontFamily="Montserrat,sans-serif" letterSpacing="2">HOVER A DOT</text>
      <text x={cx} y={cy + 6}  textAnchor="middle" fill="white" fillOpacity="0.08" fontSize="9" fontFamily="Montserrat,sans-serif" letterSpacing="2">TO EXPLORE</text>
    </svg>
  );
}

interface CenterPanelProps {
  hoveredWin: Win | null;
  selectedPlayer: string | null;
  onSelect: (pkey: string | null) => void;
  showTable: boolean;
}

function CenterPanel({ hoveredWin, selectedPlayer, onSelect, showTable }: CenterPanelProps) {
  const card: React.CSSProperties = {
    background: '#0B1A0C', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', padding: '24px 20px', height: '100%',
    display: 'flex', flexDirection: 'column', gap: '14px',
    overflow: 'hidden', position: 'relative',
  };
  const eye: React.CSSProperties = {
    fontSize: '7.5px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700,
    letterSpacing: '2.5px', color: '#4A6A4E',
  };

  if (hoveredWin) {
    const m = MM[hoveredWin.major];
    const p = PLAYERS[hoveredWin.pkey] || { name: '', country: '', era: '' };
    const ps = PLAYER_STATS[hoveredWin.pkey];
    const flag = FLAG[p.country] || '';
    return (
      <div style={card}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${m.color}, ${m.bright})`, borderRadius: '16px 16px 0 0' }} />
        <div style={{ ...eye, color: m.bright, marginTop: '4px' }}>{m.name.toUpperCase()}</div>

        <div style={{ fontFamily: 'Playfair Display,Georgia,serif', fontWeight: 700, fontSize: '62px', color: 'white', lineHeight: 0.9, letterSpacing: '-2px' }}>
          {hoveredWin.year}
        </div>

        <div style={{ borderTop: `1px solid ${m.color}30`, paddingTop: '12px' }}>
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: '14px', color: 'white', lineHeight: 1.3 }}>
            {playerName(hoveredWin.pkey)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
            {flag && <span style={{ fontSize: '18px' }}>{flag}</span>}
            <span style={{ fontSize: '9px', color: '#5A7A5E', fontFamily: 'Exo 2,sans-serif' }}>{p.era || ''}</span>
          </div>
        </div>

        {hoveredWin.score && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 900, fontSize: '28px', color: m.bright, lineHeight: 1 }}>{hoveredWin.score}</span>
            <span style={{ fontSize: '7.5px', color: '#4A6A4E', letterSpacing: '1.5px', fontFamily: 'Montserrat,sans-serif' }}>TO PAR</span>
          </div>
        )}
        {hoveredWin.venue && <div style={{ fontSize: '10px', color: '#6A8A6E', fontFamily: 'Exo 2,sans-serif' }}>{hoveredWin.venue}</div>}
        {hoveredWin.note && (
          <div style={{ fontSize: '9px', color: '#4A5E4A', fontStyle: 'italic', fontFamily: 'Exo 2,sans-serif', lineHeight: 1.5, marginTop: '2px' }}>{hoveredWin.note}</div>
        )}

        {ps && (
          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
            <div style={{ ...eye, marginBottom: '7px' }}>CAREER MAJORS</div>
            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
              {MK.map(k => ps[k] > 0 && (
                <div key={k} style={{
                  fontSize: '7.5px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700,
                  padding: '2px 7px', borderRadius: '4px',
                  background: `${MM[k].color}25`, color: MM[k].bright, border: `1px solid ${MM[k].color}35`,
                }}>
                  {ps[k]}× {MM[k].short}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedPlayer) {
    const ps = PLAYER_STATS[selectedPlayer];
    const p = PLAYERS[selectedPlayer] || { name: '', country: '', era: '' };
    const flag = FLAG[p.country] || '';
    if (!ps) return <div style={card} />;
    const domMajor: MajorKey = MK.reduce<MajorKey>((b, k) => ps[k] > (ps[b] || 0) ? k : b, 'masters');
    const dm = MM[domMajor];
    return (
      <div style={card}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${dm.color}, ${dm.bright})`, borderRadius: '16px 16px 0 0' }} />
        <div style={{ ...eye, marginTop: '4px' }}>PLAYER PROFILE</div>
        <div>
          <div style={{ fontFamily: 'Montserrat,sans-serif', fontWeight: 700, fontSize: '13px', color: 'white', lineHeight: 1.3 }}>{playerName(selectedPlayer)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            {flag && <span style={{ fontSize: '15px' }}>{flag}</span>}
            <span style={{ fontSize: '9px', color: '#5A7A5E', fontFamily: 'Exo 2,sans-serif' }}>{p.era || ''}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: 'Playfair Display,Georgia,serif', fontWeight: 700, fontSize: '52px', color: 'white', lineHeight: 0.9 }}>{ps.total}</span>
          <span style={{ fontSize: '9px', color: '#4A6A4E', letterSpacing: '1.5px', fontFamily: 'Montserrat,sans-serif' }}>MAJOR{ps.total !== 1 ? 'S' : ''}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {MK.map(k => {
            const cnt = ps[k]; if (!cnt) return null;
            const mm = MM[k];
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: mm.bright, flexShrink: 0 }} />
                <div style={{ fontSize: '8px', fontFamily: 'Montserrat,sans-serif', color: '#6A8A6E', width: '55px' }}>{mm.short}</div>
                <div style={{ flex: 1, height: '3px', background: '#162218', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${(cnt / ps.total) * 100}%`, height: '100%', background: mm.bright }} />
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, color: mm.bright, width: '14px', textAlign: 'right' }}>{cnt}</div>
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ ...eye, marginBottom: '6px' }}>VICTORIES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
            {[...ps.wins].sort((a, b) => a.year - b.year).map(w => (
              <div key={`${w.major}-${w.year}`} style={{
                fontSize: '7.5px', fontFamily: 'Montserrat,sans-serif', fontWeight: 600,
                padding: '3px 6px', borderRadius: '4px',
                background: `${MM[w.major].color}22`, color: MM[w.major].bright, border: `1px solid ${MM[w.major].color}33`,
              }}>
                {w.year} {MM[w.major].short.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => onSelect(null)} style={{
          marginTop: 'auto', background: 'none', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px', color: '#4A6A4E', padding: '6px', cursor: 'pointer',
          fontSize: '8px', fontFamily: 'Montserrat,sans-serif', letterSpacing: '1px',
        }}>CLEAR ×</button>
      </div>
    );
  }

  if (!showTable) {
    return (
      <div style={{ ...card, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" style={{ display: 'block', margin: '0 auto 10px' }}>
            <circle cx="24" cy="24" r="20" fill="none" stroke={MM.open.bright}    strokeOpacity="0.2" strokeWidth="1" />
            <circle cx="24" cy="24" r="14" fill="none" stroke={MM.usopen.bright}  strokeOpacity="0.2" strokeWidth="1" />
            <circle cx="24" cy="24" r="8"  fill="none" stroke={MM.pga.bright}     strokeOpacity="0.2" strokeWidth="1" />
            <circle cx="24" cy="24" r="2"  fill="none" stroke={MM.masters.bright} strokeOpacity="0.2" strokeWidth="1" />
          </svg>
          <div style={{ fontSize: '8px', fontFamily: 'Montserrat,sans-serif', letterSpacing: '2px', color: '#2A4A2E' }}>HOVER A DOT</div>
        </div>
      </div>
    );
  }

  return (
    <div style={card}>
      <div style={eye}>TOP CHAMPIONS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
        {TOP_PLAYERS.slice(0, 10).map((ps, i) => {
          const p = PLAYERS[ps.pkey] || { name: '', country: '', era: '' };
          const flag = FLAG[p.country] || '';
          return (
            <div key={ps.pkey} onClick={() => onSelect(ps.pkey)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 9px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.055)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.018)')}
            >
              <div style={{ fontSize: '9px', fontFamily: 'Montserrat,sans-serif', color: '#2E4A30', width: '14px', textAlign: 'right' }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '10px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, color: '#D8E8D8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {flag} {playerName(ps.pkey)}
                </div>
                <div style={{ display: 'flex', gap: '3px', marginTop: '3px' }}>
                  {MK.map(k => ps[k] > 0 && (
                    <span key={k} style={{
                      fontSize: '7px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700,
                      padding: '1px 4px', borderRadius: '3px',
                      background: `${MM[k].color}28`, color: MM[k].bright,
                    }}>{ps[k]}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '18px', fontFamily: 'Playfair Display,Georgia,serif', fontWeight: 700, color: 'white' }}>{ps.total}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RadialViewProps {
  selectedPlayer: string | null;
  hoveredWin: Win | null;
  onHover: (win: Win | null) => void;
  onSelect: (pkey: string | null) => void;
  showTable: boolean;
}

export function RadialView({ selectedPlayer, hoveredWin, onHover, onSelect, showTable }: RadialViewProps) {
  const wins = useMemo<WinsByMajor>(() => {
    const out = { masters: [], pga: [], usopen: [], open: [] } as WinsByMajor;
    (Object.keys(out) as MajorKey[]).forEach(k => {
      out[k] = WINNERS[k].map(([yr, pk, sc, vn, nt]) => ({
        year: yr, pkey: pk, score: sc ?? null, venue: vn ?? '', note: nt ?? '', major: k,
      }));
    });
    return out;
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', gap: 0 }}>
      <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <ConcentricRings wins={wins} selectedPlayer={selectedPlayer} hoveredWin={hoveredWin} onHover={onHover} onSelect={onSelect} />
        <div style={{
          position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '18px', alignItems: 'center',
        }}>
          {MK.map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '22px', height: '2px', background: MM[k].bright, opacity: 0.6, borderRadius: '1px' }} />
              <span style={{ fontSize: '7.5px', fontFamily: 'Montserrat,sans-serif', color: '#4A6A4E', letterSpacing: '0.5px' }}>{MM[k].short}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ width: '250px', flexShrink: 0, padding: '16px 16px 16px 0' }}>
        <CenterPanel hoveredWin={hoveredWin} selectedPlayer={selectedPlayer} onSelect={onSelect} showTable={showTable} />
      </div>
    </div>
  );
}
