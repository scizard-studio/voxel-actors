import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createBody, colorOf, type JointName } from './packages/characters/src';
import './anatomy.css';

// Outfit studies are preserved in character-study/, inactive in this anatomy mock.
document.body.innerHTML = `
  <header><div class="brand"><span class="brand-icon">◇</span> Character Anatomy</div><span class="badge">DESIGN STUDY</span></header>
  <main><section class="viewport" aria-label="Interactive character body"><div class="stage-heading"><span class="eyebrow">THE FOUNDATION</span><h1>A closer look.</h1><p>Select a part to explore its anatomy.</p></div><div class="canvas-host"></div><div class="view-hint">Drag to rotate <span>·</span> Scroll to zoom</div></section>
  <aside aria-label="Body part information"><div class="panel-top"><span class="eyebrow">INSPECTOR</span><span class="status-dot"></span></div><div id="details" aria-live="polite"></div><div class="part-picker"><label for="part">BODY PART</label><select id="part"><option value="">Select a body part</option></select></div><div class="panel-note">Original Studio body<br><span>Adult · Female · Voxel units</span></div></aside></main>`;
const host = document.querySelector<HTMLDivElement>('.canvas-host')!;
const details = document.querySelector<HTMLDivElement>('#details')!;
const picker = document.querySelector<HTMLSelectElement>('#part')!;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
host.append(renderer.domElement);
const scene = new THREE.Scene();
const body = createBody({ age: 'adult', gender: 'female' });
const joints = new Map<JointName, THREE.Vector3>();
for (const joint of body.joints) {
  joints.set(joint.name, new THREE.Vector3(...joint.at).add(joint.parent ? joints.get(joint.parent)! : new THREE.Vector3()));
}
interface Region { name: string; joint: JointName; meshes: THREE.Mesh<THREE.BoxGeometry, THREE.MeshLambertMaterial>[]; bounds: THREE.Box3 }
const regions: Region[] = [];
const targets: THREE.Mesh[] = [];
function regionName(part: string, index: number): string {
  const side = part.endsWith('Left') ? 'Left' : 'Right';
  if (part === 'head') return 'Head';
  if (part === 'pelvis') return 'Hips';
  if (part === 'torso') return ['Waist', 'Chest', 'Neck'][index];
  if (part.startsWith('upperArm')) return side + ' upper arm';
  if (part.startsWith('lowerArm')) return side + (index === 0 ? ' forearm' : ' hand');
  if (part.startsWith('upperLeg')) return side + ' thigh';
  return side + (index === 0 ? ' shin' : ' foot');
}
for (const part of body.parts) {
  part.boxes.forEach((box, index) => {
    const name = regionName(part.name, index);
    let region = regions.find(item => item.name === name);
    if (!region) { region = { name, joint: part.joint, meshes: [], bounds: new THREE.Box3() }; regions.push(region); }
    const material = new THREE.MeshLambertMaterial({ color: colorOf(box) });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...box.size), material);
    mesh.position.copy(joints.get(part.joint)!).add(new THREE.Vector3(...box.at)).add(new THREE.Vector3(...box.size).multiplyScalar(0.5));
    mesh.userData.region = region;
    mesh.userData.baseColor = colorOf(box);
    scene.add(mesh);
    mesh.updateMatrixWorld();
    region.bounds.union(new THREE.Box3().setFromObject(mesh));
    region.meshes.push(mesh);
    targets.push(mesh);
  });
}
for (const [index, region] of regions.entries()) picker.add(new Option(region.name, String(index)));
const number = (n: number): string => String(Math.round(n * 100) / 100);
function select(region?: Region): void {
  for (const mesh of targets) (mesh.material as THREE.MeshLambertMaterial).color.setHex(mesh.userData.baseColor);
  if (!region) {
    picker.value = '';
    details.innerHTML = '<div class="empty-icon">⌖</div><h2>Start with a part.</h2><p class="description">Click the character to see its dimensions, position, and connected joint.</p><div class="empty-line"></div><p class="small-note">Every piece has a place.</p>';
    return;
  }
  for (const mesh of region.meshes) mesh.material.color.setHex(0x77bcb0);
  picker.value = String(regions.indexOf(region));
  const size = region.bounds.getSize(new THREE.Vector3());
  const center = region.bounds.getCenter(new THREE.Vector3());
  details.innerHTML = `<div class="selected-tag">SELECTED PART</div><h2>${region.name}</h2><p class="description">A piece of the original Studio base body.</p><h3>Dimensions <span>VOXELS</span></h3><div class="metrics">${['Width', 'Height', 'Depth'].map((label, i) => `<div><strong>${number(size.getComponent(i))}</strong><span>${label}</span></div>`).join('')}</div><h3>Position <span>CENTER · WORLD</span></h3><div class="coordinates">${['X', 'Y', 'Z'].map((label, i) => `<div><span>${label}</span><b>${number(center.getComponent(i))}</b></div>`).join('')}</div><h3>Connected joint</h3><div class="joint"><span>◇</span> ${region.joint}</div><p class="small-note">Dimensions describe the outer bounds.<br>Left and right follow the character.</p>`;
}
picker.addEventListener('change', () => select(picker.value === '' ? undefined : regions[Number(picker.value)]));
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
function hit(event: PointerEvent): Region | undefined {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(targets, false)[0]?.object.userData.region as Region | undefined;
}
let start = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', e => { start.set(e.clientX, e.clientY); });
renderer.domElement.addEventListener('pointerup', e => { if (start.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) < 5) select(hit(e)); });
renderer.domElement.addEventListener('pointermove', e => { renderer.domElement.style.cursor = hit(e) ? 'pointer' : 'grab'; });
addEventListener('keydown', e => { if (e.key === 'Escape') select(); });
function resize(): void {
  const width = host.clientWidth;
  const height = host.clientHeight;
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
