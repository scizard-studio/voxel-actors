import { mirrored, type BodyBox, type BodyPart } from './model';
import { oppositeRegion, type BodyRegionId } from './regions';
import type { Joint, JointName } from './skeleton';

export type Age = 'child' | 'teen' | 'adult' | 'elder' | 'aged';
export type Gender = 'female' | 'male';

/** Who the body belongs to. Its whole shape follows from these two. */
export interface BodySpec {
  readonly age: Age;
  readonly gender: Gender;
  /** Optional dimensions merged over the selected preset. */
  readonly proportions?: ProportionOverrides;
}

/**
 * Where a face goes: a rectangle on the front of the head, in the head's own
 * voxels. A face fitted to this fits the head, whatever its size.
 */
export interface FaceArea {
  readonly left: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
  /** How far forward the front of the head is. */
  readonly front: number;
}

/** Where the ears are, in the head's own voxels: from their bottom row to their top, from their back to their front. */
export interface EarPlace {
  readonly bottom: number;
  readonly top: number;
  readonly back: number;
  readonly front: number;
  /** How far they stand out from the side of the head. */
  readonly reach: number;
}

/**
 * A head's measurements, in its own voxels, from its pivot in the middle of
 * its base. Whatever is worn on a head is fitted to these, so it fits every head.
 */
export interface HeadShape {
  readonly width: number;
  readonly height: number;
  readonly depth: number;
  /** How far the head's edges are cut back. */
  readonly bevel: number;
  readonly face: FaceArea;
  readonly ears: EarPlace;
}

/** How each joint is turned when the body stands at rest, such as an old back bent forward. */
export type Posture = Partial<Record<JointName, readonly [number, number, number]>>;

/** The named spots where things attach to a body: a tool or a load in a hand, a hat, hair or a load on the head. */
export type SocketName = 'handLeft' | 'handRight' | 'headTop';

/** A spot on a body that moves with one joint: where it sits, measured from that joint's pivot, in voxels. */
export interface Socket {
  readonly joint: JointName;
  readonly at: readonly [number, number, number];
  /** Optional joint-local orientation in radians around X, Y and Z. */
  readonly rotation?: readonly [number, number, number];
}

/** A body ready to draw: its joints, parent before child, the parts that hang on them, and its head's measurements. */
export interface Body {
  readonly spec: BodySpec;
  readonly joints: readonly Joint[];
  readonly parts: readonly BodyPart[];
  readonly proportions: Proportions;
  /** What faces, hair and hats are fitted to. */
  readonly head: HeadShape;
  /** Where things attach. Every body has every socket, so anything made to attach fits every body. */
  readonly sockets: Readonly<Record<SocketName, Socket>>;
  readonly posture: Posture;
  /** From the soles to the top of the head, standing straight, in voxels. */
  readonly height: number;
}

type Size3 = readonly [width: number, height: number, depth: number];

/** The sizes of one kind of body, in voxels. */
export interface Proportions {
  readonly head: Size3;
  /** Height of the neck. 0 sets the head straight on the chest. */
  readonly neck: number;
  readonly chest: Size3;
  readonly waist: Size3;
  readonly pelvis: Size3;
  /** Arms are `thick` across and deep. Shoulder to fingertip is upper + forearm + hand. */
  readonly arm: { readonly thick: number; readonly upper: number; readonly forearm: number; readonly hand: number };
  /** Hip to sole is upper + shin + foot. The foot reaches `toe` forward of the shin. */
  readonly leg: {
    readonly wide: number;
    readonly deep: number;
    readonly gap: number;
    readonly upper: number;
    readonly shin: number;
    readonly foot: number;
    readonly toe: number;
  };
  /** How far the back bends forward at rest, in radians. */
  readonly stoop: number;
}

/** Supply only the dimensions that differ from the age/gender preset. */
export type ProportionOverrides = Partial<Omit<Proportions, 'arm' | 'leg'>> & {
  readonly arm?: Partial<Proportions['arm']>;
  readonly leg?: Partial<Proportions['leg']>;
};

