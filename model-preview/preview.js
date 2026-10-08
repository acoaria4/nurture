import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createIcons, Rotate3d, RotateCcw, ZoomOut, ZoomIn, Download, Camera } from 'lucide';
import { createNurtureTin, disposeObject } from './model.js';

createIcons({ icons: { Rotate3d, RotateCcw, ZoomOut, ZoomIn, Download, Camera } });

const canvas = document.querySelector('#model-canvas');
const viewport = document.querySelector('.viewport');
const fallback = document.querySelector('#fallback');
const rotationButton = document.querySelector('#rotate');
const exportButton = document.querySelector('#export');
const snapshotButton = document.querySelector('#snapshot');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const viewButtons = [...document.querySelectorAll('[data-view]')];
let renderer;
let tin;
let controls;
let environmentTarget;
let frame;
let previousTime = 0;
let visible = true;
let disposed = false;
let cameraTween;
let toastTimeout;

function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { toast.hidden = true; }, 3200);
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportBinary() {
  const originalRotation = tin.rotation.clone();
  tin.rotation.set(0, 0, 0);
  tin.updateMatrixWorld(true);
  try {
    return await new GLTFExporter().parseAsync(tin, { binary: true, onlyVisible: true });
  } finally {
    tin.rotation.copy(originalRotation);
    tin.updateMatrixWorld(true);
  }
}

