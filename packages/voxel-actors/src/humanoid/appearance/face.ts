import type { FaceArea, Gender } from '../body.js';
import type { Box } from '../model.js';
import { createFlatBrows, createWorriedBrows } from './face/brows.js';
import { createEyeShapes } from './face/eyes.js';
import { faceLayout, LAYER } from './face/layout.js';
import { createMouthShapes } from './face/mouth.js';
import { createSmallNose } from './face/nose.js';

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
export function faceOptionsFor(gender: Gender, overrides: Partial<FaceOptions> = {}): FaceOptions {
  return { lashes: gender === 'female', blush: gender === 'female', ...overrides };
}

export const expressions = {
  normal: { brows: 'flat', eyes: 'open', nose: 'small', mouth: 'line', blush: 'on' },
  happy: { brows: 'flat', eyes: 'open', nose: 'small', mouth: 'openSmile', blush: 'on' },
  smiling: { brows: 'flat', eyes: 'smile', nose: 'small', mouth: 'smile', blush: 'on' },
  sad: { brows: 'worried', eyes: 'open', nose: 'small', mouth: 'frown', blush: 'off' },
} satisfies Record<string, FaceState>;

export type ExpressionName = keyof typeof expressions;

// Open eyes blink now and then, for a moment, each face on its own beat.
const BLINK_EVERY_SECONDS = 3.7;
const BLINK_SECONDS = 0.13;
const BLINK_SPREAD_SECONDS = 1.3;

function layout(area: FaceArea, options: FaceOptions): FaceShapes {
  const { unit, center, top, halfSpacing } = faceLayout(area);
  return {
    brows: { flat: createFlatBrows(area), worried: createWorriedBrows(area) },
    eyes: createEyeShapes(area, options.lashes),
    nose: { small: createSmallNose(area) },
    mouth: createMouthShapes(area),
    blush: {
      on: options.blush ? [-1, 1].map((side): Box => ({
        at: [center + side * halfSpacing - 2 * unit, top - 7 * unit, area.front],
        size: [4 * unit, unit, LAYER],
        role: 'cheek',
      })) : [],
      off: [],
    },
  };
}

export function faceBoxes(face: Face, state: FaceState = expressions.normal): readonly Box[] {
  function blocks<K extends FeatureName>(feature: K): readonly Box[] {
    return face.shapes[feature][state[feature]];
  }
  return (Object.keys(face.shapes) as FeatureName[]).flatMap(blocks);
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
