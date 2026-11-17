import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  createBody, createFace, expressions, faceBoxes, faceOptionsFor, colorOf, measureBody, isBodyRegion,
  type Age, type Gender, type BodyRegionId, type Box, type ExpressionName, type FaceState, type JointName,
} from '../../packages/voxel-actors/src';
import { renderInspector, formatVoxelCount } from './inspector';

document.title = 'Character Anatomy';
document.body.insertAdjacentHTML('beforeend', `
  <main class="workspace"><section class="workspace-stage" aria-label="Interactive character body"><div class="stage-heading"><h1>Character Anatomy</h1><p>Select a part to explore its anatomy.</p></div><div class="canvas-host"></div><div class="view-hint">Drag to rotate <span>·</span> Scroll to zoom</div></section>
  <aside class="workspace-panel" aria-label="Body part information"><div class="inspector-content"><div class="panel-top"><span class="eyebrow">INSPECTOR</span><span class="status-dot"></span></div><div class="inspector-controls"></div><div id="details" aria-live="polite"></div></div><footer class="panel-note">Original Studio body<br><span id="body-preset"></span><div id="total-voxels"></div></footer></aside></main>`);
const host = document.querySelector<HTMLDivElement>('.canvas-host')!;
const details = document.querySelector<HTMLDivElement>('#details')!;
const controlsPanel = document.querySelector('.inspector-controls')!;
function addPicker(label: string, choices: readonly (readonly [string, string])[], initial: string): HTMLSelectElement {
  const field = document.createElement('label');
  field.textContent = label;
  const input = document.createElement('select');
  for (const [value, text] of choices) input.add(new Option(text, value));
  input.value = initial;
  field.append(input);
  controlsPanel.append(field);
  return input;
}
const genderPicker = addPicker('Gender', [['female', 'Female'], ['male', 'Male']], 'female');
const agePicker = addPicker('Age', [
  ['child', 'Child'], ['teen', 'Teen'], ['adult', 'Adult'], ['elder', 'Elder'], ['aged', 'Aged'],
], 'adult');
const expressionPicker = addPicker('Expression', [
  ['normal', 'Neutral'], ['happy', 'Happy'], ['smiling', 'Smiling'], ['sad', 'Sad'], ['blink', 'Blink'],
], 'normal');
const picker = addPicker('Body part', [], '');
const bodyPreset = document.querySelector('#body-preset')!;
const totalVoxels = document.querySelector('#total-voxels')!;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
host.append(renderer.domElement);
const scene = new THREE.Scene();
function selectedBody() {
  return createBody({ age: agePicker.value as Age, gender: genderPicker.value as Gender });
}
let body = selectedBody();
let anatomy = measureBody(body);
let face = createFace(body.head.face, faceOptionsFor(body.spec.gender));
let bodyMeshCount = 0;
const joints = new Map<JointName, THREE.Vector3>();
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
}

function removeMeshes(from: number): void {
  for (const mesh of targets.splice(from)) {
    mesh.removeFromParent();
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
}
function showFace(): void {
  removeMeshes(bodyMeshCount);
  const value = expressionPicker.value as ExpressionName | 'blink';
  const state: FaceState = value === 'blink' ? { ...expressions.normal, eyes: 'closed' } : expressions[value];
  for (const block of faceBoxes(face, state)) addBox(block, face.joint, 'head', colorOf(block));
}
function rebuildBody(): void {
  const selectedRegion = picker.value as BodyRegionId;
  removeMeshes(0);
  body = selectedBody();
  face = createFace(body.head.face, faceOptionsFor(body.spec.gender));
  anatomy = measureBody(body);
  joints.clear();
  for (const joint of body.joints) {
    const position = new THREE.Vector3(...joint.at);
    if (joint.parent) position.add(joints.get(joint.parent)!);
    joints.set(joint.name, position);
  }
  for (const part of body.parts) {
    for (const box of part.boxes) addBox(box, part.joint, box.region);
  }
  bodyMeshCount = targets.length;
  showFace();
  picker.replaceChildren(new Option('Select a body part', ''));
  for (const region of anatomy.regions) picker.add(new Option(region.label, region.id));
  bodyPreset.textContent = [
    agePicker.selectedOptions[0].text,
    genderPicker.selectedOptions[0].text,
    body.height + ' voxels tall',
  ].join(' · ');
  totalVoxels.textContent = formatVoxelCount(anatomy.total.voxelVolume);
  select(selectedRegion);
  controls.target.y = body.height / 2;
  controls.update();
  resize();
}
const SELECTION_COLOR = 0x77bcb0;
function select(id?: BodyRegionId): void {
  const region = id === undefined ? undefined : anatomy.regions.find(region => region.id === id);
  for (const mesh of targets) {
    const selected = mesh.userData.highlight && region && isBodyRegion(mesh.userData.region as BodyRegionId, region.id);
    mesh.material.color.setHex(selected ? SELECTION_COLOR : mesh.userData.baseColor);
  }
  picker.value = region?.id ?? '';
  renderInspector(details, region);
}
picker.addEventListener('change', () => select(picker.value === '' ? undefined : picker.value as BodyRegionId));
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
genderPicker.addEventListener('change', rebuildBody);
agePicker.addEventListener('change', rebuildBody);
expressionPicker.addEventListener('change', showFace);
rebuildBody();
new ResizeObserver(resize).observe(host);
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
