import { readFile, writeFile, readdir } from 'node:fs/promises';
import { render } from '../.prerender/entry-server.js';
let template = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
if (!template.includes('<!--app-html-->')) throw new Error('Prerender marker missing');
const fonts = await readdir(new URL('../dist/assets/', import.meta.url));
const display = fonts.find(file => file.startsWith('cormorant-garamond-latin-400-normal') && file.endsWith('.woff2'));
const italic = fonts.find(file => file.startsWith('cormorant-garamond-latin-400-italic') && file.endsWith('.woff2'));
const body = fonts.find(file => file.startsWith('manrope-latin-400-normal') && file.endsWith('.woff2'));
const preloads = [display, italic, body].filter(Boolean).map(file => `<link rel="preload" href="./assets/${file}" as="font" type="font/woff2" crossorigin />`).join('\n    ');
template = template.replace('</head>', `    ${preloads}\n  </head>`);
if (process.env.PUBLIC_SITE_URL) {
  const url = new URL(process.env.PUBLIC_SITE_URL);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('PUBLIC_SITE_URL must be an HTTP(S) URL');
  const image = new URL('assets/social/social-preview.jpg', url.href.endsWith('/') ? url.href : `${url.href}/`).href;
  const escapedImage = image.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  template = template.replace(/(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*(")/g, (_, prefix, suffix) => `${prefix}${escapedImage}${suffix}`);
  const escaped = url.href.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  template = template.replace('</head>', `<link rel="canonical" href="${escaped}" /><meta property="og:url" content="${escaped}" />\n  </head>`);
}
await writeFile(new URL('../dist/index.html', import.meta.url), template.replace('<!--app-html-->', render()));
console.log('Prerendered the complete Nurture page and preload metadata.');
