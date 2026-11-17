import { Vector3 } from 'three';
import { skippingRopeFor, type Body, type Worn } from '../../../packages/voxel-actors/src';
import type { Figure } from '../figure';
import { createPieces, type HeldProp } from './pieces';

// Which way a rope piece runs before it is turned to lie along its stretch of rope.
const ALONG = new Vector3(1, 0, 0);

/** A skipping rope from hand to hand: one thin piece for each straight stretch, following the rope as it turns. */
export function holdRope(figure: Figure, body: Body, worn: readonly Worn[]): HeldProp {
  const { holder, block, prop } = createPieces();
  const first = skippingRopeFor(body, worn, 0);
  const pieces = first.points.slice(1).map(() => block(first.color, [1, 1, 1], [0, 0, 0]));
  const from = new Vector3();
  const to = new Vector3();
  const move = (clipSeconds: number): void => {
    const rope = skippingRopeFor(body, worn, clipSeconds);
    pieces.forEach((piece, index) => {
      from.set(...rope.points[index]);
      to.set(...rope.points[index + 1]);
      const length = from.distanceTo(to);
      // Each piece reaches half the rope's thickness past both its ends, so the corners meet.
      piece.position.copy(from).add(to).multiplyScalar(0.5);
      piece.scale.set(length + rope.thickness, rope.thickness, rope.thickness);
      if (length > 0) piece.quaternion.setFromUnitVectors(ALONG, to.sub(from).normalize());
    });
  };
  move(0);
  figure.attach(holder, { joint: first.joint, at: [0, 0, 0] });
  return prop(move);
}
