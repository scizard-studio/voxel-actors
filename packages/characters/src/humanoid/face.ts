import type { FaceArea, Gender } from './body';
import type { Box, Role } from './model';

/**
 * The features of a face, and the shapes each can take. An expression picks
 * one shape for every feature. A new shape or feature is added here as data.
 */
export interface FeatureShapes {
  brows: 'flat' | 'worried';
  eyes: 'open' | 'closed' | 'smile';
  nose: 'small';
  mouth: 'line' | 'smile' | 'openSmile' | 'frown' | 'open';
  blush: 'on' | 'off';
}

export type FeatureName = keyof FeatureShapes;

/** One shape chosen for every feature: how a face looks at one moment. */
export type FaceState = { readonly [F in FeatureName]: FeatureShapes[F] };

/** Every shape of every feature, ready to draw. Only the shapes of the moment are shown. */
export type FaceShapes = { readonly [F in FeatureName]: Readonly<Record<FeatureShapes[F], readonly Box[]>> };

/** A face fitted to one head. It hangs on the head joint, so it turns with the head. */
export interface Face {
  readonly joint: 'head';
  readonly shapes: FaceShapes;
}

export interface FaceOptions {
  /** A small lash at the outer corner of each eye. */
  readonly lashes: boolean;
  /** Rosy cheeks, in the expressions that have them. */
  readonly blush: boolean;
}

/** The usual face for a person: women and girls have lashes and rosy cheeks, men and boys do not. */
export function faceOptionsFor(gender: Gender): FaceOptions {
  return { lashes: gender === 'female', blush: gender === 'female' };
}

export const expressions = {
  normal: { brows: 'flat', eyes: 'open', nose: 'small', mouth: 'line', blush: 'on' },
  happy: { brows: 'flat', eyes: 'open', nose: 'small', mouth: 'openSmile', blush: 'on' },
  smiling: { brows: 'flat', eyes: 'smile', nose: 'small', mouth: 'smile', blush: 'on' },
  sad: { brows: 'worried', eyes: 'open', nose: 'small', mouth: 'frown', blush: 'off' },
} satisfies Record<string, FaceState>;

export type ExpressionName = keyof typeof expressions;

// A face lies on the head like a decal: features are this thin, in voxels.
const LAYER = 0.15;

const EYE_MASK = ['.EEEE.', 'EEEEEE', 'EEEEEE', 'EEEEEE', '.RRRR.'];

function roundedEyeLayout(area: FaceArea) {
  const width = EYE_MASK[0].length;
  const unit = Math.min(0.375, area.width / (2 * width + 1));
  return {
    unit,
    center: area.left + area.width / 2,
    top: area.bottom + Math.min(5.75, area.height - 2.5),
    halfSpacing: Math.min(3.5, area.width / 2 - width * unit / 2),
  };
}

function createFlatBrows(area: FaceArea): readonly Box[] {
  const { unit, center, top, halfSpacing } = roundedEyeLayout(area);
  return [-1, 1].map((side): Box => ({
    at: [center + side * halfSpacing - 2 * unit, top + 2 * unit, area.front],
    size: [4 * unit, unit, LAYER],
    role: 'brow',
  }));
}

function createSmallNose(area: FaceArea): readonly Box[] {
  const { unit, center, top } = roundedEyeLayout(area);
  const step = unit * 2 / 3;
  const base = top - EYE_MASK.length * unit - step;
  return [
    { at: [center, base, area.front], size: [2 * step, step, LAYER], role: 'nose' },
    { at: [center + step, base + step, area.front], size: [step, 2 * step, LAYER], role: 'nose' },
  ];
}

function createOpenSmile(area: FaceArea): readonly Box[] {
  const { unit, center, top } = roundedEyeLayout(area);
  const step = unit * 2 / 3;
  const mouthTop = top - 13 * step;
  const widths = [4, 6, 4, 2];
  return widths.map((columns, row): Box => ({
    at: [center - columns * step / 2, mouthTop - (row + 1) * step, area.front],
    size: [columns * step, step, LAYER],
    role: row === 0 ? 'teeth' : 'mouth',
  }));
}

/** Rounded eyes fitted to the face plane, using the study's proportions. */
function createRoundedEyes(area: FaceArea, lashes: boolean): readonly Box[] {
  const { unit, center, top, halfSpacing } = roundedEyeLayout(area);
  const depth = 0.25;
  const boxes: Box[] = [];
  for (const side of [-1, 1]) {
    const left = center + side * halfSpacing - EYE_MASK[0].length * unit / 2;
    for (const [row, line] of EYE_MASK.entries()) {
      for (const [column, pixel] of [...line].entries()) {
        const outerCorner = row === 0 && column === (side < 0 ? 0 : line.length - 1);
        if (pixel === '.' && !(lashes && outerCorner)) continue;
        boxes.push({
          at: [left + column * unit, top - (row + 1) * unit, area.front + 0.01 - depth],
          size: [unit, unit, depth],
          role: pixel === 'R' ? 'eyeIris' : 'eye',
        });
      }
    }
  }
  return boxes;
}
// Feature sizes, in voxels: eyes are square, brows a short bar, the mouth two rows tall.
const EYE = 3;
const MOUTH = 3;
const BLUSH = 2;
// The eyes sit this far apart, as in the reference face, or closer on a narrow face.
const EYE_GAPS = [5, 3, 1];
// Room kept beside each eye for a lash, and between each blush and the mouth.
const LASH_ROOM = 1;
const BLUSH_TO_MOUTH = 2;
// Open eyes blink now and then, for a moment, each face on its own beat.
const BLINK_EVERY_SECONDS = 3.7;
const BLINK_SECONDS = 0.13;
const BLINK_SPREAD_SECONDS = 1.3;