async function start() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.96;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f4f5f2');
  const camera = new THREE.PerspectiveCamera(33, 1, 0.001, 10);
  camera.position.set(0, 0.035, 0.39);
  let viewDistance = 0.39;
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.enablePan = false;
  controls.minDistance = 0.23;
  controls.maxDistance = 0.62;
  controls.minPolarAngle = 0.045;
  controls.maxPolarAngle = Math.PI * 0.82;
  controls.autoRotateSpeed = 1.15;
  controls.target.set(0, 0, 0);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  environmentTarget = pmrem.fromScene(room, 0.04);
  scene.environment = environmentTarget.texture;
  scene.environmentIntensity = 0.62;
  room.dispose();
  pmrem.dispose();

  const hemisphere = new THREE.HemisphereLight('#ffffff', '#b4bda5', 0.9);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight('#fff5e4', 1.8);
  key.position.set(-0.2, 0.3, 0.25);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -0.2, right: 0.2, top: 0.2, bottom: -0.2, near: 0.01, far: 1 });
  key.shadow.normalBias = 0.00015;
  key.shadow.bias = -0.00001;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#e2edff', 0.55);
  fill.position.set(0.25, 0.08, 0.12);
  scene.add(fill);
  const rim = new THREE.DirectionalLight('#fff1d6', 1.25);
  rim.position.set(0.1, 0.2, -0.22);
  scene.add(rim);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ color: '#55644d', opacity: 0.14 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.083;
  floor.receiveShadow = true;
  scene.add(floor);

  tin = await createNurtureTin({ maxAnisotropy: Math.min(renderer.capabilities.getMaxAnisotropy(), 8) });
  scene.add(tin);
  fallback.hidden = true;
  exportButton.disabled = snapshotButton.disabled = false;
  canvas.setAttribute('aria-label', 'Nurture Everyday concept tin. Use arrow keys to rotate and plus or minus to zoom.');

  function selectView(name) {
    viewButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === name)));
    document.querySelector('#view-name').textContent = name.toUpperCase();
  }

  function setRotation(value) {
    controls.autoRotate = value;
    rotationButton.setAttribute('aria-pressed', String(value));
    rotationButton.setAttribute('aria-label', value ? 'Stop automatic rotation' : 'Start automatic rotation');
    requestFrame();
  }

  function goToView(name) {
    setRotation(false);
    controls.enableDamping = false;
    controls.update();
    selectView(name);
    const positions = {
      front: new THREE.Vector3(0, viewDistance * 0.09, viewDistance),
      side: new THREE.Vector3(viewDistance, viewDistance * 0.09, 0),
      back: new THREE.Vector3(0, viewDistance * 0.09, -viewDistance),
      top: new THREE.Vector3(0, viewDistance, 0.02),
    };
    cameraTween = { from: camera.position.clone(), to: positions[name], started: performance.now(), duration: motionPreference.matches ? 0 : 550 };
    requestFrame();
  }

  function zoom(multiplier) {
    cameraTween = null;
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() * multiplier, controls.minDistance, controls.maxDistance));
    camera.position.copy(controls.target).add(offset);
    controls.update();
    requestFrame();
  }

  function draw(now) {
    frame = undefined;
    if (disposed || document.hidden || !visible) return;
    const delta = previousTime ? Math.min((now - previousTime) / 1000, 0.05) : 1 / 60;
    previousTime = now;
    if (cameraTween) {
      const progress = cameraTween.duration === 0 ? 1 : Math.min((now - cameraTween.started) / cameraTween.duration, 1);
      camera.position.lerpVectors(cameraTween.from, cameraTween.to, 1 - (1 - progress) ** 3);
      if (progress === 1) {
        cameraTween = null;
        controls.enableDamping = !motionPreference.matches;
      }
    }
    controls.update(delta);
    renderer.render(scene, camera);
    if (controls.autoRotate || cameraTween || !motionPreference.matches) requestFrame();
  }

  function requestFrame() {
    if (!frame && !disposed && visible && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function resize() {
    const { width, height } = viewport.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const nextDistance = Math.max(0.39, 0.065 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect) + 0.07);
    const scale = nextDistance / viewDistance;
    camera.position.sub(controls.target).multiplyScalar(scale).add(controls.target);
    viewDistance = nextDistance;
    controls.minDistance = 0.23 * viewDistance / 0.39;
    controls.maxDistance = 0.62 * viewDistance / 0.39;
    camera.updateProjectionMatrix();
    requestFrame();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    previousTime = 0;
    requestFrame();
  });
  visibilityObserver.observe(viewport);

  function visibilityChanged() { previousTime = 0; requestFrame(); }
  document.addEventListener('visibilitychange', visibilityChanged);
  controls.addEventListener('change', requestFrame);
  controls.addEventListener('start', () => {
    cameraTween = null;
    controls.enableDamping = !motionPreference.matches;
    selectView('custom');
  });
  viewButtons.forEach((button) => button.addEventListener('click', () => goToView(button.dataset.view)));
  rotationButton.addEventListener('click', () => { cameraTween = null; selectView('orbit'); setRotation(!controls.autoRotate); });
  document.querySelector('#reset').addEventListener('click', () => goToView('front'));
  document.querySelector('#zoom-in').addEventListener('click', () => zoom(0.88));
  document.querySelector('#zoom-out').addEventListener('click', () => zoom(1.12));
  document.querySelector('#light').addEventListener('change', (event) => {
    const presets = {
      studio: { exposure: 0.96, key: 1.8, fill: 0.55, environment: 0.62, color: '#fff5e4' },
      daylight: { exposure: 1, key: 2.2, fill: 0.65, environment: 0.66, color: '#ffffff' },
      soft: { exposure: 1.03, key: 0.75, fill: 0.4, environment: 0.75, color: '#fff7ed' },
    };
    const preset = presets[event.target.value];
    renderer.toneMappingExposure = preset.exposure;
    key.intensity = preset.key;
    key.color.set(preset.color);
    fill.intensity = preset.fill;
    scene.environmentIntensity = preset.environment;
    requestFrame();
  });
  exportButton.addEventListener('click', async () => {
    exportButton.disabled = true;
    try {
      download(new Blob([await exportBinary()], { type: 'model/gltf-binary' }), 'nurture-everyday-concept-v1.glb');
      notify('Model exported');
    } catch (error) { console.error(error); notify('Export failed. Please try again.'); }
    finally { exportButton.disabled = false; }
  });
  snapshotButton.addEventListener('click', () => {
    renderer.render(scene, camera);
    canvas.toBlob((blob) => {
      if (blob) { download(blob, 'nurture-everyday-view.png'); notify('Image saved'); }
    }, 'image/png');
  });
  canvas.addEventListener('keydown', (event) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    setRotation(false);
    cameraTween = null;
    if (event.key === 'Home') return goToView('front');
    if (event.key === '+' || event.key === '=') return zoom(0.88);
    if (event.key === '-') return zoom(1.12);
    const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    if (event.key === 'ArrowLeft') spherical.theta -= 0.12;
    if (event.key === 'ArrowRight') spherical.theta += 0.12;
    if (event.key === 'ArrowUp') spherical.phi -= 0.1;
    if (event.key === 'ArrowDown') spherical.phi += 0.1;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, controls.minPolarAngle, controls.maxPolarAngle);
    camera.position.setFromSpherical(spherical).add(controls.target);
    controls.update();
    selectView('custom');
    requestFrame();
  });
  function motionChanged() {
    if (motionPreference.matches) { controls.enableDamping = false; cameraTween = null; setRotation(false); }
    else controls.enableDamping = true;
    requestFrame();
  }
  motionPreference.addEventListener('change', motionChanged);
  controls.enableDamping = !motionPreference.matches;

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    fallback.hidden = false;
    document.querySelector('#loading-message').textContent = '3D view interrupted. Reload to restore.';
    exportButton.disabled = snapshotButton.disabled = true;
    disposed = true;
  });

  window.nurturePreview = {
    ready: true, model: tin, camera, renderer, scene, controls, THREE,
    exportBinary, goToView, render: () => renderer.render(scene, camera),
  };
  resize();
  requestFrame();

  window.addEventListener('pagehide', () => {
    disposed = true;
    cancelAnimationFrame(frame);
    clearTimeout(toastTimeout);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange', visibilityChanged);
    motionPreference.removeEventListener('change', motionChanged);
    controls.dispose();
    disposeObject(scene);
    environmentTarget.dispose();
    renderer.dispose();
  }, { once: true });
}

start().catch((error) => {
  console.error(error);
  renderer?.dispose();
  fallback.hidden = false;
  document.querySelector('#loading-message').textContent = '3D preview unavailable. Product reference shown.';
  canvas.style.visibility = 'hidden';
  document.querySelectorAll('.toolbar button, .toolbar select').forEach((element) => { element.disabled = true; });
});
