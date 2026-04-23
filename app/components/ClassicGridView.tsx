'use client';

import { useState } from 'react';
import { FLAG, PLAYER_STATS, PLAYERS, WINNERS, playerName, type MajorKey } from '@/lib/data';
import { MM, MK } from '@/lib/majors';

interface ClassicGridEntry {
  pkey: string;
  score: string | null;
  venue: string;
  note: string;
}

interface HoveredCell {
  year: number;
  major: MajorKey;
}

interface ClassicGridViewProps {
  selectedPlayer: string | null;
  onSelect: (pkey: string | null) => void;
}

const lookup: Record<number, Partial<Record<MajorKey, ClassicGridEntry>>> = {};

for (const major of MK) {
  for (const [year, pkey, score, venue, note] of WINNERS[major]) {
    if (!lookup[year]) lookup[year] = {};
    lookup[year][major] = {
      pkey,
      score,
      venue: venue ?? '',
      note: note ?? '',
    };
  }
}

const allYears = Object.keys(lookup).map(Number).sort((a, b) => a - b);

const decadeGroups = Object.entries(
  allYears.reduce<Record<number, number[]>>((groups, year) => {
    const decade = Math.floor(year / 10) * 10;
    (groups[decade] ??= []).push(year);
    return groups;
  }, {}),
).sort(([a], [b]) => Number(a) - Number(b));