/*
 * Chibi proportions: a big head, a small body, short legs, and a short neck
 * that leaves a raised arm room under the head. With 64 voxels to a 3 m cell,
 * a voxel is about 4.7 cm: an adult woman stands 34 voxels (1.59 m), an adult
 * man 36 (1.69 m). Arms reach down to the hips. Widths are odd for the head,
 * so the nose sits on a voxel of its own in the middle of the face.
 */
const female = {
  child: {
    head: [13, 12, 7], neck: 1, chest: [7, 3, 5], waist: [6, 2, 4], pelvis: [7, 2, 5],
    arm: { thick: 3, upper: 3, forearm: 2, hand: 2 },
    leg: { wide: 3, deep: 3, gap: 1, upper: 2, shin: 2, foot: 2, toe: 2 },
    stoop: 0,
  },
  teen: {
    head: [15, 12, 8], neck: 1, chest: [8, 5, 5], waist: [7, 3, 5], pelvis: [8, 3, 5],
    arm: { thick: 3, upper: 5, forearm: 3, hand: 3 },
    leg: { wide: 3, deep: 4, gap: 2, upper: 4, shin: 2, foot: 2, toe: 2 },
    stoop: 0,
  },
  adult: {
    head: [15, 13, 8], neck: 1, chest: [8, 5, 6], waist: [7, 3, 5], pelvis: [8, 3, 6],
    arm: { thick: 3, upper: 5, forearm: 3, hand: 3 },
    leg: { wide: 3, deep: 4, gap: 2, upper: 4, shin: 3, foot: 2, toe: 2 },
    stoop: 0,
  },
  elder: {
    head: [15, 13, 8], neck: 1, chest: [8, 5, 6], waist: [8, 3, 6], pelvis: [8, 3, 6],
    arm: { thick: 3, upper: 5, forearm: 3, hand: 3 },
    leg: { wide: 3, deep: 4, gap: 2, upper: 4, shin: 2, foot: 2, toe: 2 },
    stoop: 0.06,
  },
  aged: {
    head: [15, 13, 8], neck: 1, chest: [8, 4, 6], waist: [8, 3, 6], pelvis: [8, 3, 6],
    arm: { thick: 3, upper: 4, forearm: 3, hand: 3 },
    leg: { wide: 3, deep: 4, gap: 2, upper: 3, shin: 2, foot: 2, toe: 2 },
    stoop: 0.2,
  },
} satisfies Record<Age, Proportions>;

// Men: broader shoulders, thicker arms and legs, a little taller. Children are alike.
const male = {
  child: female.child,
  teen: {
    head: [15, 12, 8], neck: 1, chest: [9, 5, 5], waist: [8, 3, 5], pelvis: [8, 3, 5],
    arm: { thick: 3, upper: 5, forearm: 3, hand: 3 },
    leg: { wide: 3, deep: 4, gap: 2, upper: 4, shin: 3, foot: 2, toe: 2 },
    stoop: 0,
  },
  adult: {
    head: [15, 13, 8], neck: 1, chest: [10, 6, 6], waist: [9, 3, 5], pelvis: [9, 3, 6],
    arm: { thick: 4, upper: 5, forearm: 4, hand: 3 },
    leg: { wide: 4, deep: 4, gap: 1, upper: 4, shin: 4, foot: 2, toe: 2 },
    stoop: 0,
  },
  elder: {
    head: [15, 13, 8], neck: 1, chest: [10, 6, 6], waist: [10, 3, 6], pelvis: [9, 3, 6],
    arm: { thick: 4, upper: 5, forearm: 4, hand: 3 },
    leg: { wide: 4, deep: 4, gap: 1, upper: 4, shin: 3, foot: 2, toe: 2 },
    stoop: 0.06,
  },
  aged: {
    head: [15, 13, 8], neck: 1, chest: [10, 5, 6], waist: [10, 3, 6], pelvis: [9, 3, 6],
    arm: { thick: 4, upper: 5, forearm: 3, hand: 3 },
    leg: { wide: 4, deep: 4, gap: 1, upper: 4, shin: 2, foot: 2, toe: 2 },
    stoop: 0.2,
  },
} satisfies Record<Age, Proportions>;

