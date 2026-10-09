import { useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createNurtureTin, disposeObject } from '../../model-preview/model.js';
import { poster } from '../assets';

export default function ProductScene({ progress }: { progress: RefObject<number> }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = host.current!;
    const surface = canvas.current!;
    let disposed = false;
    let visible = false;
    let frame = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let scene: THREE.Scene | undefined;
    let tin: THREE.Object3D | undefined;
    let environment: THREE.WebGLRenderTarget | undefined;
    let resize: ResizeObserver | undefined;
    let contextLost = false;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const lost = (event: Event) => { event.preventDefault(); contextLost = true; stop(); surface.dataset.ready = 'false'; setReady(false); };
    surface.addEventListener('webglcontextlost', lost);
    let requestFrame = () => {};
    const onScroll = () => requestFrame();
    window.addEventListener('scroll', onScroll, { passive: true });
    const visibility = () => { if (document.hidden || motion.matches) stop(); else requestFrame(); };
    document.addEventListener('visibilitychange', visibility);
    motion.addEventListener('change', visibility);
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) requestFrame(); else stop();
    }, { rootMargin: '80px' });
    observer.observe(element);
    async function init() {
      try {
        if (motion.matches) return;
        const context = surface.getContext('webgl2', { alpha: true, antialias: true });
        if (!context) return;
        renderer = new THREE.WebGLRenderer({ canvas: surface, context, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.97;
        scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 0.001, 10);
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        environment = pmrem.fromScene(room, 0.04);
        scene.environment = environment.texture;
        scene.environmentIntensity = 0.72;
        room.dispose(); pmrem.dispose();
        scene.add(new THREE.HemisphereLight('#ffffff', '#9fb1a2', 1));
        const key = new THREE.DirectionalLight('#fff7df', 2);
        key.position.set(-0.15, 0.3, 0.35); scene.add(key);
        const fill = new THREE.DirectionalLight('#ffffff', 0.8);
        fill.position.set(0.3, 0.05, 0.2); scene.add(fill);
        const rim = new THREE.DirectionalLight('#fff0d5', 1.5);
        rim.position.set(0.15, 0.25, -0.2); scene.add(rim);
        tin = await createNurtureTin({ maxAnisotropy: Math.min(renderer.capabilities.getMaxAnisotropy(), 8) });
        if (disposed) { disposeObject(tin); return; }
        scene.add(tin);
        const lid = tin.getObjectByName('Removable gold lid')!;
        let distance = 0.47;
        const resizeScene = () => {
          if (disposed) return;
          const { width, height } = element.getBoundingClientRect();
          renderer!.setSize(width, height, false);
          camera.aspect = width / Math.max(height, 1);
          distance = Math.max(0.47, 0.25 / Math.max(camera.aspect, 0.5));
          camera.updateProjectionMatrix();
          requestFrame();
        };
        const render = () => {
          frame = 0;
          if (disposed || !visible || document.hidden || contextLost || motion.matches) return;
          const p = THREE.MathUtils.clamp(progress.current, 0, 1);
          // One continuous product journey: front, full wrap, then removable lid.
          tin!.rotation.y = p < 0.7 ? p / 0.7 * Math.PI * 2 : Math.PI * 2 + (p - 0.7) * 1.1;
          tin!.rotation.z = -0.035;
          lid.position.y = 0.078 + Math.max(0, (p - 0.72) / 0.28) * 0.052;
          camera.position.set(0, 0.035 + Math.max(0, p - 0.72) * 0.055, distance + Math.max(0, p - 0.72) / 0.28 * 0.07);
          camera.lookAt(0, p > 0.72 ? 0.018 : 0, 0);
          renderer!.render(scene!, camera);
          surface.dataset.progress = p.toFixed(3);
          surface.dataset.renderCount = String(Number(surface.dataset.renderCount || 0) + 1);
          if (surface.dataset.ready !== 'true') { surface.dataset.ready = 'true'; setReady(true); }
        };
        requestFrame = () => { if (!frame && !disposed && visible && !document.hidden && !motion.matches && !contextLost) frame = requestAnimationFrame(render); };
        resize = new ResizeObserver(resizeScene);
        resize.observe(element); resizeScene();
        requestFrame();
      } catch {
        if (!disposed) {
          stop(); setReady(false);
          if (scene) disposeObject(scene);
          environment?.dispose(); renderer?.dispose();
        }
      }
    }
    init();
    return () => {
      disposed = true; stop(); observer.disconnect(); resize?.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('scroll', onScroll);
      motion.removeEventListener('change', visibility);
      surface.removeEventListener('webglcontextlost', lost);
      if (scene) disposeObject(scene);
      environment?.dispose(); renderer?.dispose();
    };
  }, [progress]);
  return <div className="product-scene" ref={host}>
    <img className={`scene-poster ${ready ? 'is-hidden' : ''}`} src={poster} alt="Nurture Everyday concept tin, gold lid and illustrated full label" />
    <canvas ref={canvas} className={ready ? 'is-ready' : ''} aria-label="Scroll-controlled Nurture Everyday 3D concept tin" role="img" />
  </div>;
}
