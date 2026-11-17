import type { HeadShape } from '../../body.js';
import { edges } from '../hair/shapes.js';
import { between, type Box } from '../../model.js';

// The rim stands this far out from the head, and its peak this far further over the face.
const RIM = 1;
const PEAK = 1;
// The shell is this tall above the rim, and its top is rounded in this far.
const SHELL_HEIGHT = 2;
const ROUND = 2;

/** A hard hat: a rim with a short peak just above the face, a shell, and a rounded top. */
export function hardHat(head: HeadShape): Box[] {
  const { side, front, back, faceTop } = edges(head);
  const shellBottom = faceTop + 1;
  const shellTop = shellBottom + SHELL_HEIGHT;
  return [
    between([-side - RIM, faceTop, back - RIM], [side + RIM, shellBottom, front + RIM + PEAK], 'hat'),
    between([-side, shellBottom, back], [side, shellTop, front], 'hat'),
    between([-side + ROUND, shellTop, back + 1], [side - ROUND, shellTop + 1, front - 1], 'hat'),
  ];
}
