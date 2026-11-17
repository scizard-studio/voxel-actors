import type { Body, SocketName } from '../packages/characters/src';
import type { Figure } from '../figure';
import { hammer } from './hammer';
import { createPieces, type HeldProp } from './pieces';

const hands = ['handRight', 'handLeft'] as const satisfies readonly SocketName[];
export type EquipmentHand = (typeof hands)[number];
type Triple = readonly [number, number, number];

export interface EquipmentItem {
  readonly label: string;
  readonly hands: readonly EquipmentHand[];
  readonly action?: 'work';
  readonly grip: Triple;
  readonly blocks: readonly (readonly [color: number, size: Triple, center: Triple])[];
}

export const equipmentItems: Readonly<Record<'hammer' | 'sword' | 'shield', EquipmentItem>> = {
  hammer,
  sword: {
    label: 'Sword',
    hands,
    grip: [Math.PI / 2, 0, 0],
    blocks: [
      [0x785237, [0.8, 2, 0.8], [0, 0, 0]],
      [0xcba045, [3, 0.75, 1], [0, 1.25, 0]],
      [0xacbbc8, [1.5, 7, 0.65], [0, 5, 0]],
      [0xacbbc8, [0.75, 1, 0.65], [0, 9, 0]],
    ],
  },
  shield: {
    label: 'Shield',
    hands,
    grip: [0, 0, 0],
    blocks: [
      [0x607687, [5.5, 5.5, 0.75], [0, 0.5, 1.35]],
      [0x35766b, [4.5, 4.5, 0.35], [0, 0.5, 1.85]],
      [0x607687, [3.5, 1.25, 0.75], [0, -2.75, 1.35]],
      [0x607687, [1.75, 1, 0.75], [0, -3.875, 1.35]],
      [0xc6aa68, [1.5, 1.5, 0.65], [0, 0.5, 2.1]],
    ],
  },
};

export type EquipmentName = keyof typeof equipmentItems;
export type Equipment = Record<EquipmentHand, EquipmentName | null>;

export function actionHand(equipment: Equipment, action: NonNullable<EquipmentItem['action']>): EquipmentHand | undefined {
  return hands.find(hand => {
    const name = equipment[hand];
    return name !== null && equipmentItems[name].hands.includes(hand) && equipmentItems[name].action === action;
  });
}

export function equipItem(figure: Figure, body: Body, hand: EquipmentHand, name: EquipmentName): HeldProp {
  const item = equipmentItems[name];
  if (!item.hands.includes(hand)) throw new Error(`${item.label} cannot be equipped in ${hand}.`);
  const { holder, block, prop } = createPieces();
  for (const [color, size, center] of item.blocks) block(color, size, center);
  figure.attach(holder, { ...body.sockets[hand], rotation: item.grip });
  return prop();
}
