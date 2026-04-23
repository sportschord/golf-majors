import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Exo_2, Playfair_Display } from 'next/font/google';
import './globals.css';

const montserrat = localFont({
  variable: '--font-montserrat',
  src: [
    { path: './fonts/Montserrat-Thin.ttf',             weight: '100', style: 'normal' },
    { path: './fonts/Montserrat-ThinItalic.ttf',       weight: '100', style: 'italic' },
    { path: './fonts/Montserrat-ExtraLight.ttf',       weight: '200', style: 'normal' },
    { path: './fonts/Montserrat-ExtraLightItalic.ttf', weight: '200', style: 'italic' },
    { path: './fonts/Montserrat-Light.ttf',            weight: '300', style: 'normal' },
    { path: './fonts/Montserrat-LightItalic.ttf',      weight: '300', style: 'italic' },
    { path: './fonts/Montserrat-Regular.ttf',          weight: '400', style: 'normal' },
    { path: './fonts/Montserrat-Italic.ttf',           weight: '400', style: 'italic' },
    { path: './fonts/Montserrat-Medium.ttf',           weight: '500', style: 'normal' },
    { path: './fonts/Montserrat-MediumItalic.ttf',     weight: '500', style: 'italic' },
    { path: './fonts/Montserrat-SemiBold.ttf',         weight: '600', style: 'normal' },
    { path: './fonts/Montserrat-SemiBoldItalic.ttf',   weight: '600', style: 'italic' },
    { path: './fonts/Montserrat-Bold.ttf',             weight: '700', style: 'normal' },
    { path: './fonts/Montserrat-BoldItalic.ttf',       weight: '700', style: 'italic' },
    { path: './fonts/Montserrat-ExtraBold.ttf',        weight: '800', style: 'normal' },
    { path: './fonts/Montserrat-ExtraBoldItalic.ttf',  weight: '800', style: 'italic' },
    { path: './fonts/Montserrat-Black.ttf',            weight: '900', style: 'normal' },
    { path: './fonts/Montserrat-BlackItalic.ttf',      weight: '900', style: 'italic' },
  ],
  display: 'swap',
});

const exo2 = Exo_2({
  variable: '--font-exo-2',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'A Visual History of Golf Majors — Sportschord',
  description: 'The Masters, PGA, U.S. Open and The Open Championship — 1860 to 2026. Hover a dot for details, click to select a player.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${exo2.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
