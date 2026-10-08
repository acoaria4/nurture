import * as THREE from 'three';

export const TIN_DIMENSIONS = Object.freeze({
  bodyRadius: 0.05,
  bodyHeight: 0.156,
  labelHeight: 0.148,
  overallHeight: 0.166,
  overallDiameter: 0.106,
  unit: 'metres',
  estimated: true,
});

const labelUrl = new URL('../assets/3d/nurture-label-wrap-concept-v1.png', import.meta.url).href;

function turnedPart(name, profile, material) {
  const points = profile.map(([radius, height]) => new THREE.Vector2(radius, height));
  const mesh = new THREE.Mesh(new THREE.LatheGeometry(points, 192), material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function rolledEdge(name, radius, thickness, height, material) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 12, 192), material);
  mesh.name = name;
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = height;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function brushedSurface() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const pixels = context.createImageData(size, size);
  const data = pixels.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const value = 158 + Math.round(Math.sin(y * 2.67) * 18 + Math.sin(x * 0.13 + y * 7.1) * 4);
      const offset = (y * size + x) * 4;
      data[offset] = data[offset + 1] = data[offset + 2] = value;
      data[offset + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

export async function createNurtureTin({ maxAnisotropy = 8 } = {}) {
  const label = await new THREE.TextureLoader().loadAsync(labelUrl);
  label.colorSpace = THREE.SRGBColorSpace;
  label.anisotropy = maxAnisotropy;
  label.wrapS = THREE.RepeatWrapping;

  const brushed = brushedSurface();
  const gold = new THREE.MeshPhysicalMaterial({
    name: 'Brushed champagne gold', color: '#c79558', metalness: 0.95,
    roughness: 0.48, roughnessMap: brushed, clearcoat: 0.16, clearcoatRoughness: 0.34,
  });
  const edgeGold = new THREE.MeshStandardMaterial({
    name: 'Polished gold rim', color: '#d5b477', metalness: 1, roughness: 0.27,
  });
  const steel = new THREE.MeshStandardMaterial({
    name: 'Brushed base steel', color: '#c4c3ba', metalness: 1, roughness: 0.35,
  });
  const paper = new THREE.MeshStandardMaterial({
    name: 'Ivory printed concept label', map: label, roughness: 0.86, metalness: 0,
  });
  const tin = new THREE.Group();
  tin.name = 'Nurture Everyday - concept tin';
  tin.userData = {
    status: 'concept', dimensions: TIN_DIMENSIONS,
    labelArtwork: 'Generated interpretation of user-provided product reference',
    sideAndBackArtwork: 'Pending; intentionally blank',
    sourceReference: 'trayn-nurture-everyday-marketing.png',
    frontDirection: '+Z',
  };

  tin.add(turnedPart('Metal can shell', [
    [0.0485, -0.078], [0.0496, -0.0775], [0.05, -0.075],
    [0.05, 0.074], [0.0497, 0.076], [0.0485, 0.078],
  ], steel));

  const wrapper = new THREE.Mesh(new THREE.CylinderGeometry(0.05012, 0.05012, 0.148, 192, 1, true), paper);
  wrapper.name = 'Full circumference printed label';
  // Cylinder UV midpoint faces -Z; turn it so the front artwork faces +Z.
  wrapper.rotation.y = Math.PI;
  wrapper.castShadow = true;
  wrapper.receiveShadow = true;
  tin.add(wrapper);

  const lid = new THREE.Group();
  lid.name = 'Removable gold lid';
  lid.add(turnedPart('Rolled lid skirt', [
    [0.0505, 0.0735], [0.052, 0.0735], [0.0528, 0.0742],
    [0.0528, 0.0807], [0.0525, 0.0821], [0.0516, 0.083],
    [0.0493, 0.083], [0.0488, 0.0822], [0.0488, 0.0815],
    [0.001, 0.0815],
  ], gold));
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.0489, 0.0489, 0.0008, 192), gold);
  top.name = 'Recessed lid face';
  top.position.y = 0.0815;
  top.castShadow = top.receiveShadow = true;
  lid.add(top);
  lid.add(rolledEdge('Upper lid bead', 0.0516, 0.00055, 0.0828, edgeGold));
  lid.add(rolledEdge('Lower lid lip', 0.0524, 0.0004, 0.074, edgeGold));
  lid.add(rolledEdge('Pressed lid ring', 0.0464, 0.0002, 0.082, gold));
  tin.add(lid);

  tin.add(turnedPart('Base rolled seam', [
    [0.0483, -0.0818], [0.0502, -0.0818], [0.051, -0.081],
    [0.0511, -0.0788], [0.0505, -0.0768], [0.0495, -0.0763],
  ], steel));
  tin.add(rolledEdge('Base seam highlight', 0.0505, 0.00045, -0.0795, steel));
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.0485, 0.0485, 0.001, 192), steel);
  base.name = 'Inset bottom disc';
  base.position.y = -0.0807;
  tin.add(base);
  return tin;
}

export function disposeObject(object) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  object.traverse((part) => {
    if (part.geometry) geometries.add(part.geometry);
    const list = Array.isArray(part.material) ? part.material : [part.material];
    for (const material of list) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}
