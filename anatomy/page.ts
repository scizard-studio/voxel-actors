import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  createBody, createFace, expressions, faceBoxes, faceOptionsFor, colorOf, measureBody, isBodyRegion,
  type BodyRegionId, type Box, type ExpressionName, type FaceState, type JointName,
} from '../packages/characters/src';
import { renderInspector, formatVoxelCount } from './inspector';
import './style.css';

document.title = 'Character Anatomy';
document.body.innerHTML = `
  <header><div class="brand"><span class="brand-icon">◇</span> Character Anatomy</div><span class="badge">ANATOMY</span></header>
  <main><section class="viewport" aria-label="Interactive character body"><div class="stage-heading"><span class="eyebrow">THE FOUNDATION</span><h1>A closer look.</h1><p>Select a part to explore its anatomy.</p></div><div class="canvas-host"></div><div class="view-hint">Drag to rotate <span>·</span> Scroll to zoom</div></section>
  <aside aria-label="Body part information"><div class="inspector-content"><div class="panel-top"><span class="eyebrow">INSPECTOR</span><span class="status-dot"></span></div><div id="details" aria-live="polite"></div><div class="part-picker"><label for="part">BODY PART</label><select id="part"><option value="">Select a body part</option></select></div></div><footer class="panel-note">Original Studio body<br><span>Adult · Female · Voxel units</span><div id="total-voxels"></div></footer></aside></main>`;
const host = document.querySelector<HTMLDivElement>('.canvas-host')!;
const details = document.querySelector<HTMLDivElement>('#details')!;
const picker = document.querySelector<HTMLSelectElement>('#part')!;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
host.append(renderer.domElement);
const scene = new THREE.Scene();
const body = createBody({ age: 'adult', gender: 'female' });
const anatomy = measureBody(body);
const regions = new Map(anatomy.regions.map(region => [region.id, region]));
document.querySelector('#total-voxels')!.textContent = formatVoxelCount(anatomy.total.voxelVolume);
const joints = new Map<JointName, THREE.Vector3>();
for (const joint of body.joints) {
  joints.set(joint.name, new THREE.Vector3(...joint.at).add(joint.parent ? joints.get(joint.parent)! : new THREE.Vector3()));
}
const targets: THREE.Mesh<THREE.BoxGeometry, THREE.MeshLambertMaterial>[] = [];
function addBox(box: Box, joint: JointName, region: BodyRegionId, faceColor?: number) {
  const color = faceColor ?? colorOf(box);
  const material = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...box.size), material);
  mesh.position.copy(joints.get(joint)!).add(new THREE.Vector3(...box.at)).add(new THREE.Vector3(...box.size).multiplyScalar(0.5));
  mesh.userData.region = region;
  mesh.userData.baseColor = color;
  mesh.userData.highlight = faceColor === undefined;
  scene.add(mesh);
  mesh.updateMatrixWorld();
  targets.push(mesh);
  return mesh;
}

for (const part of body.parts) {
  for (const box of part.boxes) addBox(box, part.joint, box.region);
}

const face = createFace(body.head.face, faceOptionsFor(body.spec.gender));
const bodyMeshCount = targets.length;
function showFace(state?: FaceState): void {
  for (const mesh of targets.splice(bodyMeshCount)) {
    mesh.removeFromParent();
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  for (const block of faceBoxes(face, state)) addBox(block, face.joint, 'head', colorOf(block));
}
const expressionPicker = document.createElement('select');
expressionPicker.id = 'expression';
const expressionField = document.createElement('div');
expressionField.className = 'part-picker';
const expressionLabel = document.createElement('label');
expressionLabel.htmlFor = expressionPicker.id;
expressionLabel.textContent = 'Expression';
expressionField.append(expressionLabel, expressionPicker);
picker.closest('.part-picker')?.after(expressionField);
for (const [value, label] of [
  ['normal', 'Neutral'], ['happy', 'Happy'], ['smiling', 'Smiling'], ['sad', 'Sad'], ['blink', 'Blink'],
] as const) expressionPicker.add(new Option(label, value));
expressionPicker.addEventListener('change', () => {
  const value = expressionPicker.value as ExpressionName | 'blink';
  showFace(value === 'blink' ? { ...expressions.normal, eyes: 'closed' } : expressions[value]);
});
showFace();
for (const region of anatomy.regions) {
  const prefix = region.parent ? '  ' : '';
  picker.add(new Option(prefix + region.label, region.id));
}
const SELECTION_COLOR = 0x77bcb0;
function select(id?: BodyRegionId): void {
  const region = id === undefined ? undefined : regions.get(id);
  for (const mesh of targets) {
    const selected = mesh.userData.highlight && region && isBodyRegion(mesh.userData.region as BodyRegionId, region.id);
    mesh.material.color.setHex(selected ? SELECTION_COLOR : mesh.userData.baseColor);
  }
  picker.value = region?.id ?? '';
  renderInspector(details, region);
}
picker.addEventListener('change', () => select(picker.value === '' ? undefined : picker.value as BodyRegionId));
select();
const camera = new THREE.OrthographicCamera(-24, 24, 24, -24, 0.1, 500);
camera.position.set(42, 31, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, body.height / 2, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minZoom = 0.65;
controls.maxZoom = 2;
controls.update();
scene.add(new THREE.HemisphereLight(0xffffff, 0xc2bfba, 2.1));
const sun = new THREE.DirectionalLight(0xfff3e0, 2.3);
sun.position.set(-60, 120, 80);
scene.add(sun);
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
function hit(event: PointerEvent): BodyRegionId | undefined {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(targets, false)[0]?.object.userData.region as BodyRegionId | undefined;
}
let start = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', e => { start.set(e.clientX, e.clientY); });
renderer.domElement.addEventListener('pointerup', e => { if (start.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) < 5) select(hit(e)); });
renderer.domElement.addEventListener('pointermove', e => { renderer.domElement.style.cursor = hit(e) ? 'pointer' : 'grab'; });
addEventListener('keydown', e => { if (e.key === 'Escape') select(); });
function resize(): void {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  const aspect = width / height;
  const frame = Math.max(body.height + 9, 23 / aspect);
  camera.left = -frame * aspect / 2;
  camera.right = frame * aspect / 2;
  camera.top = frame / 2;
  camera.bottom = -frame / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
new ResizeObserver(resize).observe(host);
resize();
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