/**
 * Places every shape of every feature on the face area of a head, with a
 * voxel of room between features. From the top: a row of forehead for hair,
 * the brows, a gap, the eyes with the nose at their lower edge, a gap, then
 * the mouth with a blush on each side, and whatever is left is chin.
 */
function layout(area: FaceArea, options: FaceOptions): FaceShapes {
  const { width, height } = area;
  // A rectangle of one role, measured from the face area's lower left corner, on the front of the head.
  const cell = (x: number, y: number, w: number, h: number, role: Role, layer = 0): Box => ({
    at: [area.left + x, area.bottom + y, area.front + layer * LAYER],
    size: [w, h, LAYER],
    role,
  });

  const gap = EYE_GAPS.find((each) => 2 * EYE + each + 2 * LASH_ROOM <= width) ?? 1;
  const leftEye = (width - (2 * EYE + gap)) / 2;
  const rightEye = leftEye + EYE + gap;
  const browY = height - 2;
  const eyeBottom = browY - 1 - EYE;
  const noseY = eyeBottom;
  const mouthTop = noseY - 2;
  const mouthBottom = mouthTop - 1;
  const mouthLeft = (width - MOUTH) / 2;
  const blushLeft = [mouthLeft - BLUSH_TO_MOUTH - BLUSH, mouthLeft + MOUTH + BLUSH_TO_MOUTH] as const;

  // The left eye as seen from the front, then the right one. Each has a lash just outside its outer
  // corner, and a brow over its outer part: the columns of the brow's outer and inner ends.
  const eyes = [
    { x: leftEye, lash: leftEye - LASH_ROOM, browOuter: leftEye, browInner: leftEye + 1 },
    { x: rightEye, lash: rightEye + EYE, browOuter: rightEye + EYE - 1, browInner: rightEye + EYE - 2 },
  ];
  const bothEyes = (draw: (eye: (typeof eyes)[number]) => Box[]): Box[] => eyes.flatMap(draw);
  const lash = (x: number, y: number): Box[] => (options.lashes ? [cell(x, y, 1, 1, 'eye')] : []);

  return {
    brows: {
      flat: createFlatBrows(area),
      // Inner ends up into the forehead, outer ends where they were: a worried look.
      worried: bothEyes((eye) => [
        cell(eye.browInner, browY + 1, 1, 1, 'brow'),
        cell(eye.browOuter, browY, 1, 1, 'brow'),
      ]),
    },
    eyes: {
      open: createRoundedEyes(area, options.lashes),
      closed: bothEyes((eye) => [cell(eye.x, eyeBottom + 1, EYE, 1, 'eye'), ...lash(eye.lash, eyeBottom)]),
      // Happy arcs, like ^ ^.
      smile: bothEyes((eye) => [
        cell(eye.x, eyeBottom + 1, 1, 1, 'eye'),
        cell(eye.x + 1, eyeBottom + 2, 1, 1, 'eye'),
        cell(eye.x + 2, eyeBottom + 1, 1, 1, 'eye'),
      ]),
    },
    nose: {
      small: createSmallNose(area),
    },
    mouth: {
      line: [cell(mouthLeft, mouthTop, MOUTH, 1, 'mouth')],
      // Corners up.
      smile: [
        cell(mouthLeft, mouthTop, 1, 1, 'mouth'),
        cell(mouthLeft + 1, mouthBottom, 1, 1, 'mouth'),
        cell(mouthLeft + 2, mouthTop, 1, 1, 'mouth'),
      ],
      openSmile: createOpenSmile(area),
      // Open mid-word, as when talking: a dark mouth two rows tall.
      open: [cell(mouthLeft, mouthBottom, MOUTH, 2, 'mouthDark')],
      // Corners down.
      frown: [
        cell(mouthLeft, mouthBottom, 1, 1, 'mouth'),
        cell(mouthLeft + 1, mouthTop, 1, 1, 'mouth'),
        cell(mouthLeft + 2, mouthBottom, 1, 1, 'mouth'),
      ],
    },
    blush: {
      // Level with the mouth, out under the eyes.
      on: options.blush ? blushLeft.map((x) => cell(x, mouthTop, BLUSH, 1, 'cheek')) : [],
      off: [],
    },
  };
}

/**
 * A face fitted to a face area, with every shape of every feature. Changing
 * the expression only changes which shapes show, so it costs nothing to build.
 * The face area must be at least 9 voxels tall and 9 across.
 */
export function createFace(area: FaceArea, options: FaceOptions): Face {
  return { joint: 'head', shapes: layout(area, options) };
}

/**
 * How a face looks `seconds` into an expression. Open eyes blink now and then.
 * `seed` sets each face's own beat, so a crowd does not blink as one.
 */
export function faceAt(expression: ExpressionName, seconds: number, seed = 0): FaceState {
  const state: FaceState = expressions[expression];
  const beat = (((seconds + seed * BLINK_SPREAD_SECONDS) % BLINK_EVERY_SECONDS) + BLINK_EVERY_SECONDS) % BLINK_EVERY_SECONDS;
  return state.eyes === 'open' && beat < BLINK_SECONDS ? { ...state, eyes: 'closed' } : state;
}
