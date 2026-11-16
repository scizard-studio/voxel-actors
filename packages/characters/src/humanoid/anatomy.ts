import type { Body } from './body';
import type { BodyBox, Corner } from './model';
import type { JointName } from './skeleton';
import { measureSolids, type SolidMeasurements } from '../core/measure';
import { bodyRegions, isBodyRegion, parentRegion, type BodyRegionId } from './regions';

export interface RegionMeasurements extends SolidMeasurements {
  readonly id: BodyRegionId;
  readonly label: string;
  readonly parent?: BodyRegionId;
  readonly joints: readonly JointName[];
}

export interface AnatomyMeasurements {
  /** Unposed bind geometry; no clothing, hair, face decals, or posture rotations. */
  readonly space: 'bind';
  readonly total: SolidMeasurements;
  /** Parent measurements include descendants: do not sum these to get the total. */
  readonly regions: readonly RegionMeasurements[];
}

/** One source of anatomy facts for any interface or renderer. */
export function measureBody(body: Body): AnatomyMeasurements {
  const positions = new Map<JointName, Corner>();
  for (const joint of body.joints) {
    const parent = joint.parent === null ? [0, 0, 0] : positions.get(joint.parent);
    if (!parent) throw new Error(`Missing or unordered parent for joint ${joint.name}.`);
    if (positions.has(joint.name)) throw new Error(`Duplicate joint ${joint.name}.`);
    positions.set(joint.name, [parent[0] + joint.at[0], parent[1] + joint.at[1], parent[2] + joint.at[2]]);
  }
  const blocks = body.parts.flatMap(part => {
    const position = positions.get(part.joint);
    if (!position) throw new Error(`Unknown joint ${part.joint}.`);
    return part.boxes.map(box => ({
      ...box, joint: part.joint,
      at: [position[0] + box.at[0], position[1] + box.at[1], position[2] + box.at[2]] as Corner,
    } satisfies BodyBox & { joint: JointName }));
  });
  return {
    space: 'bind', total: measureSolids(blocks),
    regions: (Object.keys(bodyRegions) as BodyRegionId[]).flatMap(id => {
      const selected = blocks.filter(box => isBodyRegion(box.region, id));
      return selected.length ? [{
        id, label: bodyRegions[id].label, parent: parentRegion(id),
        joints: [...new Set(selected.map(box => box.joint))], ...measureSolids(selected),
      }] : [];
    }),
  };
}
