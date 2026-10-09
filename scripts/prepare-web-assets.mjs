import { createRequire } from 'node:module';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'assets/web');
await mkdir(output, { recursive: true });
const files = [
  ['nurture-campaign-wide-concept-v1.png', 'campaign', 1672],
  ['nurture-everyday-morning-concept-v1.png', 'morning', 1440],
  ['product-photos/v2/nurture-angle-transparent-v2.png', 'poster', 1000],
  ...['front', 'three-quarter', 'back', 'top', 'open-lid', 'lid-detail'].map(name => [`product-photos/v2/nurture-${name}-v2.png`, name, 1200]),
  ['brand/trayn-symbol.png', 'trayn-symbol', 120],
  ['brand/trayn-wordmark.png', 'trayn-wordmark', 480],
];
const manifest = [];
for (const [source, name, width] of files) {
  const destination = path.join(output, `${name}.webp`);
  await sharp(path.join(root, 'assets', source)).resize({ width, withoutEnlargement: true }).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toFile(destination);
  manifest.push({ source, output: `assets/web/${name}.webp`, bytes: (await stat(destination)).size });
}
for (const width of [640, 1000]) {
  await sharp(path.join(root, 'assets/nurture-campaign-wide-concept-v1.png')).resize({ width }).webp({ quality: 86, effort: 6 }).toFile(path.join(output, `campaign-${width}.webp`));
}
await writeFile(path.join(output, 'manifest.json'), JSON.stringify({ note: 'Web encodings of original concept assets; originals retained unchanged.', files: manifest }, null, 2));
console.log(JSON.stringify(manifest, null, 2));
