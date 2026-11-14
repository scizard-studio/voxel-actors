import { Color, DirectionalLight, HemisphereLight, PCFSoftShadowMap, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  clips,
  createBody,
  createFace,
  createHair,
  createHat,
  createMotion,
  dress,
  everydayOutfits,
  faceAt,
  faceOptionsFor,
  hairUnder,
  outfits,
  type Body,
  type Dressed,
  type EverydayOutfitName,
  type OutfitName,
  type Worn,
} from './packages/characters/src';
import { createFigure, type Figure } from './figure';
import type { HeldProp } from './props/pieces';
import { holdProp } from './props/props';
import { clothColors, hairColors, roleColors, skinTones } from './palette';
import { createPanel, type StudioState } from './panel';
import { METRES_PER_VOXEL, createScaleGuide } from './scaleGuide';
import { addSocketMarkers, type SocketMarkers } from './socketMarkers';
import './studio.css';

const MS = 1000;
// Where the camera looks: about the chest of an adult.
const LOOK_AT_Y = 20;
const VIEWS = {
  front: [0, 24, 125],
  threeQuarter: [70, 48, 105],
} as const;
// How far the sun's shadows reach around the figure, in voxels.
const SHADOW_REACH = 100;

/**
 * The Character Studio: shape a character with the character library and see
 * it move, beside a wall and door of the town's size. It is a tool, not part
 * of the game, and uses nothing of the game or its engine.
 */
function startStudio(): void {
  const state: StudioState = {
    age: 'adult',
    gender: 'female',
    tone: 0,
    hair: 'longParted',
    hairColor: 0,
    outfit: 'romper',
    clothColor: null,
    hat: null,
    expression: 'happy',
    clip: 'idle',
    guide: true,
    sockets: false,
  };
  // Kept across rebuilds, so a new body carries on with what the old one was doing.
  const motion = createMotion(state.clip);

  const layout = document.createElement('div');
  layout.className = 'studio';
  document.body.append(layout);
  const stage = document.createElement('main');
  stage.className = 'studio__stage';

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  stage.append(renderer.domElement);

  const scene = new Scene();
  scene.background = new Color(0xf4ead2);
  const camera = new PerspectiveCamera(34, 1, 1, 4000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;

  scene.add(new HemisphereLight(0xfff8e6, 0xb2a47f, 2.2));
  const sun = new DirectionalLight(0xffe7bc, 2.6);
  sun.position.set(-60, 120, 80);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -SHADOW_REACH,
    right: SHADOW_REACH,
    top: SHADOW_REACH,
    bottom: -SHADOW_REACH,
    near: 1,
    far: 400,
  });
  sun.target.position.set(0, LOOK_AT_Y, 0);
  scene.add(sun, sun.target);

  const guide = createScaleGuide();
  scene.add(guide);

  const view = (name: keyof typeof VIEWS): void => {
    const [x, y, z] = VIEWS[name];
    camera.position.set(x, y, z);
    controls.target.set(0, LOOK_AT_Y, 0);
    controls.update();
  };

  let body: Body | null = null;
  let figure: Figure | null = null;
  let markers: SocketMarkers | null = null;
  let prop: HeldProp | null = null;
  const rebuild = (): void => {
    if (figure !== null) {
      scene.remove(figure.root);
      figure.dispose();
    }
    markers?.dispose();
    prop?.dispose();
    const bare = createBody({ age: state.age, gender: state.gender });
    const dressed = dressAsPicked(bare, state);
    body = dressed ?? bare;
    const face = createFace(body.head.face, faceOptionsFor(state.gender));
    // With no hat picked, an outfit's own hat is worn.
    const hatStyle = state.hat ?? (state.outfit === null ? null : outfits[state.outfit].hat) ?? null;
    const hat = hatStyle === null ? null : createHat(hatStyle, body.head);
    const hair = state.hair === null ? null : createHair(state.hair, body.head);
    // Hair under a hat is cut off at the hat.
    const worn: Worn[] = [];
    if (hair !== null) worn.push(hat === null ? hair : hairUnder(hair, hat));
    if (hat !== null) worn.push(hat);
    const colors = roleColors(skinTones[state.tone], hairColors[state.hairColor], dressed?.colors);
    figure = createFigure(body, face, worn, colors);
    markers = state.sockets ? addSocketMarkers(figure, body.sockets) : null;
    prop = holdProp(figure, body, worn, state.clip);
    scene.add(figure.root);
    guide.visible = state.guide;
    panel.setReadout(`${body.height} voxels tall, about ${(body.height * METRES_PER_VOXEL).toFixed(2)} m`);
  };

  const panel = createPanel(layout, state, rebuild, view);
  layout.append(stage);
  rebuild();
  view('threeQuarter');

  new ResizeObserver(() => {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }).observe(stage);

  const frame = (now: number): void => {
    const seconds = now / MS;
    // Picking another motion glides into it. Asking for the one already playing changes nothing.
    motion.play(state.clip, seconds);
    if (figure !== null && body !== null) {
      figure.pose(motion.poseAt(seconds, body));
      // Held things show once the arms have glided into the pose that holds them.
      prop?.show(!motion.gliding(seconds));
      prop?.update(motion.elapsed(seconds));
      // A motion may move the face too, as talking moves the mouth.
      const face = faceAt(state.expression, seconds);
      const moving = clips[motion.clip].face;
      figure.showFace(moving === undefined ? face : moving(face, motion.elapsed(seconds), 0));
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/**
 * The body in the outfit picked, or null for none. An everyday outfit takes the cloth color picked;
 * a work outfit keeps its own.
 */
function dressAsPicked(body: Body, state: StudioState): Dressed | null {
  const { outfit, clothColor } = state;
  if (outfit === null) return null;
  const color = clothColor === null ? undefined : clothColors[clothColor].color;
  return isEveryday(outfit) ? dress(body, outfit, color) : dress(body, outfit);
}

function isEveryday(name: OutfitName): name is EverydayOutfitName {
  return name in everydayOutfits;
}

startStudio();
