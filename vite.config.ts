import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  plugins: [react(), {
    name: 'nurture-runtime-assets',
    async writeBundle(options) {
      if (options.dir?.endsWith('.prerender')) return;
      const destination = path.resolve(root, options.dir || 'dist', 'assets');
      await mkdir(destination, { recursive: true });
      // Fonts and CSS-referenced marks are emitted by Vite. Only delivery files
      // are copied; generation masters and the reference stay out of deployment.
      for (const directory of ['product', 'icons', 'social']) {
        await cp(path.join(root, 'assets', directory), path.join(destination, directory), { recursive: true });
      }
      await mkdir(path.join(destination, 'brand'), { recursive: true });
      for (const file of ['trayn-symbol.webp', 'trayn-wordmark.webp', 'trayn-endorsement.webp', 'nurture-wordmark.svg', 'favicon.svg']) {
        await cp(path.join(root, 'assets', 'brand', file), path.join(destination, 'brand', file));
      }
      await mkdir(path.join(destination, 'fonts'), { recursive: true });
      for (const file of ['cormorant-garamond-LICENSE.txt', 'manrope-LICENSE.txt']) {
        await cp(path.join(root, 'assets', 'fonts', file), path.join(destination, 'fonts', file));
      }
    },
  }],
  publicDir: false,
  base: './',
  ssr: { noExternal: ['gsap', 'lenis'] },
  build: { target: 'es2022' },
});
