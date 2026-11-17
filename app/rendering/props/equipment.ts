import { equipmentGrip, equipmentItems, type Body, type EquipmentHand, type EquipmentName } from '../../../packages/voxel-actors/src';
import type { Figure } from '../figure';
import { createPieces, type HeldProp } from './pieces';

export function equipItem(figure: Figure, body: Body, hand: EquipmentHand, name: EquipmentName): HeldProp {
  const item = equipmentItems[name];
  const grip = equipmentGrip(body, hand, item);
  const { holder, block, prop } = createPieces();
  for (const [color, size, center] of item.blocks) block(color, size, center);
  figure.attach(holder, grip);
  return prop();
}
