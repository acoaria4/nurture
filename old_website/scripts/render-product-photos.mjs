import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(root, 'assets', 'product-photos', 'v2');
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}),
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
});
const report = { modelVersion: 2, type: '3D renders, not physical product photographs', shots: [] };
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:4173/model-preview/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.nurturePreview?.ready);
  const shots = await page.evaluate(async () => (await import('/model-preview/photos.js')).PHOTO_SHOTS);
  for (const shot of shots) {
    const downloadPromise = page.waitForEvent('download', { timeout: 90000 });
    const metadata = await page.evaluate(async (config) => {
      const { renderProductPhoto } = await import('/model-preview/photos.js');
      const { blob, metadata } = await renderProductPhoto(config);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `nurture-${config.id}-v2.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 5000);
      return metadata;
    }, shot);
    const download = await downloadPromise;
    const file = path.join(destination, download.suggestedFilename());
    await download.saveAs(file);
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 1600);
    assert.equal(info.height, 2000);
    const colors = new Set();
    let opaquePixels = 0;
    let transparentPixels = 0;
    for (let index = 0; index < data.length; index += 4 * 97) {
      colors.add(`${data[index] >> 4},${data[index + 1] >> 4},${data[index + 2] >> 4}`);
      if (data[index + 3] > 250) opaquePixels++;
      if (data[index + 3] === 0) transparentPixels++;
    }
    assert(colors.size > 40, `Blank photo: ${shot.id}`);
    assert(opaquePixels > 1000, `No opaque product: ${shot.id}`);
    if (shot.transparent) assert(transparentPixels > 1000, `Cutout lacks alpha: ${shot.id}`);
    else assert.equal(transparentPixels, 0, `Studio photo unexpectedly transparent: ${shot.id}`);
    if (shot.angle !== 'detail') assert(metadata.framed, `Product cropped: ${shot.id}`);
    report.shots.push({ ...metadata, filename: path.basename(file), distinctColors: colors.size, opaquePixels, transparentPixels });
    console.log(`Saved ${path.basename(file)} (${info.width} x ${info.height})`);
  }
  assert.deepEqual(errors, []);
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.error = error.stack;
  throw error;
} finally {
  report.browserErrors = errors;
  await writeFile(path.join(destination, 'manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}