export function ClassicGridView({ selectedPlayer, onSelect }: ClassicGridViewProps) {
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '52px repeat(4,1fr)',
          gap: '4px',
          padding: '14px 28px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
          background: '#070E08',
          zIndex: 2,
        }}
      >
        <div style={{ fontSize: '8px', fontFamily: 'Montserrat,sans-serif', color: '#2A4A2E', letterSpacing: '1px' }}>
          YEAR
        </div>
        {MK.map((major) => (
          <div
            key={major}
            style={{
              fontSize: '8px',
              fontFamily: 'Montserrat,sans-serif',
              fontWeight: 800,
              letterSpacing: '1.5px',
              color: MM[major].bright,
              textAlign: 'center',
            }}
          >
            {MM[major].name.toUpperCase()}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 28px 32px' }}>
        {decadeGroups.map(([decade, years]) => (
          <div key={decade}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 0 6px' }}>
              <div
                style={{
                  fontSize: '8px',
                  fontFamily: 'Montserrat,sans-serif',
                  letterSpacing: '3px',
                  color: '#2A4A2E',
                  fontWeight: 700,
                }}
              >
                {decade}s
              </div>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
            </div>

            {years.map((year) => {
              const row = lookup[year];

              return (
                <div
                  key={year}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px repeat(4,1fr)',
                    gap: '4px',
                    marginBottom: '3px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '9px',
                      fontFamily: 'Montserrat,sans-serif',
                      color: '#3A5A3E',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {year}
                  </div>

                  {MK.map((major) => {
                    const entry = row[major];
                    if (!entry) {
                      return (
                        <div
                          key={major}
                          style={{
                            height: '30px',
                            borderRadius: '5px',
                            background: 'rgba(255,255,255,0.012)',
                            border: '1px solid rgba(255,255,255,0.025)',
                          }}
                        />
                      );
                    }

                    const isSelected = selectedPlayer === entry.pkey;
                    const isDimmed = selectedPlayer !== null && !isSelected;
                    const isHovered = hoveredCell?.year === year && hoveredCell.major === major;
                    const majorMeta = MM[major];
                    const name = playerName(entry.pkey);
                    const lastName = name.split(' ').pop() ?? name;
                    const playerStats = PLAYER_STATS[entry.pkey];
                    const country = PLAYERS[entry.pkey]?.country ?? '';
                    const flag = FLAG[country] ?? '';
                    const detailParts = [name];

                    if (entry.score) detailParts.push(`${entry.score} to par`);
                    if (entry.venue) detailParts.push(entry.venue);
                    if (entry.note) detailParts.push(entry.note);

                    return (
                      <button
                        key={major}
                        type="button"
                        title={detailParts.join(' · ')}
                        aria-label={`${year} ${MM[major].name} winner ${name}${flag ? `, ${flag}` : ''}`}
                        aria-pressed={isSelected}
                        onClick={() => onSelect(isSelected ? null : entry.pkey)}
                        onMouseEnter={() => setHoveredCell({ year, major })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          height: '30px',
                          borderRadius: '5px',
                          padding: '0 9px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: isDimmed
                            ? 'rgba(255,255,255,0.012)'
                            : isHovered
                              ? `${majorMeta.color}35`
                              : isSelected
                                ? `${majorMeta.color}40`
                                : `${majorMeta.color}1A`,
                          border: `1px solid ${majorMeta.color}${isSelected ? '55' : isHovered ? '40' : '22'}`,
                          transition: 'all 0.1s',
                          overflow: 'hidden',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '9px',
                            fontFamily: 'Montserrat,sans-serif',
                            fontWeight: isSelected ? 700 : 600,
                            color: isDimmed ? '#1E2E1E' : isHovered ? 'white' : majorMeta.bright,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flex: 1,
                            textAlign: 'left',
                          }}
                        >
                          {lastName}
                        </span>
                        {isHovered && entry.score && !isDimmed && (
                          <span
                            style={{
                              fontSize: '8px',
                              fontFamily: 'Montserrat,sans-serif',
                              color: majorMeta.bright,
                              opacity: 0.7,
                              flexShrink: 0,
                              marginLeft: '4px',
                            }}
                          >
                            {entry.score}
                          </span>
                        )}
                        {isSelected && playerStats && playerStats.total > 1 && (
                          <span
                            style={{
                              fontSize: '7px',
                              fontFamily: 'Montserrat,sans-serif',
                              fontWeight: 700,
                              color: majorMeta.bright,
                              background: `${majorMeta.color}35`,
                              padding: '1px 4px',
                              borderRadius: '3px',
                              flexShrink: 0,
                              marginLeft: '4px',
                            }}
                          >
                            {playerStats.total}✦
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {hoveredCell && (() => {
        const entry = lookup[hoveredCell.year]?.[hoveredCell.major];
        if (!entry) return null;

        const majorMeta = MM[hoveredCell.major];
        const name = playerName(entry.pkey);
        const playerStats = PLAYER_STATS[entry.pkey];
        const player = PLAYERS[entry.pkey] ?? { name: '', country: '', era: '' };
        const flag = FLAG[player.country] ?? '';

        return (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '28px',
              background: '#0B1A0C',
              border: `1px solid ${majorMeta.color}40`,
              borderRadius: '10px',
              padding: '14px 16px',
              zIndex: 10,
              pointerEvents: 'none',
              minWidth: '180px',
              boxShadow: `0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px ${majorMeta.color}20`,
            }}
          >
            <div
              style={{
                fontSize: '7px',
                fontFamily: 'Montserrat,sans-serif',
                letterSpacing: '2px',
                color: majorMeta.bright,
                marginBottom: '6px',
                fontWeight: 700,
              }}
            >
              {majorMeta.name.toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: 'Montserrat,sans-serif',
                fontWeight: 900,
                fontSize: '28px',
                color: 'white',
                lineHeight: 1,
                letterSpacing: '-1px',
                marginBottom: '8px',
              }}
            >
              {hoveredCell.year}
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, color: 'white' }}>
              {name}
            </div>
            <div style={{ fontSize: '10px', color: '#5A7A5E', marginTop: '2px' }}>
              {flag} {player.era || ''}
            </div>
            {entry.score && (
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '16px',
                  fontFamily: 'Montserrat,sans-serif',
                  fontWeight: 800,
                  color: majorMeta.bright,
                }}
              >
                {entry.score}{' '}
                <span style={{ fontSize: '8px', color: '#4A6A4E', letterSpacing: '1px', fontWeight: 400 }}>
                  TO PAR
                </span>
              </div>
            )}
            {entry.venue && (
              <div style={{ fontSize: '9px', color: '#5A7A5E', marginTop: '4px', fontFamily: 'Exo 2,sans-serif' }}>
                {entry.venue}
              </div>
            )}
            {entry.note && (
              <div style={{ fontSize: '8px', color: '#4A6A4E', marginTop: '6px', fontFamily: 'Exo 2,sans-serif' }}>
                {entry.note}
              </div>
            )}
            {playerStats && playerStats.total > 1 && (
              <div
                style={{
                  fontSize: '8px',
                  color: majorMeta.bright,
                  marginTop: '6px',
                  fontFamily: 'Montserrat,sans-serif',
                }}
              >
                {playerStats.total} career majors
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
