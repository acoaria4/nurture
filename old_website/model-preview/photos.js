import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createNurtureTin, disposeObject } from './model.js';

export const PHOTO_SHOTS = Object.freeze([
  { id: 'front', title: 'Front', angle: 'front' },
  { id: 'three-quarter', title: 'Three Quarter', angle: 'three-quarter' },
  { id: 'back', title: 'Back', angle: 'back' },
  { id: 'side', title: 'Side', angle: 'side' },
  { id: 'top', title: 'Top', angle: 'top' },
  { id: 'open-lid', title: 'Open Lid', angle: 'three-quarter', open: true },
  { id: 'lid-detail', title: 'Lid Detail', angle: 'detail' },
  { id: 'front-transparent', title: 'Front Cutout', angle: 'front', transparent: true },
  { id: 'angle-transparent', title: 'Angled Cutout', angle: 'three-quarter', transparent: true },
]);

export async function renderProductPhoto(shot, { width = 1600, height = 2000 } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  const scene = new THREE.Scene();
  scene.background = shot.transparent ? null : new THREE.Color('#f4f5f2');
  renderer.setClearColor('#f4f5f2', shot.transparent ? 0 : 1);
  let environment;

  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    environment = pmrem.fromScene(room, 0.035);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.85;
    room.dispose();
    pmrem.dispose();

    const tin = await createNurtureTin({ maxAnisotropy: Math.min(renderer.capabilities.getMaxAnisotropy(), 16) });
    scene.add(tin);
    const lid = tin.getObjectByName('Removable gold lid');
    if (shot.open) {
      lid.position.y += 0.052;
      lid.position.x -= 0.008;
      lid.rotation.z = 0.04;
    }

    scene.add(new THREE.HemisphereLight('#ffffff', '#c9c9b6', 0.7));
    const key = new THREE.DirectionalLight('#fff8ee', 2.3);
    key.position.set(-0.2, 0.35, 0.35);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -0.3, right: 0.3, top: 0.3, bottom: -0.3, near: 0.01, far: 1 });
    key.shadow.bias = -0.000008;
    key.shadow.normalBias = 0.00015;
    key.shadow.radius = 5;
    key.shadow.blurSamples = 8;
    scene.add(key);
    const fill = new THREE.DirectionalLight('#eef3ff', 0.7);
    fill.position.set(0.25, 0.1, 0.25);
    scene.add(fill);
    const rim = new THREE.DirectionalLight('#fff4dc', 1.2);
    rim.position.set(0.15, 0.2, -0.2);
    scene.add(rim);
    if (!shot.transparent) {
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShadowMaterial({ color: '#525549', opacity: 0.18 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.083;
      floor.receiveShadow = true;
      scene.add(floor);
    }

    const viewHeight = shot.open ? 0.31 : shot.angle === 'top' ? 0.15 : shot.angle === 'detail' ? 0.145 : 0.235;
    const viewWidth = viewHeight * width / height;
    const camera = new THREE.OrthographicCamera(-viewWidth / 2, viewWidth / 2, viewHeight / 2, -viewHeight / 2, 0.001, 5);
    const target = new THREE.Vector3(0, shot.open ? 0.024 : shot.angle === 'detail' ? 0.069 : 0, 0);
    const positions = {
      front: [0, 0.025, 0.45],
      'three-quarter': [0.25, 0.075, 0.45],
      back: [0, 0.025, -0.45],
      side: [0.45, 0.03, 0],
      top: [0, 0.45, 0.00001],
      detail: [0.17, 0.24, 0.35],
    };
    camera.position.fromArray(positions[shot.angle]);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
    tin.updateMatrixWorld(true);
    renderer.render(scene, camera);
    const box = new THREE.Box3().setFromObject(tin);
    let framed = true;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const point = new THREE.Vector3(x, y, z).project(camera);
      if (Math.abs(point.x) > 0.98 || Math.abs(point.y) > 0.98) framed = false;
    }
    const blob = await new Promise((resolve, reject) => renderer.domElement.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('Photo render could not be encoded'));
    }, 'image/png'));
    return { blob, metadata: { id: shot.id, width, height, framed, transparent: Boolean(shot.transparent), openLid: Boolean(shot.open), modelVersion: 2, source: 'Rendered directly from complete 3D model' } };
  } finally {
    disposeObject(scene);
    environment?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
}
