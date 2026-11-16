import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createCharacter } from './model';
import { createBehanceCharacter } from './behanceCharacter';

document.body.style.cssText = 'margin:0;overflow:hidden;background:#535e8a';
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x535e8a);
renderer.toneMapping = THREE.NoToneMapping;
document.body.append(renderer.domElement);

const scene = new THREE.Scene();
const framing = 47;
const aspect = innerWidth / innerHeight;
const camera = new THREE.OrthographicCamera(-framing * aspect / 2, framing * aspect / 2, framing / 2, -framing / 2, 0.1, 500);
camera.position.set(48, 39, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 19, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minZoom = 0.5;
controls.maxZoom = 3;
controls.maxPolarAngle = Math.PI / 2 - 0.03;
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x75819b, 2.2));
const sun = new THREE.DirectionalLight(0xfff5e8, 2.5);
sun.position.set(-35, 60, 80);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 45, bottom: -35, near: 1, far: 150 });
sun.shadow.normalBias = 0.015;
sun.shadow.bias = -0.00005;
sun.shadow.radius = 2;
scene.add(sun);
const views = [
  { title: 'Base body', model: createBehanceCharacter('base') },
  { title: 'Gold gown and cape', model: createBehanceCharacter('dressed') },
  { title: 'Studio / Base body', model: createCharacter('base', 'studio') },
  { title: 'Studio / Gold outfit', model: createCharacter('dressed', 'studio') },
];
const captions = document.createElement('div');
captions.style.cssText = 'position:fixed;inset:0;display:grid;grid-template-columns:1fr 1fr;text-align:center;color:#fff;font:13px system-ui;pointer-events:none';
const captionElements: HTMLElement[] = [];
for (const view of views) {
  scene.add(view.model);
  view.model.visible = false;
  const caption = document.createElement('div');
  caption.style.cssText = 'display:flex;align-items:end;justify-content:center;padding-bottom:10px';
  caption.textContent = view.title;
  captions.append(caption);
  captionElements.push(caption);
}
document.body.append(captions);

let showStudioComparison = false;
const toolbar = document.createElement('nav');
toolbar.setAttribute('aria-label', 'Character views');
toolbar.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);display:flex;gap:6px;align-items:center;padding:5px;background:#384262cc;border-radius:8px;color:white;font:12px system-ui;white-space:nowrap';
for (const [label, position] of [
  ['Front', [0, 23, 110]],
  ['Three-quarter', [48, 39, 100]],
  ['Side', [110, 23, 0]],
  ['Back', [0, 23, -110]],
] as const) {
  const button = document.createElement('button');
  button.textContent = label;
  button.style.cssText = 'padding:7px 9px;color:white;background:#ffffff12;border:0;border-radius:4px;cursor:pointer;font:inherit';
  button.addEventListener('click', () => {
    controls.reset();
    camera.position.set(position[0], position[1], position[2]);
    controls.target.set(0, 19, 0);
    controls.update();
  });
  toolbar.append(button);
}
const comparisonLabel = document.createElement('label');
comparisonLabel.style.cssText = 'display:flex;align-items:center;gap:4px;padding:0 6px';
const comparison = document.createElement('input');
comparison.type = 'checkbox';
comparison.addEventListener('change', () => {
  showStudioComparison = comparison.checked;
  resize();
});
comparisonLabel.append(comparison, 'Studio comparison');
toolbar.append(comparisonLabel);
document.body.append(toolbar);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0x535e8a, roughness: 1 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.06;
floor.receiveShadow = true;
scene.add(floor);
const grid = new THREE.GridHelper(500, 50, 0x49537c, 0x49537c);
grid.position.y = -0.04;
scene.add(grid);

function resize(): void {
  const rows = showStudioComparison ? 2 : 1;
  const aspect = (innerWidth / 2) / (innerHeight / rows);
  const height = Math.max(framing, 27 / aspect);
  captions.style.gridTemplateRows = showStudioComparison ? '1fr 1fr' : '1fr';
  captionElements.forEach((caption, index) => { caption.style.display = index < rows * 2 ? 'flex' : 'none'; });
  camera.left = -height * aspect / 2;
  camera.right = height * aspect / 2;
  camera.top = height / 2;
  camera.bottom = -height / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
addEventListener('resize', resize);
resize();
renderer.setScissorTest(true);
renderer.setAnimationLoop(() => {
  controls.update();
  const halfWidth = Math.floor(innerWidth / 2);
  const rows = showStudioComparison ? 2 : 1;
  const halfHeight = Math.floor(innerHeight / rows);
  views.forEach((view, index) => {
    if (index >= rows * 2) return;
    const column = index % 2;
    const row = Math.floor(index / 2);
    const left = column * halfWidth;
    const bottom = rows === 2 && row === 0 ? halfHeight : 0;
    const width = column === 0 ? halfWidth : innerWidth - halfWidth;
    const height = rows === 1 ? innerHeight : row === 0 ? innerHeight - halfHeight : halfHeight;
    view.model.visible = true;
    renderer.setViewport(left, bottom, width, height);
    renderer.setScissor(left, bottom, width, height);
    renderer.render(scene, camera);
    view.model.visible = false;
  });
});