const PROPORTIONS: Record<Gender, Record<Age, Proportions>> = { female, male };

/** Resolves a fresh copy; invalid dimensions fail before any geometry is built. */
export function resolveProportions(spec: BodySpec): Proportions {
  const preset = PROPORTIONS[spec.gender]?.[spec.age];
  if (!preset) throw new Error('Unknown body age or gender.');
  const custom = spec.proportions ?? {};
  const p: Proportions = {
    ...preset, ...custom,
    head: [...(custom.head ?? preset.head)],
    chest: [...(custom.chest ?? preset.chest)],
    waist: [...(custom.waist ?? preset.waist)],
    pelvis: [...(custom.pelvis ?? preset.pelvis)],
    arm: { ...preset.arm, ...custom.arm },
    leg: { ...preset.leg, ...custom.leg },
  };
  function dimension(value: number, name: string, minimum = 1): void {
    if (!Number.isSafeInteger(value) || value < minimum) throw new Error(`${name} must be an integer of at least ${minimum} voxels.`);
  }
  for (const name of ['head', 'chest', 'waist', 'pelvis'] as const) {
    if (p[name].length !== 3) throw new Error(`${name} must have width, height and depth.`);
    p[name].forEach((value, axis) => dimension(value, `${name}[${axis}]`));
  }
  dimension(p.head[0], 'head width', 3);
  dimension(p.head[1], 'head height', 8);
  dimension(p.head[2], 'head depth', 5);
  dimension(p.neck, 'neck', 0);
  if (p.neck > 0) dimension(p.chest[2], 'chest depth with neck', 3);
  for (const [name, value] of Object.entries(p.arm)) dimension(value, `arm.${name}`);
  dimension(p.arm.thick, 'arm.thick', 3);
  dimension(p.arm.upper, 'arm.upper', 2);
  for (const [name, value] of Object.entries(p.leg)) dimension(value, `leg.${name}`, name === 'gap' || name === 'toe' ? 0 : 1);
  if (!Number.isFinite(p.stoop) || Math.abs(p.stoop) >= Math.PI / 2) throw new Error('stoop must be finite and between -pi/2 and pi/2 radians.');
  return p;
}

// The head's edges are cut back this far, which softens its outline. The face sits inside them.
const BEVEL = 1;
// The top edges of an upper arm are cut back this far on the outside, front and back, rounding the
// shoulder. Left square, their corners would swing up into the wide head as an arm rises past 45°.
const SHOULDER_BEVEL = 1;
// A bent back would tip the head down. It is lifted back this share of the way, to look ahead.
const HEAD_LIFT = 0.6;
// Ears are this tall, their top this far below the top of the head, level with the eyes. They start
// this far in from the back of the head, so they sit on its voxels whatever its depth, are this
// deep, and stand out this far from its side.
const EAR = { height: 4, belowTop: 5, inFromBack: 2, deep: 3, reach: 1 };

/** A block centred left to right and front to back on the pivot, hanging down from it. */
function hanging(width: number, height: number, depth: number, region: BodyRegionId, top = 0): BodyBox {
  return { at: [-width / 2, top - height, -depth / 2], size: [width, height, depth], role: 'skin', region };
}

/** A block centred left to right and front to back on the pivot, standing up from it. */
function standing(width: number, height: number, depth: number, region: BodyRegionId, bottom = 0): BodyBox {
  return { at: [-width / 2, bottom, -depth / 2], size: [width, height, depth], role: 'skin', region };
}

