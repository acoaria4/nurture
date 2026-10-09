import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const output = fileURLToPath(new URL('../verification/site/', import.meta.url));
const url = process.env.SITE_URL || 'http://127.0.0.1:4173/';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE, args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
const errors = [];
const report = { url, viewports: [], workflows: {}, scene: {}, errors };
function observe(page) {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
}
async function jump(page, selector) {
  await page.locator(selector).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await page.waitForTimeout(1000);
}
async function fullReveal(page) {
  for (const selector of ['#intention', '#inside', '#formula', '#ritual', '#product', '#questions', '.closing', '.footer']) await jump(page, selector);
}
async function scenePixels(page, name) {
  const buffer = await page.locator('.product-scene canvas').screenshot();
  await writeFile(path.join(output, `${name}-canvas.png`), buffer);
  const { data, info } = await sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let goldPixels = 0;
  let edgeGold = 0;
  const colors = new Set();
  for (let y = 0; y < info.height; y += 3) for (let x = 0; x < info.width; x += 3) {
    const offset = (y * info.width + x) * info.channels;
    const [r, g, b] = data.subarray(offset, offset + 3);
    colors.add(`${r >> 4},${g >> 4},${b >> 4}`);
    if (r - b > 25 && r > 130) {
      goldPixels++;
      if (x < info.width * .025 || x > info.width * .975 || y < info.height * .025 || y > info.height * .975) edgeGold++;
    }
  }
  assert(colors.size > 60, `${name}: nonblank scene (${colors.size} colors)`);
  assert(goldPixels > 180, `${name}: product pixels (${goldPixels})`);
  assert(edgeGold < 15, `${name}: product clipped at canvas edge (${edgeGold})`);
  return { colors: colors.size, goldPixels, edgeGold, width: info.width, height: info.height };
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  observe(page);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(output, 'desktop-hero.png') });
  assert(await page.locator('h1').innerText() === 'Nurture\nEveryday.');
  await jump(page, '#inside');
  await page.waitForSelector('.product-scene canvas[data-ready="true"]');
  await page.screenshot({ path: path.join(output, 'desktop-story.png') });
  report.scene.front = await scenePixels(page, 'desktop-front');
  await page.getByRole('button', { name: 'The details', exact: true }).click();
  await page.waitForTimeout(600);
  const middleProgress = await page.locator('.product-scene canvas').getAttribute('data-progress');
  await page.getByRole('button', { name: 'The everyday', exact: true }).click();
  await page.waitForTimeout(600);
  const endProgress = await page.locator('.product-scene canvas').getAttribute('data-progress');
  assert(Number(endProgress) > Number(middleProgress));
  report.scene.open = await scenePixels(page, 'desktop-open');
  await page.screenshot({ path: path.join(output, 'desktop-story-open.png') });
  report.scene.progress = { middleProgress, endProgress };
  const visibleCount = await page.locator('.product-scene canvas').getAttribute('data-render-count');
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('.product-scene canvas').getAttribute('data-render-count'), visibleCount, 'Static scene should not keep rendering');
  report.scene.staticRenderPaused = true;

  await jump(page, '#product');
  await page.screenshot({ path: path.join(output, 'desktop-product.png') });
  await page.getByRole('button', { name: 'Back view', exact: true }).click();
  assert(await page.getByRole('button', { name: 'Back view', exact: true }).getAttribute('aria-pressed') === 'true');
  await page.getByRole('button', { name: 'Enlarge back product image' }).click();
  assert(await page.getByRole('dialog', { name: 'Back / Nurture Everyday' }).isVisible());
  await page.keyboard.press('ArrowRight');
  assert(await page.getByRole('dialog', { name: 'Top / Nurture Everyday' }).isVisible());
  await page.keyboard.press('Escape');
  assert(await page.locator('dialog[open]').count() === 0);
  report.workflows.gallery = true;

  await page.getByRole('tab', { name: 'Nutrition', exact: true }).click();
  assert((await page.getByRole('tabpanel').innerText()).includes('[Nutrition facts pending]'));
  await page.keyboard.press('ArrowRight');
  assert(await page.getByRole('tab', { name: 'Ingredients', exact: true }).getAttribute('aria-selected') === 'true');
  report.workflows.tabs = true;
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).click();
  await page.getByRole('button', { name: 'Add to bag', exact: true }).click();
  assert(await page.getByRole('dialog', { name: 'Your bag (2)' }).isVisible());
  assert(await page.getByRole('button', { name: 'Checkout pending' }).isDisabled());
  await page.getByRole('button', { name: 'Increase bag quantity' }).click();
  await page.screenshot({ path: path.join(output, 'desktop-bag.png') });
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open bag, 3 items' }).click();
  assert(await page.getByRole('dialog', { name: 'Your bag (3)' }).isVisible());
  await page.getByRole('button', { name: 'Remove Nurture Everyday from bag' }).click();
  assert(await page.getByText('Your bag is waiting for its everyday.').isVisible());
  await page.keyboard.press('Escape');
  report.workflows.bag = { add: true, quantity: true, persisted: true, remove: true, checkoutDisabled: true };

  await jump(page, '#questions');
  await page.getByText('What are the ingredients and allergens?', { exact: true }).click();
  assert((await page.locator('details[open]').innerText()).includes('[Ingredients and allergens pending]'));
  report.workflows.faq = true;
  await fullReveal(page);
  const offscreenCount = await page.locator('.product-scene canvas').getAttribute('data-render-count');
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('.product-scene canvas').getAttribute('data-render-count'), offscreenCount, 'Offscreen scene should be paused');
  report.scene.offscreenRenderPaused = true;
  await page.screenshot({ path: path.join(output, 'desktop-full.png'), fullPage: true });
  await page.getByRole('button', { name: 'Switch to dark appearance' }).click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(output, 'desktop-dark.png') });
  assert(await page.locator('html').getAttribute('data-theme') === 'dark');
  await page.getByRole('button', { name: 'Switch to light appearance' }).click();
  report.workflows.theme = true;

  for (const viewport of [{ width: 2560, height: 1080 }, { width: 1920, height: 1080 }, { width: 1280, height: 720 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 360, height: 740 }, { width: 320, height: 900 }]) {
    const mobile = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    observe(mobile);
    await mobile.goto(url, { waitUntil: 'networkidle' });
    await mobile.screenshot({ path: path.join(output, `hero-${viewport.width}.png`) });
    const noOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    assert(noOverflow, `Overflow at ${viewport.width}px`);
    if (viewport.width <= 768) {
      await mobile.getByRole('button', { name: 'Open navigation' }).click();
      await mobile.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Discover Nurture' }).click();
      await mobile.waitForTimeout(2300);
      assert(await mobile.locator('dialog[open]').count() === 0);
    }
    await jump(mobile, '#inside');
    await mobile.waitForSelector('.product-scene canvas[data-ready="true"]');
    await mobile.waitForTimeout(600);
    const pixels = await scenePixels(mobile, `scene-${viewport.width}`);
    await mobile.screenshot({ path: path.join(output, `story-${viewport.width}.png`) });
    await fullReveal(mobile);
    await mobile.screenshot({ path: path.join(output, `full-${viewport.width}.png`), fullPage: true });
    const brokenImages = await mobile.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src));
    assert.equal(brokenImages.length, 0);
    report.viewports.push({ ...viewport, noOverflow, brokenImages, pixels });
    await mobile.close();
  }

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  observe(reduced);
  await reduced.goto(url, { waitUntil: 'networkidle' });
  await jump(reduced, '#inside');
  assert(await reduced.locator('.scene-poster').first().isVisible());
  assert(await reduced.locator('.product-scene canvas[data-ready="true"]').count() === 0);
  assert(await reduced.locator('html.lenis').count() === 0);
  await reduced.getByRole('button', { name: 'The details', exact: true }).click();
  assert(await reduced.getByText('Care, in every detail.', { exact: true }).isVisible());
  await reduced.screenshot({ path: path.join(output, 'reduced-motion.png') });
  report.workflows.reducedMotion = true;
  await reduced.close();

  const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await noJs.goto(url, { waitUntil: 'networkidle' });
  assert(await noJs.getByRole('heading', { name: 'Nurture Everyday', exact: true }).count() > 0);
  assert(await noJs.getByRole('link', { name: 'View all product images' }).isVisible());
  report.workflows.noJavaScript = true;
  await noJs.screenshot({ path: path.join(output, 'no-javascript.png'), fullPage: true });
  await noJs.close();
  const fallback = await browser.newPage({ viewport: { width: 390, height: 844 } });
  observe(fallback);
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') return null;
      return original.call(this, type, ...args);
    };
  });
  await fallback.goto(url, { waitUntil: 'networkidle' });
  await jump(fallback, '#inside');
  assert(await fallback.locator('.scene-poster').first().isVisible());
  assert(await fallback.locator('.product-scene canvas[data-ready="true"]').count() === 0);
  await fallback.screenshot({ path: path.join(output, 'webgl-fallback.png') });
  report.workflows.webglFallback = true;
  await fallback.close();
  assert.equal(errors.length, 0, errors.join('\n'));
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  throw error;
} finally {
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}
