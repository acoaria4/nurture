import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.SITE_URL || 'http://127.0.0.1:4174/';
const output = fileURLToPath(new URL('../verification/site/', import.meta.url));
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
const errors = [];
const report = {};
const luminance = hex => {
  const c = hex.replace('#', '').match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
};
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${output}production-final-desktop.png` });
  report.lightGoldContrast = contrast('#8a672f', '#fafbf7');
  report.darkGoldContrast = contrast('#c6a76a', '#162b23');
  assert(report.lightGoldContrast >= 4.5 && report.darkGoldContrast >= 4.5);
  await page.keyboard.press('Tab');
  assert(await page.getByRole('link', { name: 'Skip to content' }).evaluate(element => element === document.activeElement));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${output}production-final-mobile.png` });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.goto(`${url}model-preview/`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.nurturePreview?.ready === true);
  report.modelRoute = true;
  await page.goto(`${url}model-preview/photos.html`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.photo-grid img').count(), 9);
  report.galleryRoute = true;
  assert((await page.request.get(`${url}licenses/react-bits-LICENSE.md`)).ok());
  report.licenseDelivered = true;
  const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await noJs.goto(`${url}model-preview/photos.html`, { waitUntil: 'networkidle' });
  assert(await noJs.locator('noscript img').evaluate(image => image.complete && image.naturalWidth > 0));
  report.noJsGallery = true;
  assert.equal(errors.length, 0);
  report.passed = true;
} catch (error) { report.failure = error.stack; throw error; }
finally {
  await writeFile(`${output}smoke-report.json`, JSON.stringify({ ...report, errors }, null, 2));
  console.log(JSON.stringify({ ...report, errors }, null, 2));
  await browser.close();
}
