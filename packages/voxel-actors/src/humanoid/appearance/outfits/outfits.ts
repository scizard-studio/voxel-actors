import type { Body } from '../../body.js';
import type { HatStyleName } from '../hats/hats.js';
import type { Role, Worn } from '../../model.js';
import { baker } from './baker.js';
import { builder } from './builder.js';
import { butcher } from './butcher.js';
import { cook } from './cook.js';
import { farmer } from './farmer.js';
import { forester } from './forester.js';
import { healer } from './healer.js';
import { herbalist } from './herbalist.js';
import { hunter } from './hunter.js';
import { jumpsuit } from './jumpsuit.js';
import { longSleevesAndTrousers } from './longSleevesAndTrousers.js';
import { miller } from './miller.js';
import { painted, type Paint } from './paint.js';
import { policeman } from './policeman.js';
import { porter } from './porter.js';
import { religiousLeader } from './religiousLeader.js';
import { romper } from './romper.js';
import { shepherd } from './shepherd.js';
import { storekeeper } from './storekeeper.js';
import { tailor } from './tailor.js';
import { tankAndShorts } from './tankAndShorts.js';
import { tavernKeeper } from './tavernKeeper.js';
import { teacher } from './teacher.js';
import { tshirtAndTrousers } from './tshirtAndTrousers.js';

/**
 * An outfit can recolor named regions and add joint-attached geometry.
 * Geometry recipes receive the resolved body, so fitting uses actual dimensions.
 */
export interface Outfit {
  readonly paint: Paint;
  /** Additional geometry, such as a skirt or cape. Does not alter the base body. */
  readonly build?: (body: Body) => readonly Worn[];
  /** A hat that belongs to the outfit, such as a builder's hard hat. */
  readonly hat?: HatStyleName;
  /** The outfit's own color for each role it uses. */
  readonly colors: Partial<Record<Role, number>>;
}

/** Clothes worn in personal time. Each comes in any color. */
export const everydayOutfits = {
  tshirtAndTrousers,
  longSleevesAndTrousers,
  tankAndShorts,
  romper,
  jumpsuit,
} satisfies Record<string, Outfit>;

/**
 * Clothes worn at work, one look per job, so a job is known at a glance. Their colors are part of the look.
 * The policeman is not a job in the game: it is kept for others who use the library.
 */
export const workOutfits = {
  builder,
  porter,
  hunter,
  storekeeper,
  forester,
  farmer,
  shepherd,
  miller,
  baker,
  butcher,
  tailor,
  herbalist,
  teacher,
  healer,
  religiousLeader,
  tavernKeeper,
  cook,
  policeman,
} satisfies Record<string, Outfit>;

/** Every outfit, by name, in the order they are offered. */
export const outfits = { ...everydayOutfits, ...workOutfits };

export type EverydayOutfitName = keyof typeof everydayOutfits;
export type WorkOutfitName = keyof typeof workOutfits;
export type OutfitName = keyof typeof outfits;

/** A body dressed in an outfit: painted, and carrying the colors of what it wears, ready to draw. */
export interface Dressed extends Body {
  readonly colors: Partial<Record<Role, number>>;
  readonly worn: readonly Worn[];
}

/** Compose a custom outfit without modifying the registry or the source body. */
export function applyOutfit(body: Body, outfit: Outfit, color?: number): Dressed {
  const colors = color === undefined ? { ...outfit.colors } : { ...outfit.colors, top: color };
  const worn = outfit.build?.(body) ?? [];
  const joints = new Set(body.joints.map(joint => joint.name));
  for (const piece of worn) {
    if (!joints.has(piece.joint)) throw new Error(`Outfit references unknown joint ${piece.joint}.`);
    for (const box of piece.boxes) {
      if (box.at.length !== 3 || box.size.length !== 3 || !box.at.every(Number.isFinite) || !box.size.every(value => Number.isFinite(value) && value > 0)) {
        throw new Error('Outfit geometry requires finite coordinates and positive dimensions.');
      }
    }
  }
  return { ...body, parts: painted(body.parts, outfit.paint), colors, worn };
}

/**
 * Dresses a body. An everyday outfit takes a color for its main cloth, such
 * as a green jumpsuit or a green t-shirt. A work outfit keeps its own colors.
 */
export function dress(body: Body, name: EverydayOutfitName, color?: number): Dressed;
export function dress(body: Body, name: OutfitName): Dressed;
export function dress(body: Body, name: OutfitName, color?: number): Dressed {
  const outfit: Outfit = outfits[name];
  return applyOutfit(body, outfit, color);
}
