import type { EquipmentItem } from '../equipment.js';
import { armAction } from '../actions.js';

const HANDLE = 0x9b6b3d;
const METAL = 0x7d848c;
// The handle sticks out this far from the fist, the head at its far end this big.
const HANDLE_LENGTH = 6;
const HEAD: readonly [number, number, number] = [2, 4, 2];

export const hammer: EquipmentItem = {
  label: 'Hammer',
  hands: ['handLeft', 'handRight'],
  action: armAction('Strike', 0.65, [
    [[-0.85, 0, -0.25], [-0.6, 0, 0]],
    [[-1.35, 0, -0.45], [-0.8, 0, 0]],
    [[-0.85, 0, -0.25], [-0.65, 0, 0]],
    [[-0.6, 0, -0.15], [-0.55, 0, 0]],
  ]),
  grip: [Math.PI / 2, 0, 0],
  blocks: [
    [HANDLE, [1, HANDLE_LENGTH, 1], [0, HANDLE_LENGTH / 2, 0]],
    [METAL, [HEAD[0], HEAD[2], HEAD[1]], [0, HANDLE_LENGTH, HEAD[1] / 4]],
  ],
};
