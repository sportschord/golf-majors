'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import type { Win } from '@/lib/data';
import { MM, MK } from '@/lib/majors';
import { RadialView } from './RadialView';
import { ChordView } from './ChordView';
import { GridView } from './GridView';

const tabLinkStyle: CSSProperties = {
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

type ViewKey = 'radial' | 'chord' | 'grid';
type Theme = 'dark' | 'light';

interface Tweaks { theme: Theme; showTable: boolean; }

const DEFAULT_TWEAKS: Tweaks = { theme: 'dark', showTable: true };

export function GolfMajorsApp() {
  const [view, setView] = useState<ViewKey>('radial');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [hoveredWin, setHoveredWin] = useState<Win | null>(null);
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULT_TWEAKS);
  const [dismissedTweaksQuery, setDismissedTweaksQuery] = useState<string | null>(null);

  const sp = useSearchParams();
  const querySignature = sp.toString();
  const tweaksAvailable = sp.get('tweaks') === '1';
  const tweaksOpen = tweaksAvailable && dismissedTweaksQuery !== querySignature;

  const setTweak = <K extends keyof Tweaks>(key: K, val: Tweaks[K]) => {
    setTweaks(t => ({ ...t, [key]: val }));
  };

  const selectPlayer = useCallback((pk: string | null) => {
    setSelectedPlayer(pk);
    setHoveredWin(null);
  }, []);
  const hoverWin = useCallback((w: Win | null) => setHoveredWin(w), []);

  const isDark = tweaks.theme === 'dark';
  const bg = isDark ? '#070E08' : '#F2EDE3';
  const fg = isDark ? '#D8E8D8' : '#0E180F';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)';
  const hdr = isDark ? '#070E08' : '#EDE8DD';

  useEffect(() => {
    document.body.style.background = bg;
    document.body.style.color = fg;
  }, [bg, fg]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: bg, color: fg, transition: 'background 0.3s' }}>

      <header className="no-print" style={{
        borderBottom: `1px solid ${border}`, padding: '0 28px',
        display: 'flex', alignItems: 'center', gap: '20px',
        flexShrink: 0, height: '58px', background: hdr,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <Image src="/sportschord-mark.svg" width={22} height={22} alt="Sportschord" style={{ opacity: 0.65, height: 22, width: 'auto' }} unoptimized />
          <div style={{ width: '1px', height: '24px', background: border }} />
          <div>
            <div style={{ fontSize: '7.5px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, letterSpacing: '3px', color: '#3A6A3E', lineHeight: 1.3 }}>
              SPORTSCHORD · GOLF
            </div>
            <div style={{ fontSize: '14px', fontFamily: 'Montserrat,sans-serif', fontWeight: 900, letterSpacing: '2.5px', color: fg, textTransform: 'uppercase', lineHeight: 1.3 }}>
              A Visual History of Golf Majors
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', marginLeft: 'auto', alignItems: 'center' }}>
          {(['radial', 'chord', 'grid'] as const).map(v => {
            const label = v === 'radial' ? 'Timeline' : v === 'chord' ? 'Champions' : 'All Winners';
            return (
              <button key={v} className={`tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>{label}</button>
            );
          })}
          <div style={{ width: '1px', height: '20px', background: border, margin: '0 6px' }} />
          <Link href="/all-winners-classic" className="tab" style={tabLinkStyle}>
            Classic Winners
          </Link>
        </nav>

        <div style={{ fontSize: '8.5px', fontFamily: 'Montserrat,sans-serif', color: '#3E5E42', letterSpacing: '2px', flexShrink: 0 }}>
          1860 – 2026
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {view === 'radial' && (
          <RadialView selectedPlayer={selectedPlayer} hoveredWin={hoveredWin}
            onHover={hoverWin} onSelect={selectPlayer} showTable={tweaks.showTable} />
        )}
        {view === 'chord' && <ChordView selectedPlayer={selectedPlayer} onSelect={selectPlayer} />}
        {view === 'grid' && <GridView selectedPlayer={selectedPlayer} onSelect={selectPlayer} />}
      </main>

      <footer className="no-print" style={{
        borderTop: `1px solid ${border}`, padding: '9px 28px',
        display: 'flex', alignItems: 'center', gap: '20px',
        flexShrink: 0, background: hdr,
      }}>
        {MK.map(k => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: MM[k].bright }} />
            <span style={{ fontSize: '8.5px', fontFamily: 'Montserrat,sans-serif', color: '#4A6A4E', letterSpacing: '0.8px' }}>
              {MM[k].name}
            </span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: '8px', color: '#2A4A2E', fontFamily: 'Montserrat,sans-serif', letterSpacing: '1.5px' }}>
          HOVER A DOT FOR DETAILS · CLICK TO SELECT PLAYER
        </div>
      </footer>

      {tweaksAvailable && tweaksOpen && (
        <TweaksPanel tweaks={tweaks} setTweak={setTweak} onClose={() => setDismissedTweaksQuery(querySignature)} />
      )}
    </div>
  );
}

interface TweaksPanelProps {
  tweaks: Tweaks;
  setTweak: <K extends keyof Tweaks>(key: K, val: Tweaks[K]) => void;
  onClose: () => void;
}

function TweaksPanel({ tweaks, setTweak, onClose }: TweaksPanelProps) {
  const labelStyle: CSSProperties = { fontSize: '7.5px', fontFamily: 'Montserrat,sans-serif', letterSpacing: '2px', color: '#2E4A30', marginBottom: '7px' };
  return (
    <div className="no-print" style={{
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
      background: '#0C1A0D', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '14px', padding: '20px 20px 18px', width: '216px',
      boxShadow: '0 24px 80px rgba(0,0,0,0.75)',
    }}>
      <button onClick={onClose}
        style={{ position: 'absolute', top: '12px', right: '14px', background: 'none', border: 'none', color: '#3A5A3E', cursor: 'pointer', fontSize: '17px', lineHeight: 1 }}
        aria-label="Close tweaks">×</button>
      <div style={{ fontSize: '9.5px', fontFamily: 'Montserrat,sans-serif', fontWeight: 700, letterSpacing: '2.5px', color: '#5A7A5E', marginBottom: '18px' }}>
        TWEAKS
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={labelStyle}>THEME</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['dark', 'light'] as const).map(t => (
            <button key={t} className={`twk-btn ${tweaks.theme === t ? 'twk-on' : 'twk-off'}`}
              onClick={() => setTweak('theme', t)} style={{ flex: 1 }}>
              {t === 'dark' ? '⬛ Dark' : '⬜ Light'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={labelStyle}>CENTER PANEL</div>
        <button className={`twk-btn ${tweaks.showTable ? 'twk-on' : 'twk-off'}`}
          onClick={() => setTweak('showTable', !tweaks.showTable)} style={{ width: '100%' }}>
          {tweaks.showTable ? 'Table visible' : 'Table hidden'}
        </button>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={labelStyle}>EXPORT</div>
        <button className="twk-btn twk-off"
          onClick={() => { onClose(); setTimeout(() => window.print(), 150); }}
          style={{ width: '100%' }}>
          🖨 Print / Save PDF
        </button>
      </div>

      <div style={{ fontSize: '7px', color: '#243424', fontFamily: 'Exo 2,sans-serif', textAlign: 'center', lineHeight: 1.5 }}>
        A1 landscape recommended for print
      </div>
    </div>
  );
}
