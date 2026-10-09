import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const destination = fileURLToPath(new URL('../verification/', import.meta.url));
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}) });
const errors = [];
const report = { passed: false, viewports: [] };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
  await page.goto(process.env.GALLERY_URL || 'http://127.0.0.1:4173/model-preview/photos.html', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('.photo-item').count(), 9);
  await page.locator('.photo-item').last().scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('.photo-open img')].every((img) => img.complete && img.naturalWidth === 1600));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: path.join(destination, 'photo-gallery-desktop.png'), fullPage: true });
  assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
  report.viewports.push('desktop');
  await page.getByRole('button', { name: 'View front photo', exact: true }).click();
  assert(await page.locator('#photo-dialog').evaluate((dialog) => dialog.open));
  await page.keyboard.press('Escape');
  assert(!(await page.locator('#photo-dialog').evaluate((dialog) => dialog.open)));
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download front photo', exact: true }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'nurture-front-v2.png');
  assert.equal(await download.failure(), null);
  report.modalAndDownload = true;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(destination, 'photo-gallery-mobile.png'), fullPage: true });
  assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));
  report.viewports.push('mobile');
  assert.deepEqual(errors, []);
  report.passed = true;
  console.log(JSON.stringify(report));
} finally {
  report.browserErrors = errors;
  await writeFile(path.join(destination, 'gallery-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}
