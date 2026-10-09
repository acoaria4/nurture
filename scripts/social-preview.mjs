import { createRequire } from 'node:module';
import { readdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const origin = process.env.SITE_URL || 'http://127.0.0.1:4180/';
const files = await readdir(new URL('../dist/assets/', import.meta.url));
const display = files.find(file => file.startsWith('cormorant-garamond-latin-400-normal') && file.endsWith('.woff2'));
const italic = files.find(file => file.startsWith('cormorant-garamond-latin-400-italic') && file.endsWith('.woff2'));
const body = files.find(file => file.startsWith('manrope-latin-400-normal') && file.endsWith('.woff2'));
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<style>
  @font-face{font-family:Display;src:url('${origin}assets/${display}')}@font-face{font-family:Display;src:url('${origin}assets/${italic}');font-style:italic}@font-face{font-family:Body;src:url('${origin}assets/${body}')}
  *{box-sizing:border-box}body{margin:0;background:#faf7f0;color:#382a22}main{width:1200px;height:630px;padding:48px 58px;position:relative;font-family:Body}header{font-family:Display;font-size:36px;letter-spacing:-1px;display:flex;align-items:center;gap:25px}header span{font-family:Body;font-size:11px;letter-spacing:.5px;border-left:1px solid #d6c9b7;padding-left:25px}.copy{margin-top:70px;width:560px}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:1.5px}h1{font:400 87px/.96 Display;letter-spacing:-3px;margin:23px 0 26px}p{font-size:16px;line-height:1.7}.stage{position:absolute;right:54px;top:48px;width:426px;height:534px;background:#eee5d7;display:grid;place-items:center}.stage img{height:458px;width:290px;object-fit:contain}.note{position:absolute;bottom:45px;font-size:10px;letter-spacing:.5px;border-top:1px solid #d6c9b7;padding-top:16px;width:530px}
  </style><main><header>nurture<span>BY TRAYN NUTRITION</span></header><div class="copy"><span class="eyebrow">Nurture Everyday</span><h1>The everyday,<br/><i>considered.</i></h1><p>Everyday Nutrition for Every Woman.</p></div><div class="stage"><img src="${origin}media/hero.webp" alt="Nurture concept tin"/></div><div class="note">PRODUCT IN DEVELOPMENT / CGI PACKAGING CONCEPT</div></main>`);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
  const buffer = await page.screenshot({ type: 'png' });
  await sharp(buffer).jpeg({ quality: 92, mozjpeg: true }).toFile(new URL('../public/social-preview.jpg', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
  console.log('Created an original 1200 × 630 social card from the existing CGI cutout.');
} finally { await browser.close(); }
