import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = fileURLToPath(new URL('../old_website/', import.meta.url));
const output = fileURLToPath(new URL('../public/media/', import.meta.url));
await sharp(path.join(root, 'assets/product-photos/v2/nurture-angle-transparent-v2.png')).trim().resize({ width: 1000 }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(output, 'hero.webp'));
await sharp(path.join(output, 'hero.webp')).resize({ width: 600 }).webp({ quality: 87, alphaQuality: 100 }).toFile(path.join(output, 'hero-small.webp'));
await sharp(path.join(root, 'assets/product-photos/v2/nurture-front-transparent-v2.png')).trim().resize({ width: 1000 }).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(output, 'front-cutout.webp'));
await sharp(path.join(root, 'assets/product-photos/v2/nurture-front-v2.png')).extract({ left: 665, top: 690, width: 540, height: 650 }).resize({ width: 900 }).webp({ quality: 90 }).toFile(path.join(output, 'artwork-detail.webp'));
for (const file of ['hero.webp', 'front-cutout.webp', 'artwork-detail.webp']) console.log(file, await sharp(path.join(output, file)).metadata());

