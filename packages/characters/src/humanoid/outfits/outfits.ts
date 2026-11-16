import type { Body } from '../body';
import type { HatStyleName } from '../hats/hats';
import type { Role, Worn } from '../model';
import { baker } from './baker';
import { builder } from './builder';
import { butcher } from './butcher';
import { cook } from './cook';
import { farmer } from './farmer';
import { forester } from './forester';
import { healer } from './healer';
import { herbalist } from './herbalist';
import { hunter } from './hunter';
import { jumpsuit } from './jumpsuit';
import { longSleevesAndTrousers } from './longSleevesAndTrousers';
import { miller } from './miller';
import { painted, type Paint } from './paint';
import { policeman } from './policeman';
import { porter } from './porter';
import { religiousLeader } from './religiousLeader';
import { romper } from './romper';
import { shepherd } from './shepherd';
import { storekeeper } from './storekeeper';
import { tailor } from './tailor';
import { tankAndShorts } from './tankAndShorts';
import { tavernKeeper } from './tavernKeeper';
import { teacher } from './teacher';
import { tshirtAndTrousers } from './tshirtAndTrousers';

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
