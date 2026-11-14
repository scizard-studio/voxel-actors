import type { Box as CoreBox, Part as CorePart, Worn as CoreWorn } from '../core/model';
import type { JointName } from './skeleton';

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
export type Box = CoreBox<Role>;

/** One piece of a person: blocks that move together with one joint. */
export type Part = CorePart<Role, JointName>;

/** Something a person wears, such as hair or a hat: blocks that move with one joint. */
export type Worn = CoreWorn<Role, JointName>;
