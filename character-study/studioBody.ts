import { createBody, createFace, expressions, faceOptionsFor, type Box, type FeatureName, type JointName } from '../packages/characters/src';
import { hairColors, roleColors, skinTones } from '../palette';
import type { SculptBlock } from './voxelGeometry';

export const STUDIO_FOREHEAD_HEIGHT = 1.5;

/** The studio's adult female anatomy and happy face, placed at its resting joint positions. */
export function studioBodyBlocks(): SculptBlock[] {
  const body = createBody({ age: 'adult', gender: 'female' });
  const face = createFace(body.head.face, faceOptionsFor(body.spec.gender));
  const colors = roleColors(skinTones[0], hairColors[0]);
  const positions = new Map<JointName, [number, number, number]>();
  for (const joint of body.joints) {
    const parent = joint.parent === null ? [0, 0, 0] : positions.get(joint.parent)!;
    positions.set(joint.name, [parent[0] + joint.at[0], parent[1] + joint.at[1], parent[2] + joint.at[2]]);
  }
  const blocks: SculptBlock[] = [];
  function append(boxes: readonly Box[], joint: JointName): void {
    const position = positions.get(joint)!;
    for (const box of boxes) {
      const min: [number, number, number] = [position[0] + box.at[0], position[1] + box.at[1], position[2] + box.at[2]];
      blocks.push({
        min,
        max: [min[0] + box.size[0], min[1] + box.size[1], min[2] + box.size[2]],
        color: colors[box.role],
      });
    }
  }
  for (const part of body.parts) {
    const boxes = part.name === 'head' ? part.boxes.map(box => {
      // Extend only skull blocks that reach the crown, preserving the ears and jaw.
      if (box.at[1] + box.size[1] < body.head.height - body.head.bevel) return box;
      return { ...box, size: [box.size[0], box.size[1] + STUDIO_FOREHEAD_HEIGHT, box.size[2]] as const };
    }) : part.boxes;
    append(boxes, part.joint);
  }
  for (const feature of Object.keys(face.shapes) as FeatureName[]) {
    const shapes = face.shapes[feature] as Record<string, readonly Box[]>;
    append(shapes[expressions.happy[feature]], face.joint);
  }
  return blocks;
}
