import type { Box as CoreBox, Part as CorePart, Worn as CoreWorn } from '../core/model';
import type { JointName } from './skeleton';
import type { BodyRegionId } from './regions';

export { between, mirrored } from '../core/model';
export type { Corner } from '../core/model';

/**
 * A color by role. The library only names roles, the user of the library
 * picks the colors. Skin tones, seasons and lighting are theirs to decide.
 */
export type Role =
  | 'skin'
  | 'skinShade'
  | 'brow'
  | 'eye'
  | 'eyeIris'
  | 'eyeShine'
  | 'cheek'
  | 'nose'
  | 'mouth'
  | 'mouthDark'
  | 'teeth'
  | 'hair'
  | 'hat'
  | 'hatBand'
  | 'top'
  | 'bottom'
  | 'shoes';

/**
 * A solid block of a person. Body blocks are whole voxels in size. Face blocks
 * are thin, like a decal on the head.
 */
export type Box = CoreBox<Role> & { readonly region?: BodyRegionId };

/** Every base-body block carries a region; worn and facial blocks may omit it. */
export type BodyBox = Box & { readonly region: BodyRegionId };
export type BodyPart = Omit<CorePart<Role, JointName>, 'boxes'> & { readonly boxes: readonly BodyBox[] };

/** One piece of a person: blocks that move together with one joint. */
export type Part = Omit<CorePart<Role, JointName>, 'boxes'> & { readonly boxes: readonly Box[] };

/** Something a person wears, such as hair or a hat: blocks that move with one joint. */
export type Worn = CoreWorn<Role, JointName>;
