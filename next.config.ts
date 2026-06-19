import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Keep the headless-print native modules out of the bundle; they are loaded
  // at runtime by @sportschord/print-pipeline (server-only).
  serverExternalPackages: [
    'puppeteer',
    'puppeteer-core',
    '@sparticuz/chromium',
    'googleapis',
  ],
};

export default nextConfig;