/** The left upper arm, hanging from the ball of the shoulder, its top rounded on every side but the inner one. */
function upperArmLeft(thick: number, length: number): BodyBox[] {
  const top = thick / 2;
  return [
    hanging(thick, length - SHOULDER_BEVEL, thick, 'upperArmLeft', top - SHOULDER_BEVEL),
    {
      at: [-thick / 2, top - SHOULDER_BEVEL, -thick / 2 + SHOULDER_BEVEL],
      size: [thick - SHOULDER_BEVEL, SHOULDER_BEVEL, thick - 2 * SHOULDER_BEVEL],
      role: 'skin',
      region: 'upperArmLeft',
    },
  ];
}

/** The measurements of a head of this size: its face inside the cut-back edges, and its ears. */
function headShape([width, height, depth]: Size3): HeadShape {
  const earTop = Math.max(BEVEL + EAR.height, height - EAR.belowTop);
  const earBack = -depth / 2 + EAR.inFromBack;
  return {
    width,
    height,
    depth,
    bevel: BEVEL,
    face: { left: -width / 2 + BEVEL, bottom: BEVEL, width: width - 2 * BEVEL, height: height - 2 * BEVEL, front: depth / 2 },
    ears: { bottom: earTop - EAR.height, top: earTop, back: earBack, front: earBack + EAR.deep, reach: EAR.reach },
  };
}

/** A head with its twelve edges cut back, out of three crossing blocks, and an ear on each side. */
function headBoxes({ width, height, depth, bevel, ears }: HeadShape): BodyBox[] {
  const inner = (w: number, h: number, d: number): BodyBox => ({
    at: [-w / 2, (height - h) / 2, -d / 2],
    size: [w, h, d],
    role: 'skin',
    region: 'head',
  });
  // The left ear: solid behind, with a shaded hollow down its front edge.
  const { bottom, top, back, front, reach } = ears;
  const ear: BodyBox[] = [
    { at: [width / 2, bottom, back], size: [reach, top - bottom, front - 1 - back], role: 'skin', region: 'earLeft' },
    { at: [width / 2, bottom, front - 1], size: [reach, 1, 1], role: 'skin', region: 'earLeft' },
    { at: [width / 2, top - 1, front - 1], size: [reach, 1, 1], role: 'skin', region: 'earLeft' },
    { at: [width / 2, bottom + 1, front - 1], size: [reach, top - bottom - 2, 1], role: 'skin', region: 'innerEarLeft' },
  ];
  return [
    inner(width, height - 2 * bevel, depth - 2 * bevel),
    inner(width - 2 * bevel, height, depth - 2 * bevel),
    inner(width - 2 * bevel, height - 2 * bevel, depth),
    ...ear,
    ...ear.map(mirrorBodyBox),
  ];
}

