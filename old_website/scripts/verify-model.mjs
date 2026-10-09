import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'verification');
const baseUrl = process.env.PREVIEW_URL || 'http://127.0.0.1:4173/model-preview/';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : {}),
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
});
const errors = [];
const report = { url: baseUrl, viewports: [], interactions: {}, model: {} };

async function ready(page) {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.nurturePreview?.ready === true);
}

async function canvasPixels(page) {
  const png = await page.locator('#model-canvas').screenshot();
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const colors = new Set();
  let productPixels = 0;
  for (let y = Math.round(info.height * 0.15); y < info.height * 0.85; y += 4) {
    for (let x = Math.round(info.width * 0.35); x < info.width * 0.65; x += 4) {
      const index = (y * info.width + x) * info.channels;
      const [r, g, b] = [data[index], data[index + 1], data[index + 2]];
      colors.add(`${r >> 3},${g >> 3},${b >> 3}`);
      if (r - b > 20 || r < 130 && g < 130 && b < 130) productPixels++;
    }
  }
  assert(colors.size > 40, `Canvas is too uniform (${colors.size} colors)`);
  assert(productPixels > 300, `Insufficient visible gold/label pixels (${productPixels})`);
  return { distinctQuantizedColors: colors.size, productPixels };
}

async function frameInfo(page) {
  return page.evaluate(async () => {
    const { model, camera, renderer, math: THREE } = window.nurturePreview;
    model.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const corners = [];
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const projected = new THREE.Vector3(x, y, z).project(camera);
      corners.push({ x: projected.x, y: projected.y });
    }
    return {
      width: renderer.domElement.clientWidth, height: renderer.domElement.clientHeight,
      overflow: document.documentElement.scrollWidth > innerWidth,
      framed: corners.every(({ x, y }) => Math.abs(x) < 0.97 && Math.abs(y) < 0.97),
      dimensions: box.getSize(new THREE.Vector3()).toArray(),
      canvasVisible: getComputedStyle(renderer.domElement).visibility === 'visible',
      corners,
    };
  });
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await ready(page);
  await page.screenshot({ path: path.join(output, 'desktop-front.png'), fullPage: true });
  const desktop = await frameInfo(page);
  assert(desktop.framed && !desktop.overflow && desktop.canvasVisible, 'Desktop model framing failed');
  report.viewports.push({ device: 'desktop', ...desktop, pixels: await canvasPixels(page) });

  const startPosition = await page.evaluate(() => window.nurturePreview.camera.position.toArray());
  await page.getByRole('button', { name: 'Side', exact: true }).click();
  await page.waitForFunction(() => Math.abs(window.nurturePreview.camera.position.z) < 0.005);
  const sidePosition = await page.evaluate(() => window.nurturePreview.camera.position.toArray());
  assert.notDeepEqual(startPosition, sidePosition);
  await page.screenshot({ path: path.join(output, 'desktop-side.png'), fullPage: true });
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.waitForFunction(() => window.nurturePreview.camera.position.z < -0.38);
  await page.screenshot({ path: path.join(output, 'desktop-back.png'), fullPage: true });
  await page.getByRole('button', { name: 'Top', exact: true }).click();
  await page.waitForFunction(() => window.nurturePreview.camera.position.y > 0.38);
  await page.screenshot({ path: path.join(output, 'desktop-top.png'), fullPage: true });
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await page.waitForFunction(() => window.nurturePreview.camera.position.z > 0.38);
  report.interactions.presetViews = true;

  const beforeRotate = await page.evaluate(() => window.nurturePreview.camera.position.toArray());
  await page.getByRole('button', { name: 'Start automatic rotation', exact: true }).click();
  await page.waitForFunction((position) => Math.abs(window.nurturePreview.camera.position.x - position[0]) > 0.025, beforeRotate);
  await page.getByRole('button', { name: 'Stop automatic rotation', exact: true }).click();
  report.interactions.autoRotation = true;

  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await page.waitForFunction(() => Math.abs(window.nurturePreview.camera.position.x) < 0.005);
  const beforeDrag = await page.evaluate(() => window.nurturePreview.camera.position.toArray());
  const bounds = await page.locator('#model-canvas').boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 120, bounds.y + bounds.height / 2 + 20, { steps: 12 });
  await page.mouse.up();
  const afterDrag = await page.evaluate(() => window.nurturePreview.camera.position.toArray());
  assert.notDeepEqual(beforeDrag, afterDrag);
  report.interactions.pointerOrbit = true;

  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await page.waitForFunction(() => Math.abs(window.nurturePreview.camera.position.x) < 0.005);
  const initialDistance = await page.evaluate(() => window.nurturePreview.camera.position.length());
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  const zoomDistance = await page.evaluate(() => window.nurturePreview.camera.position.length());
  assert(zoomDistance < initialDistance);
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  report.interactions.zoom = true;

  await page.locator('#light').selectOption('daylight');
  assert.equal(await page.evaluate(() => window.nurturePreview.renderer.toneMappingExposure), 1);
  await page.locator('#light').selectOption('soft');
  assert.equal(await page.evaluate(() => window.nurturePreview.renderer.toneMappingExposure), 1.03);
  await page.locator('#light').selectOption('studio');
  report.interactions.lighting = true;

  await page.locator('#model-canvas').focus();
  const beforeKey = await page.evaluate(() => window.nurturePreview.camera.position.x);
  await page.keyboard.press('ArrowRight');
  assert.notEqual(await page.evaluate(() => window.nurturePreview.camera.position.x), beforeKey);
  await page.keyboard.press('Home');
  await page.waitForFunction(() => Math.abs(window.nurturePreview.camera.position.x) < 0.005);
  report.interactions.keyboard = true;

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export').click();
  const download = await downloadPromise;
  const modelPath = path.join(root, 'assets', '3d', 'nurture-everyday-complete-concept-v2.glb');
  await download.saveAs(modelPath);
  const modelBuffer = await readFile(modelPath);
  assert.equal(modelBuffer.toString('ascii', 0, 4), 'glTF');
  assert.equal(modelBuffer.readUInt32LE(4), 2);
  assert.equal(modelBuffer.readUInt32LE(8), modelBuffer.length);
  const jsonSize = modelBuffer.readUInt32LE(12);
  const gltf = JSON.parse(modelBuffer.toString('utf8', 20, 20 + jsonSize).trim());
  assert(gltf.meshes.length >= 10);
  assert(gltf.images.length >= 2);
  assert(gltf.images.every((image) => Number.isInteger(image.bufferView)), 'GLB textures must be embedded');
  report.model = { bytes: modelBuffer.length, meshes: gltf.meshes.length, materials: gltf.materials.length, embeddedImages: gltf.images.length };
  const loaded = await page.evaluate(async () => {
    const { GLTFLoader } = await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js');
    const result = await new GLTFLoader().loadAsync('/assets/3d/nurture-everyday-complete-concept-v2.glb');
    let meshes = 0;
    result.scene.traverse((part) => { if (part.isMesh) meshes++; });
    const metadata = result.scene.children[0].userData;
    return { meshes, metadata };
  });
  assert.equal(loaded.meshes, report.model.meshes);
  assert.equal(loaded.metadata.status, 'concept');
  assert.equal(loaded.metadata.version, 2);
  report.model.roundTripLoad = true;
  report.model.metadata = loaded.metadata;
  await page.getByRole('button', { name: 'Open lid', exact: true }).click();
  assert.equal(await page.evaluate(() => Number(window.nurturePreview.model.getObjectByName('Removable gold lid').position.y.toFixed(3))), 0.128);
  assert((await frameInfo(page)).framed, 'Open lid should remain framed');
  await page.screenshot({ path: path.join(output, 'desktop-open-lid.png'), fullPage: true });
  await page.getByRole('button', { name: 'Close lid', exact: true }).click();
  assert.equal(await page.evaluate(() => window.nurturePreview.model.getObjectByName('Removable gold lid').position.y), 0.078);
  report.interactions.removableLid = true;

  const snapshotPromise = page.waitForEvent('download');
  await page.locator('#snapshot').click();
  await (await snapshotPromise).saveAs(path.join(output, 'model-front-render.png'));
  report.interactions.pngExport = true;

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ready(mobile);
  await mobile.screenshot({ path: path.join(output, 'mobile-front.png'), fullPage: true });
  const mobileFrame = await frameInfo(mobile);
  assert(mobileFrame.framed && !mobileFrame.overflow, 'Mobile framing failed');
  report.viewports.push({ device: 'mobile', ...mobileFrame, pixels: await canvasPixels(mobile) });
  await mobile.getByRole('button', { name: 'Side', exact: true }).tap();
  await mobile.waitForFunction(() => Math.abs(window.nurturePreview.camera.position.z) < 0.005);
  report.interactions.touchControls = true;
  await mobile.setViewportSize({ width: 360, height: 740 });
  await mobile.getByRole('button', { name: 'Reset view', exact: true }).tap();
  await mobile.waitForFunction(() => window.nurturePreview.camera.position.z > 0.38);
  assert(!(await frameInfo(mobile)).overflow, 'Small mobile horizontal overflow');
  await mobile.screenshot({ path: path.join(output, 'mobile-small.png'), fullPage: true });
  await mobile.setViewportSize({ width: 320, height: 900 });
  await mobile.getByRole('button', { name: 'Reset view', exact: true }).tap();
  await mobile.waitForFunction(() => Math.abs(window.nurturePreview.camera.position.x) < 0.005);
  const narrowFrame = await frameInfo(mobile);
  assert(narrowFrame.framed && !narrowFrame.overflow, 'Tall narrow mobile framing failed');
  await mobile.screenshot({ path: path.join(output, 'mobile-narrow.png'), fullPage: true });
  report.viewports.push({ device: 'mobile-narrow', ...narrowFrame, pixels: await canvasPixels(mobile) });

  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ready(reduced);
  assert.equal(await reduced.evaluate(() => window.nurturePreview.controls.autoRotate), false);
  assert.equal(await reduced.evaluate(() => window.nurturePreview.controls.enableDamping), false);
  await reduced.getByRole('button', { name: 'Side', exact: true }).click();
  await reduced.waitForFunction(() => Math.abs(window.nurturePreview.camera.position.z) < 0.005);
  report.interactions.reducedMotion = true;

  assert.deepEqual(errors, [], 'Browser errors occurred');
  report.browserErrors = errors;
  report.passed = true;
  await writeFile(path.join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ passed: true, model: report.model, interactions: report.interactions, viewports: report.viewports.map(({ device, width, height, pixels }) => ({ device, width, height, pixels })) }, null, 2));
} catch (error) {
  report.passed = false;
  report.error = error.stack;
  report.browserErrors = errors;
  await writeFile(path.join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  throw error;
} finally { await browser.close(); }
