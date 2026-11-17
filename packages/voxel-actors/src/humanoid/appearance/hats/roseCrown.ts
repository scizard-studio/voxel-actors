import type { HeadShape } from '../../body.js';
import { between, type Box, type Role } from '../../model.js';

const ROSE = ['.ppp.', 'ppppp', 'ppspp', 'ppssp', '.ppp.'];
const PETAL_SIZE = 0.48;

export function roseCrown(head: HeadShape): Box[] {
  const side = head.width / 2 + head.ears.reach + 1;
  const front = head.depth / 2 + 0.65;
  const back = -head.depth / 2 - 1;
  const y = head.height - 1.15;
  const band = 0.44;
  const boxes: Box[] = [
    between([-side - band, y - band, front], [side + band, y + band, front + band], 'roseLeaf'),
    between([-side - band, y - band, back - band], [side + band, y + band, back], 'roseLeaf'),
    between([-side - band, y - band, back], [-side, y + band, front], 'roseLeaf'),
    between([side, y - band, back], [side + band, y + band, front], 'roseLeaf'),
  ];

  function bloom(axis: 'x' | 'z', center: number, surface: number, outward: number) {
    function tile(u: number, v: number, width: number, height: number, depth: number, role: Role) {
      const tip = surface + outward * depth;
      const near = Math.min(surface, tip);
      const far = Math.max(surface, tip);
      boxes.push(axis === 'z'
        ? between([u, v, near], [u + width, v + height, far], role)
        : between([near, v, u], [far, v + height, u + width], role));
    }
    const left = center - ROSE[0].length * PETAL_SIZE / 2;
    tile(left - 0.45, y - 0.35, 0.65, 0.7, 0.45, 'roseLeaf');
    tile(left + 2.2, y - 0.45, 0.65, 0.7, 0.45, 'roseLeaf');
    for (const [row, line] of ROSE.entries()) {
      for (const [column, petal] of [...line].entries()) {
        if (petal === '.') continue;
        tile(left + column * PETAL_SIZE, y + (2 - row - 0.5) * PETAL_SIZE,
          PETAL_SIZE, PETAL_SIZE, petal === 's' ? 0.8 : 0.55, petal === 's' ? 'roseShade' : 'rosePetal');
      }
    }
  }

  for (const x of [-side * 0.72, -side * 0.24, side * 0.24, side * 0.72]) {
    bloom('z', x, front + band, 1);
    bloom('z', x, back - band, -1);
  }
  for (const direction of [-1, 1]) {
    for (const z of [back * 0.46, front * 0.46]) bloom('x', z, direction * (side + band), direction);
  }
  return boxes;
}
