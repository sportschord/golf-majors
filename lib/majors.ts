import type { MajorKey } from './data';

export interface MajorMeta {
  name: string;
  short: string;
  color: string;
  bright: string;
  track: string;
  glow: string;
}

export const MM: Record<MajorKey, MajorMeta> = {
  masters: { name: 'The Masters',           short: 'Masters',  color: '#0B3D2E', bright: '#F2A900', track: 'rgba(242,169,0,0.18)',    glow: 'rgba(242,169,0,0.22)' },
  pga:     { name: 'PGA Championship',      short: 'PGA',      color: '#041E42', bright: '#C5A46D', track: 'rgba(197,164,109,0.18)',  glow: 'rgba(197,164,109,0.22)' },
  usopen:  { name: 'U.S. Open',             short: 'US Open',  color: '#A6192E', bright: '#E84455', track: 'rgba(232,68,85,0.18)',    glow: 'rgba(232,68,85,0.22)' },
  open:    { name: 'The Open Championship', short: 'The Open', color: '#6C1D45', bright: '#D6C6A8', track: 'rgba(214,198,168,0.18)',  glow: 'rgba(214,198,168,0.22)' },
};

export const MK: MajorKey[] = ['masters', 'pga', 'usopen', 'open'];

// Shared radial time scale
export const T_START = 1858;
export const T_END = 2028;
export const T_SPAN = T_END - T_START;

export function toAngle(yr: number): number {
  return ((yr - T_START) / T_SPAN) * 2 * Math.PI - Math.PI / 2;
}

export function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

export const FOUNDED: Record<MajorKey, number> = { masters: 1934, pga: 1916, usopen: 1895, open: 1860 };
export const RADII:   Record<MajorKey, number> = { masters: 88,   pga: 152,  usopen: 216,  open: 280  };

export const DECADE_TICKS = [1860, 1880, 1900, 1920, 1940, 1960, 1980, 2000, 2020];

export function arcPathD(cx: number, cy: number, r: number, a1: number, a2: number): string {
  const [x1, y1] = polar(cx, cy, r, a1);
  const [x2, y2] = polar(cx, cy, r, a2);
  const da = ((a2 - a1) + 2 * Math.PI) % (2 * Math.PI);
  const large = da > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}
