import type { Body, ClipName, Worn } from '../../../packages/voxel-actors/src';
import type { Figure } from '../figure';
import { holdCrate } from './crate';
import { holdHoop } from './hoop';
import type { HeldProp } from './pieces';
import { holdRope } from './rope';

/** Puts a prop on a figure, fitted to the body and to what it wears. */
type PropMaker = (figure: Figure, body: Body, worn: readonly Worn[]) => HeldProp;

interface PropOption {
  readonly label: string;
  readonly motion?: ClipName;
  readonly attach?: PropMaker;
}

export const studioProps = {
  none: { label: 'None' },
  crate: { label: 'Crate', attach: holdCrate },
  ropeSkip: { label: 'Jump rope', motion: 'ropeSkip', attach: holdRope },
  hulaHoop: { label: 'Hula hoop', motion: 'hulaHoop', attach: holdHoop },
} satisfies Record<string, PropOption>;

export type StudioProp = keyof typeof studioProps;

export function propMotion(prop: StudioProp): ClipName | undefined {
  const option: PropOption = studioProps[prop];
  return option.motion;
}

export function holdProp(figure: Figure, body: Body, worn: readonly Worn[], prop: StudioProp): HeldProp | null {
  const option: PropOption = studioProps[prop];
  return option.attach?.(figure, body, worn) ?? null;
}
