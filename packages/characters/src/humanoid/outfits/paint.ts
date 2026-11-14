import type { Part, Role } from '../model';

/** The regions of a body that cloth can cover. Painting one colors the body's own blocks: no block is added. */
export type Region = 'hips' | 'waist' | 'chest' | 'upperArms' | 'forearms' | 'thighs' | 'shins' | 'feet';

/** Which role each painted region takes. A region left out stays bare skin. */
export type Paint = Partial<Record<Region, Role>>;

// The region each block of a body part belongs to, in the order the body builds them. Left and
// right parts are alike. Null is never painted: the neck and the hands.
const REGIONS: Record<string, readonly (Region | null)[]> = {
  pelvis: ['hips'],
  torso: ['waist', 'chest', null],
  upperArm: ['upperArms', 'upperArms'],
  lowerArm: ['forearms', null],
  upperLeg: ['thighs'],
  lowerLeg: ['shins', 'feet'],
};

/** The body's parts with their painted regions recolored. */
export function painted(parts: readonly Part[], paint: Paint): Part[] {
  return parts.map((part) => {
    const regions = REGIONS[part.name.replace(/(Left|Right)$/, '')] ?? [];
    return {
      ...part,
      boxes: part.boxes.map((box, index) => {
        const region = regions[index];
        const role = region == null ? undefined : paint[region];
        return role === undefined ? box : { ...box, role };
      }),
    };
  });
}
