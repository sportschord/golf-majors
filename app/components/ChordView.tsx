'use client';

import { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { PLAYER_STATS, playerName, type PlayerStats, type MajorKey } from '@/lib/data';
import { MM, MK } from '@/lib/majors';

function getEligible(): PlayerStats[] {
  return Object.values(PLAYER_STATS)
    .filter(ps => ps.total >= 5)
    .sort((a, b) => b.total - a.total);
}

interface ChordViewProps {
  selectedPlayer: string | null;
  onSelect: (pkey: string | null) => void;
}

export function ChordView({ selectedPlayer, onSelect }: ChordViewProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const players = useMemo(() => getEligible(), []);

  const matrix = useMemo(() => {
    const N = 4 + players.length;
    const m: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
    players.forEach((ps, pi) => {
      MK.forEach((k, mi) => {
        if (ps[k] > 0) { m[mi][4 + pi] = ps[k]; m[4 + pi][mi] = ps[k]; }
      });
    });
    return m;
  }, [players]);

  const chordResult = useMemo(() => {
    const fn = d3.chord().padAngle(0.018).sortSubgroups(d3.descending);
    const r = fn(matrix);
    return { chords: r, groups: r.groups };
  }, [matrix]);

  const { chords, groups } = chordResult;

  const ROTATE_DEG = -90;
  const ROTATE_RAD = ROTATE_DEG * Math.PI / 180;
  const size = 560;
  const cx = size / 2, cy = size / 2;
  const outerR = 210, innerR = 172;

  const arcGen = useMemo(() => d3.arc<d3.ChordGroup>().innerRadius(innerR).outerRadius(outerR), []);
  const ribbonGen = useMemo(() => d3.ribbon<d3.Chord, d3.ChordSubgroup>().radius(innerR - 1), []);

  const activePlayer = hovered || selectedPlayer;
  const activeIdx = activePlayer ? 4 + players.findIndex(p => p.pkey === activePlayer) : -1;

  const nodeColor = (i: number) => {
    if (i < 4) return MM[MK[i]].bright;
    const ps = players[i - 4];
    const dom = MK.reduce<MajorKey>((b, k) => ps[k] > (ps[b] || 0) ? k : b, 'masters');
    return MM[dom].color;
  };
  const nodeBright = (i: number) => {
    if (i < 4) return MM[MK[i]].bright;
    const ps = players[i - 4];
    const dom = MK.reduce<MajorKey>((b, k) => ps[k] > (ps[b] || 0) ? k : b, 'masters');
    return MM[dom].bright;
  };
  const nodeLabel = (i: number) => {
    if (i < 4) return MM[MK[i]].short;
    const name = playerName(players[i - 4].pkey);
    const parts = name.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : name;
  };
  const isMajorNode = (i: number) => i < 4;

  const labelPos = (group: d3.ChordGroup) => {
    const midA = (group.startAngle + group.endAngle) / 2;
    const rotA = midA + ROTATE_RAD;
    const lr = outerR + 18;
    const lx = Math.sin(rotA) * lr;
    const ly = -Math.cos(rotA) * lr;
    const textRot = (rotA * 180 / Math.PI) + (rotA > Math.PI ? 90 : -90);
    const flip = rotA > Math.PI && rotA < 2 * Math.PI;
    return { lx, ly, textRot, flip };
  };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

      <div style={{
        position: 'absolute', top: '20px', left: '20px', width: '200px', zIndex: 10,
        background: 'rgba(11,26,12,0.92)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '14px 16px',
        backdropFilter: 'blur(8px)',
      }}>
        <svg width="168" height="72" viewBox="0 0 168 72" style={{ display: 'block', marginBottom: '10px' }}>
          {[0, 1, 2, 3].map(i => {
            const x = 20 + i * 36, w = 28;
            const col = MM[MK[i]].bright;
            return (
              <g key={i}>
                <rect x={x} y={4} width={w} height={10} rx={3} fill={col} fillOpacity="0.85" />
                <path d={`M ${x + w / 2} 14 C ${x + w / 2} 38 84 38 84 58`}
                  fill="none" stroke={col} strokeOpacity="0.4" strokeWidth="4" />
              </g>
            );
          })}
          <rect x={64} y={58} width={40} height={10} rx={3} fill="rgba(255,255,255,0.25)" />
          <text x="84" y="67" textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.5)" fontSize="5.5" fontFamily="Montserrat,sans-serif">PLAYER</text>
        </svg>

        <div style={{ fontSize: '9px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, letterSpacing: '1.5px', color: '#6A8A6E', marginBottom: '8px' }}>HOW TO READ</div>
        <div style={{ fontSize: '9px', fontFamily: 'Exo 2,sans-serif', color: '#4A6A4E', lineHeight: 1.6 }}>
          <span style={{ color: '#8AAA8E' }}>Top arcs</span> — the 4 majors, sized by total wins in this set.<br />
          <span style={{ color: '#8AAA8E' }}>Bottom arcs</span> — champions with 5+ majors.<br />
          <span style={{ color: '#8AAA8E' }}>Ribbons</span> — connect each champion to the majors they won. Width = wins.<br />
          Click a name to highlight.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
          {MK.map(k => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: MM[k].bright, flexShrink: 0 }} />
              <span style={{ fontSize: '7.5px', fontFamily: 'Montserrat,sans-serif', color: '#5A7A5E' }}>{MM[k].name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <div style={{ fontSize: '7.5px', fontFamily: 'Montserrat,sans-serif', letterSpacing: '2.5px', color: '#3A5A3E' }}>
          CHAMPIONS WITH 5+ MAJORS · WINS BY TOURNAMENT
        </div>

        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          <g transform={`translate(${cx},${cy}) rotate(${ROTATE_DEG})`}>
            {chords.map((chord, i) => {
              const si = chord.source.index, ti = chord.target.index;
              const majI = si < 4 ? si : (ti < 4 ? ti : si);
              const color = MM[MK[Math.min(majI, 3)]].bright;
              const related = activeIdx >= 0 && (si === activeIdx || ti === activeIdx);
              const dimmed = activeIdx >= 0 && !related;
              return (
                <path key={i}
                  d={ribbonGen(chord) ?? ''}
                  fill={color}
                  stroke={color} strokeWidth="0.5"
                  style={{
                    fillOpacity: dimmed ? 0.02 : related ? 0.72 : 0.18,
                    strokeOpacity: dimmed ? 0.02 : related ? 0.25 : 0.12,
                    transition: 'fill-opacity 0.35s ease, stroke-opacity 0.35s ease',
                  }}
                />
              );
            })}

            {groups.map((group, i) => {
              const isMajor = isMajorNode(i);
              const player = !isMajor ? players[i - 4] : null;
              const isSel = player?.pkey === selectedPlayer;
              const isHov = player?.pkey === hovered;
              const active = isSel || isHov;
              const color = nodeColor(i);
              const bright = nodeBright(i);
              const dimmed = activeIdx >= 0 && !isMajor && i !== activeIdx;
              return (
                <g key={i}
                  style={{ cursor: player ? 'pointer' : 'default', transition: 'opacity 0.25s' }}
                  onClick={player ? () => onSelect(isSel ? null : player.pkey) : undefined}
                  onMouseEnter={player ? () => setHovered(player.pkey) : undefined}
                  onMouseLeave={player ? () => setHovered(null) : undefined}
                >
                  <path d={arcGen(group) ?? ''}
                    fill={active ? bright : color}
                    fillOpacity={isMajor ? 0.88 : (active ? 0.95 : dimmed ? 0.25 : 0.6)}
                    stroke={active ? 'white' : 'none'} strokeWidth="1.5"
                    style={{ transition: 'fill 0.2s, fill-opacity 0.25s' }}
                  />
                </g>
              );
            })}
          </g>

          <g transform={`translate(${cx},${cy})`}>
            {groups.map((group, i) => {
              const isMajor = isMajorNode(i);
              const player = !isMajor ? players[i - 4] : null;
              const active = player?.pkey === hovered || player?.pkey === selectedPlayer;
              const { lx, ly, textRot, flip } = labelPos(group);
              const dimmed = activeIdx >= 0 && !isMajor && i !== activeIdx;
              const bright = nodeBright(i);

              const arcSpan = group.endAngle - group.startAngle;
              if (arcSpan < 0.04) return null;

              return (
                <text key={i}
                  x={lx} y={ly}
                  transform={`rotate(${textRot + (flip ? 180 : 0)}, ${lx}, ${ly})`}
                  textAnchor={flip ? 'end' : 'start'}
                  dominantBaseline="middle"
                  fill={active ? 'white' : bright}
                  fillOpacity={dimmed ? 0.25 : (isMajor ? 0.95 : 0.75)}
                  fontSize={isMajor ? 10.5 : 8.5}
                  fontFamily="Montserrat,sans-serif"
                  fontWeight={isMajor ? 800 : (active ? 700 : 500)}
                  letterSpacing={isMajor ? 1 : 0}
                  style={{ transition: 'fill-opacity 0.25s', pointerEvents: 'none' }}
                >
                  {nodeLabel(i)}
                </text>
              );
            })}
          </g>

          <g transform={`translate(${cx},${cy})`}>
            {hovered && (() => {
              const ps = PLAYER_STATS[hovered];
              if (!ps) return null;
              return (
                <g>
                  <text textAnchor="middle" y="-26" fill="white" fontSize="13" fontFamily="Montserrat,sans-serif" fontWeight={700}>
                    {playerName(hovered).split(' ').pop()}
                  </text>
                  <text textAnchor="middle" y="-6" fill="white" fillOpacity="0.35" fontSize="9" fontFamily="Montserrat,sans-serif">
                    {ps.total} MAJORS
                  </text>
                  {MK.map((k, ci) => ps[k] > 0 && (
                    <text key={k} textAnchor="middle" y={12 + ci * 14} fill={MM[k].bright} fontSize="8.5" fontFamily="Montserrat,sans-serif">
                      {ps[k]}× {MM[k].short}
                    </text>
                  ))}
                </g>
              );
            })()}
          </g>
        </svg>

        <div style={{ fontSize: '7.5px', fontFamily: 'Montserrat,sans-serif', color: '#2A4A2E', letterSpacing: '1.5px' }}>
          CLICK A NAME TO HIGHLIGHT WINS
        </div>
      </div>
    </div>
  );
}
