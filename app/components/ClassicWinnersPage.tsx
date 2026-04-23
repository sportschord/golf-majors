'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { playerName } from '@/lib/data';
import { MM, MK } from '@/lib/majors';
import { ClassicGridView } from './ClassicGridView';

const tabLinkStyle: CSSProperties = {
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export function ClassicWinnersPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.background = '#070E08';
    document.body.style.color = '#D8E8D8';
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#070E08',
        color: '#D8E8D8',
      }}
    >
      <header
        className="no-print"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexShrink: 0,
          height: '58px',
          background: '#070E08',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <Image
            src="/sportschord-mark.svg"
            width={22}
            height={22}
            alt="Sportschord"
            style={{ opacity: 0.65, height: 22, width: 'auto' }}
            unoptimized
          />
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.07)' }} />
          <div>
            <div
              style={{
                fontSize: '7.5px',
                fontFamily: 'Montserrat,sans-serif',
                fontWeight: 700,
                letterSpacing: '3px',
                color: '#3A6A3E',
                lineHeight: 1.3,
              }}
            >
              SPORTSCHORD · GOLF
            </div>
            <div
              style={{
                fontSize: '14px',
                fontFamily: 'Montserrat,sans-serif',
                fontWeight: 900,
                letterSpacing: '2.5px',
                color: '#D8E8D8',
                textTransform: 'uppercase',
                lineHeight: 1.3,
              }}
            >
              Classic All Winners Layout
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', marginLeft: 'auto', alignItems: 'center' }}>
          <Link href="/" className="tab" style={tabLinkStyle}>
            Explorer
          </Link>
          <div
            style={{
              width: '1px',
              height: '20px',
              background: 'rgba(255,255,255,0.07)',
              margin: '0 6px',
            }}
          />
          <span className="tab active" aria-current="page" style={tabLinkStyle}>
            Classic Winners
          </span>
        </nav>

        <div
          style={{
            fontSize: '8.5px',
            fontFamily: 'Montserrat,sans-serif',
            color: '#3E5E42',
            letterSpacing: '2px',
            flexShrink: 0,
          }}
        >
          1860 – 2026
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <ClassicGridView selectedPlayer={selectedPlayer} onSelect={setSelectedPlayer} />
      </main>

      <footer
        className="no-print"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '9px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexShrink: 0,
          background: '#070E08',
        }}
      >
        {MK.map((major) => (
          <div key={major} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: MM[major].bright }} />
            <span
              style={{
                fontSize: '8.5px',
                fontFamily: 'Montserrat,sans-serif',
                color: '#4A6A4E',
                letterSpacing: '0.8px',
              }}
            >
              {MM[major].name}
            </span>
          </div>
        ))}
        <div
          style={{
            marginLeft: 'auto',
            fontSize: '8px',
            color: '#2A4A2E',
            fontFamily: 'Montserrat,sans-serif',
            letterSpacing: '1.5px',
          }}
        >
          {selectedPlayer
            ? `SELECTED PLAYER · ${playerName(selectedPlayer).toUpperCase()}`
            : 'HOVER A CELL FOR DETAILS · CLICK TO SELECT PLAYER'}
        </div>
      </footer>
    </div>
  );
}
