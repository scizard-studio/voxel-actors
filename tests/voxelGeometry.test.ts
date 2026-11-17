import { expect, it } from 'vitest';
import { sculptGeometry } from '../app/rendering/voxelGeometry';

it('emits only the exterior of overlapping blocks, even across different colors', () => {
  const geometry = sculptGeometry([
    { min: [0, 0, 0], max: [2, 2, 2], color: 0xff0000 },
    { min: [1, 0, 0], max: [3, 2, 2], color: 0x00ff00 },
  ]);
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const index = geometry.getIndex()!;
  let area = 0;
  const faces = new Set<string>();
  for (let i = 0; i < index.count; i += 3) {
    const vertices = [0, 1, 2].map(offset => {
      const vertex = index.getX(i + offset);
      return [positions.getX(vertex), positions.getY(vertex), positions.getZ(vertex)];
    });
    const a = vertices[1].map((value, axis) => value - vertices[0][axis]);
    const b = vertices[2].map((value, axis) => value - vertices[0][axis]);
    const cross = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    area += Math.hypot(...cross) / 2;
    const normalIndex = index.getX(i);
    expect(cross[0] * normals.getX(normalIndex) + cross[1] * normals.getY(normalIndex) + cross[2] * normals.getZ(normalIndex)).toBeGreaterThan(0);
    const key = vertices.map(vertex => vertex.join(',')).sort().join('|');
    expect(faces.has(key)).toBe(false);
    faces.add(key);
  }
  // The union is one 3 � 2 � 2 cuboid with surface area 32.
  expect(area).toBe(32);
  geometry.dispose();
});