/** Builds a plain body, with no face, hair or clothes, for a person of this age and gender. */
export function createBody(spec: BodySpec): Body {
  const p = resolveProportions(spec);
  const { arm, leg } = p;
  const legLength = leg.upper + leg.shin + leg.foot;
  const torso = p.waist[1] + p.chest[1];
  const hipX = leg.gap / 2 + leg.wide / 2;
  const shoulderX = p.chest[0] / 2 + arm.thick / 2;
  // An arm turns at the ball of the shoulder, half its thickness below the top of the arm.
  // Raised out to the side, it then stays below the head instead of swinging up into it.
  const shoulderY = torso - arm.thick / 2;
  const elbowDrop = arm.upper - arm.thick / 2;

  const joints: Joint[] = [
    { name: 'pelvis', parent: null, at: [0, legLength, 0] },
    { name: 'waist', parent: 'pelvis', at: [0, p.pelvis[1], 0] },
    { name: 'head', parent: 'waist', at: [0, torso + p.neck, 0] },
    { name: 'shoulderLeft', parent: 'waist', at: [shoulderX, shoulderY, 0] },
    { name: 'elbowLeft', parent: 'shoulderLeft', at: [0, -elbowDrop, 0] },
    { name: 'shoulderRight', parent: 'waist', at: [-shoulderX, shoulderY, 0] },
    { name: 'elbowRight', parent: 'shoulderRight', at: [0, -elbowDrop, 0] },
    { name: 'hipLeft', parent: 'pelvis', at: [hipX, 0, 0] },
    { name: 'kneeLeft', parent: 'hipLeft', at: [0, -leg.upper, 0] },
    { name: 'hipRight', parent: 'pelvis', at: [-hipX, 0, 0] },
    { name: 'kneeRight', parent: 'hipRight', at: [0, -leg.upper, 0] },
  ];

  // Torso: waist, chest, then a short neck under the chin.
  const torsoBoxes: BodyBox[] = [
    standing(p.waist[0], p.waist[1], p.waist[2], 'waist'),
    standing(p.chest[0], p.chest[1], p.chest[2], 'chest', p.waist[1]),
  ];
  if (p.neck > 0) torsoBoxes.push(standing(Math.ceil(p.chest[0] / 2), p.neck, p.chest[2] - 2, 'neck', torso));

  const lowerArm: BodyBox[] = [
    hanging(arm.thick, arm.forearm, arm.thick, 'forearmLeft'),
    hanging(arm.thick, arm.hand, arm.thick, 'handLeft', -arm.forearm),
  ];
  // The foot is the bottom of the lower leg, reaching forward past the shin.
  const lowerLeg: BodyBox[] = [
    hanging(leg.wide, leg.shin, leg.deep, 'shinLeft'),
    { at: [-leg.wide / 2, -leg.shin - leg.foot, -leg.deep / 2], size: [leg.wide, leg.foot, leg.deep + leg.toe], role: 'skin', region: 'footLeft' },
  ];
  const limb = (name: string, upperJoint: JointName, lowerJoint: JointName, upper: BodyBox[], lower: BodyBox[]): BodyPart[] => [
    { name: `upper${name}`, joint: upperJoint, boxes: upper },
    { name: `lower${name}`, joint: lowerJoint, boxes: lower },
  ];
  const upperArm = upperArmLeft(arm.thick, arm.upper);
  const upperLeg = [hanging(leg.wide, leg.upper, leg.deep, 'thighLeft')];
  const head = headShape(p.head);

  const parts: BodyPart[] = [
    { name: 'pelvis', joint: 'pelvis', boxes: [standing(p.pelvis[0], p.pelvis[1], p.pelvis[2], 'hips')] },
    { name: 'torso', joint: 'waist', boxes: torsoBoxes },
    { name: 'head', joint: 'head', boxes: headBoxes(head) },
    ...limb('ArmLeft', 'shoulderLeft', 'elbowLeft', upperArm, lowerArm),
    ...limb('ArmRight', 'shoulderRight', 'elbowRight', upperArm.map(mirrorBodyBox), lowerArm.map(mirrorBodyBox)),
    ...limb('LegLeft', 'hipLeft', 'kneeLeft', upperLeg, lowerLeg),
    ...limb('LegRight', 'hipRight', 'kneeRight', upperLeg.map(mirrorBodyBox), lowerLeg.map(mirrorBodyBox)),
  ];

  const posture: Posture =
    p.stoop === 0 ? {} : { waist: [p.stoop, 0, 0], head: [-p.stoop * HEAD_LIFT, 0, 0] };

  return {
    spec,
    proportions: p,
    joints,
    parts,
    head,
    sockets: {
      // In the middle of each hand, where a grip closes.
      handLeft: { joint: 'elbowLeft', at: [0, -arm.forearm - arm.hand / 2, 0] },
      handRight: { joint: 'elbowRight', at: [0, -arm.forearm - arm.hand / 2, 0] },
      headTop: { joint: 'head', at: [0, head.height, 0] },
    },
    posture,
    height: legLength + p.pelvis[1] + torso + p.neck + head.height,
  };
}

function mirrorBodyBox(box: BodyBox): BodyBox {
  return { ...mirrored(box), region: oppositeRegion(box.region) };
}
