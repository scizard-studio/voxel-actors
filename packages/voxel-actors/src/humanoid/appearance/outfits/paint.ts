import type { BodyPart, Role } from '../../model.js';
import type { BodyRegionId } from '../../regions.js';

/** The regions of a body that cloth can cover. Painting one colors the body's own blocks: no block is added. */
export type Region = 'hips' | 'waist' | 'chest' | 'upperArms' | 'forearms' | 'thighs' | 'shins' | 'feet';

/** Which role each painted region takes. A region left out stays bare skin. */
export type Paint = Partial<Record<Region | BodyRegionId, Role>>;

// Bilateral aliases preserve existing outfits; explicit region keys take precedence.
const GROUPS: Partial<Record<BodyRegionId, Region>> = {
  upperArmLeft: 'upperArms', upperArmRight: 'upperArms',
  forearmLeft: 'forearms', forearmRight: 'forearms',
  thighLeft: 'thighs', thighRight: 'thighs',
  shinLeft: 'shins', shinRight: 'shins',
  footLeft: 'feet', footRight: 'feet',
};

/** The body's parts with their painted regions recolored. */
export function painted(parts: readonly BodyPart[], paint: Paint): BodyPart[] {
  return parts.map((part) => {
    return {
      ...part,
      boxes: part.boxes.map((box) => {
        const region = box.region;
        const group = GROUPS[region];
        const role = paint[region] ?? (group === undefined ? undefined : paint[group]);
        return role === undefined ? box : { ...box, role };
      }),
    };
  });
}
