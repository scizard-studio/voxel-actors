import { Color, DirectionalLight, HemisphereLight, PCFShadowMap, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  clips,
  carryArms,
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
} from '../../packages/voxel-actors/src';
import { createFigure, type Figure } from '../rendering/figure';
import type { HeldProp } from '../rendering/props/pieces';
import { holdProp } from '../rendering/props/props';
import { actionHand } from '../../packages/voxel-actors/src';
import { equipItem } from '../rendering/props/equipment';
import { clothColors, hairColors, roleColors, skinTones } from './palette';
import { createPanel, type StudioState } from './panel';
import { METRES_PER_VOXEL, createScaleGuide } from '../rendering/scaleGuide';
import { addSocketMarkers, type SocketMarkers } from '../rendering/socketMarkers';

const MS = 1000;
const CARRY_BLEND_SECONDS = 0.25;
// Where the camera looks: about the chest of an adult.
const LOOK_AT_Y = 20;
const VIEWS = {
  front: [0, 24, 125],
  threeQuarter: [70, 48, 105],
} as const;
// How far the sun's shadows reach around the figure, in voxels.
const SHADOW_REACH = 100;
const REDUCE_BELOW_PX = 88;
const RESTORE_ABOVE_PX = 112;

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
    expression: 'normal',
    clip: 'idle',
    carryLayer: false,
    equipment: { handLeft: null, handRight: null },
    guide: true,
    sockets: false,
    detail: 'auto',
  };
  // Kept across rebuilds, so a new body carries on with what the old one was doing.
  const motion = createMotion(state.clip);

  const layout = document.createElement('main');
  layout.className = 'workspace';
  document.body.append(layout);
  const stage = document.createElement('section');
  stage.className = 'workspace-stage studio__stage';
  stage.setAttribute('aria-label', 'Character preview');

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
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
  let equipped: HeldProp[] = [];
  let workHand = actionHand(state.equipment, 'work');
  let builtAppearance = '';
  let attachedClip: StudioState['clip'] | undefined;
  const canLayerCarry = (): boolean => state.clip === 'idle' || state.clip === 'walk';
  const isLayeredCarry = (): boolean => state.carryLayer && canLayerCarry();
  const rebuild = (): void => {
    guide.visible = state.guide;
    const propClip = isLayeredCarry() ? 'carry' : state.clip;
    const appearanceKey = JSON.stringify([
      state.age, state.gender, state.tone, state.hair, state.hairColor,
      state.outfit, state.clothColor, state.hat, state.sockets,
      state.equipment.handLeft, state.equipment.handRight,
    ]);
    if (builtAppearance === appearanceKey && attachedClip === propClip) return;
    builtAppearance = appearanceKey;
    attachedClip = propClip;
    if (figure !== null) {
      scene.remove(figure.root);
      figure.dispose();
    }
    markers?.dispose();
    prop?.dispose();
    for (const item of equipped) item.dispose();
    const bare = createBody({ age: state.age, gender: state.gender });
    const dressed = dressAsPicked(bare, state);
    body = dressed ?? bare;
    const face = createFace(body.head.face, faceOptionsFor(state.gender));
    // With no hat picked, an outfit's own hat is worn.
    const hatStyle = state.hat ?? (state.outfit === null ? null : outfits[state.outfit].hat) ?? null;
    const hat = hatStyle === null ? null : createHat(hatStyle, body.head);
    const hair = state.hair === null ? null : createHair(state.hair, body.head);
    // Hair under a hat is cut off at the hat.
    const worn: Worn[] = [...(dressed?.worn ?? [])];
    if (hair !== null) worn.push(hat === null ? hair : hairUnder(hair, hat));
    if (hat !== null) worn.push(hat);
    const colors = roleColors(skinTones[state.tone], hairColors[state.hairColor], dressed?.colors);
    figure = createFigure(body, face, worn, { palette: colors });
    markers = state.sockets ? addSocketMarkers(figure, body.sockets) : null;
    prop = holdProp(figure, body, worn, propClip);
    equipped = [];
    for (const hand of ['handLeft', 'handRight'] as const) {
      const name = state.equipment[hand];
      if (name !== null) equipped.push(equipItem(figure, body, hand, name));
    }
    for (const item of equipped) item.show(prop === null);
    workHand = actionHand(state.equipment, 'work');
    scene.add(figure.root);
    guide.visible = state.guide;
  };

  let reducedDetail = false;
  const detailCenter = new Vector3();
  const detailCameraSpace = new Vector3();
  layout.append(stage);
  const panel = createPanel(layout, state, rebuild, view);
  rebuild();
  view('threeQuarter');

  new ResizeObserver(() => {
    const width = Math.max(stage.clientWidth, 1);
    const height = Math.max(stage.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }).observe(stage);

  let previousFrame: number | undefined;
  let carryWeight = 0;
  const frame = (now: number): void => {
    const seconds = now / MS;
    const blendStep = (seconds - (previousFrame ?? seconds)) / CARRY_BLEND_SECONDS;
    previousFrame = seconds;
    if (!canLayerCarry()) carryWeight = 0;
    else if (isLayeredCarry()) carryWeight = Math.min(1, carryWeight + blendStep);
    else carryWeight = Math.max(0, carryWeight - blendStep);
    // Picking another motion glides into it. Asking for the one already playing changes nothing.
    let clip: Parameters<typeof motion.play>[0] = state.clip;
    if (state.clip === 'work') {
      clip = workHand === undefined ? 'idle' : workHand === 'handLeft' ? 'workLeft' : 'work';
    }
    motion.play(clip, seconds);
    if (figure !== null && body !== null) {
      const layers = carryWeight > 0 ? [carryArms(carryWeight)] : undefined;
      figure.pose(motion.poseAt(seconds, body, layers));
      // Held things show once the arms have glided into the pose that holds them.
      prop?.show(isLayeredCarry() ? carryWeight === 1 : !motion.gliding(seconds));
      prop?.update(motion.elapsed(seconds));
      // A motion may move the face too, as talking moves the mouth.
      const face = faceAt(state.expression, seconds);
      const moving = clips[state.clip].face;
      figure.showFace(moving === undefined ? face : moving(face, motion.elapsed(seconds), 0));
    }
    controls.update();
    camera.updateMatrixWorld();
    if (figure && body) {
      figure.root.getWorldPosition(detailCenter);
      detailCenter.y += body.height / 2;
      const depth = -detailCameraSpace.copy(detailCenter).applyMatrix4(camera.matrixWorldInverse).z;
      const screenHeight = depth > 0
        ? body.height * camera.projectionMatrix.elements[5] * stage.clientHeight / (2 * depth)
        : Infinity;
      const threshold = reducedDetail ? RESTORE_ABOVE_PX : REDUCE_BELOW_PX;
      reducedDetail = state.detail === 'low' || (state.detail === 'auto' && screenHeight < threshold);
      figure.setDetail(reducedDetail ? 'low' : 'high');
      const workHint = state.clip === 'work' && workHand === undefined ? ' · Equip a hammer to work' : '';
      panel.setReadout(body.height + ' voxels · ' + (body.height * METRES_PER_VOXEL).toFixed(2)
        + ' m · ' + (reducedDetail ? 'Reduced detail' : 'Full detail') + workHint);
    }
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
