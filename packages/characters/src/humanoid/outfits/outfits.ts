import type { Body } from '../body';
import type { HatStyleName } from '../hats/hats';
import type { Role } from '../model';
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
 * A whole outfit, top to toe, under one name. Cloth is painted on the body's
 * own blocks, so an outfit adds no block and fits every body. A new outfit is
 * a new file in this folder, listed in `everydayOutfits` or `workOutfits`.
 */
export interface Outfit {
  readonly paint: Paint;
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
}

/**
 * Dresses a body. An everyday outfit takes a color for its main cloth, such
 * as a green jumpsuit or a green t-shirt. A work outfit keeps its own colors.
 */
export function dress(body: Body, name: EverydayOutfitName, color?: number): Dressed;
export function dress(body: Body, name: OutfitName): Dressed;
export function dress(body: Body, name: OutfitName, color?: number): Dressed {
  const outfit: Outfit = outfits[name];
  const colors = color === undefined ? outfit.colors : { ...outfit.colors, top: color };
  return { ...body, parts: painted(body.parts, outfit.paint), colors };
}
