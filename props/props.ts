import type { Body, ClipName, Worn } from '../packages/characters/src';
import type { Figure } from '../figure';
import { holdCrate } from './crate';
import { holdHoop } from './hoop';
import type { HeldProp } from './pieces';
import { holdRope } from './rope';

/** Puts a prop on a figure, fitted to the body and to what it wears. */
type PropMaker = (figure: Figure, body: Body, worn: readonly Worn[]) => HeldProp;

/**
 * The prop that shows each motion off. Motions not listed show nothing. A new
 * prop is a new file in this folder, listed here. Studio show only: the game
 * brings its own things.
 */
const props: Partial<Record<ClipName, PropMaker>> = {
  carry: holdCrate,
  hulaHoop: holdHoop,
  ropeSkip: holdRope,
};

/** Puts the prop for a clip on the figure, if the clip has one. */
export function holdProp(figure: Figure, body: Body, worn: readonly Worn[], clip: ClipName): HeldProp | null {
  return props[clip]?.(figure, body, worn) ?? null;
}
