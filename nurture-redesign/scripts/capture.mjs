import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://127.0.0.1:4180/', { waitUntil: 'networkidle' });
for (const section of ['intention', 'object', 'details', 'development']) {
  await page.locator(`#${section}`).evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(1100);
  await page.locator(`#${section}`).screenshot({ path: `verification/desktop-${section}.png` });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:4180/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1400);
await page.screenshot({ path: 'verification/mobile-hero.png', fullPage: false });
await browser.close();
