import type { HeadShape } from '../body';
import { between, mirrored, type Box, type Corner } from '../model';

/**
 * Shared pieces that hairstyles are built from. Each piece fits itself to the
 * head it is given, so a style made of pieces fits every head.
 */

/** Where hair goes on a head, in its own voxels. */
export interface HeadEdges {
  /** x of the head's left side. */
  readonly side: number;
  readonly top: number;
  /** z of the face, and of the back of the head. */
  readonly front: number;
  readonly back: number;
  /** x of the face's left edge, and y of its top. */
  readonly faceSide: number;
  readonly faceTop: number;
}

// Sides that cover the ears stop this far above the base of the head, leaving room below them for
// an arm raised out to the side.
const SIDE_LIFT = 3;
// A fall of hair down the back keeps this far in from the sides of the head, so swinging arms pass it.
const FALL_INSET = 4;

/** A block of hair between two opposite corners. */
export function block(from: Corner, to: Corner): Box {
  return between(from, to, 'hair');
}

/** A block on the head's left side, and its twin on the right. */
export function pair(from: Corner, to: Corner): Box[] {
  const left = block(from, to);
  return [left, mirrored(left)];
}

export function edges(head: HeadShape): HeadEdges {
  return {
    side: head.width / 2,
    top: head.height,
    front: head.depth / 2,
    back: -head.depth / 2,
    faceSide: head.face.left + head.face.width,
    faceTop: head.face.bottom + head.face.height,
  };
}

/** Over the top of the head, with a second layer in the middle for a rounded crown. */
export function cap(head: HeadShape): Box[] {
  const { side, top, front, back } = edges(head);
  return [block([-side, top, back - 1], [side, top + 1, front]), block([-side + 2, top + 1, back], [side - 2, top + 2, front - 1])];
}

/** Over the back of the head, from `bottom` up. */
export function backOfHead(head: HeadShape, bottom: number): Box {
  const { side, top, back } = edges(head);
  return block([-side, bottom, back - 1], [side, top, back]);
}

/** Sides that cover the ears, standing a voxel clear of them. */
export function coveredSides(head: HeadShape): Box[] {
  const { side, top, front, back } = edges(head);
  return pair([side, SIDE_LIFT, back - 1], [side + head.ears.reach + 1, top, front]);
}

/** Sides close to the head, above and behind the ears, which show. */
export function tuckedSides(head: HeadShape): Box[] {
  const { side, top, front, back } = edges(head);
  const { bevel, ears } = head;
  return [
    ...pair([side, ears.top, back - 1], [side + ears.reach, top, front]),
    ...pair([side, bevel + 1, back - 1], [side + ears.reach, ears.top, ears.back]),
  ];
}

/** A lock down each side of the face, a voxel proud of it. */
export function sideLocks(head: HeadShape): Box[] {
  const { side, top, front, faceSide } = edges(head);
  return pair([faceSide, head.bevel, front - head.bevel], [side, top + 1, front + 1]);
}

/** A straight fringe along the top edge of the face, a voxel proud of it. */
export function straightFringe(head: HeadShape): Box {
  const { side, top, front } = edges(head);
  return block([-side, top - head.bevel, front - head.bevel], [side, top + 1, front + 1]);
}

/** A fringe along the top edge of the face, a voxel proud of it, in two halves either side of a middle parting. */
export function partedFringe(head: HeadShape): Box[] {
  const { top, front, faceSide } = edges(head);
  return pair([0.5, top - head.bevel, front - head.bevel], [faceSide, top + 1, front + 1]);
}

/** The ends of a fringe, curving down over the outer corners of the forehead, clear of the brows. */
export function fringeEnds(head: HeadShape): Box[] {
  const { front, faceSide, faceTop } = edges(head);
  return [
    ...pair([faceSide - 2, faceTop - 1, front], [faceSide, faceTop, front + 1]),
    ...pair([faceSide - 1, faceTop - 2, front], [faceSide, faceTop - 1, front + 1]),
  ];
}

/** A fall of hair down the back, this share of the head's height below the head. */
export function fall(head: HeadShape, share: number): Box {
  const { side, back } = edges(head);
  return block([-side + FALL_INSET, -Math.round(head.height * share), back - 1], [side - FALL_INSET, head.bevel, back + 2]);
}
