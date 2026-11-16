import { BufferGeometry, Color, Float32BufferAttribute } from 'three';

export interface SculptBlock {
  min: [number, number, number];
  max: [number, number, number];
  color: number;
}

/**
 * Paint blocks into one solid grid, then greedily merge exposed faces.
 * Later blocks replace earlier cells. Internal and coincident faces never reach the mesh.
 */
export function sculptGeometry(blocks: readonly SculptBlock[], cellSize = 0.125): BufferGeometry {
  const origin = [0, 1, 2].map(axis => Math.floor(Math.min(...blocks.map(block => block.min[axis])) / cellSize));
  const size = [0, 1, 2].map(axis => Math.ceil(Math.max(...blocks.map(block => block.max[axis])) / cellSize) - origin[axis] + 1);
  const strides = [1, size[0], size[0] * size[1]];
  const cells = new Uint32Array(size[0] * size[1] * size[2]);
  for (const block of blocks) {
    const min = block.min.map((value, axis) => Math.round(value / cellSize) - origin[axis]);
    const max = block.max.map((value, axis) => Math.max(min[axis] + 1, Math.round(value / cellSize) - origin[axis]));
    for (let z = min[2]; z < max[2]; z++) {
      for (let y = min[1]; y < max[1]; y++) {
        const start = y * strides[1] + z * strides[2];
        cells.fill(block.color + 1, start + min[0], start + max[0]);
      }
    }
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const color = new Color();
  for (let axis = 0; axis < 3; axis++) {
    const u = (axis + 1) % 3;
    const v = (axis + 2) % 3;
    const mask = new Int32Array(size[u] * size[v]);
    for (let plane = 0; plane <= size[axis]; plane++) {
      // Signed colors encode both material and the outward direction.
      for (let j = 0; j < size[v]; j++) {
        for (let i = 0; i < size[u]; i++) {
          const offset = plane * strides[axis] + i * strides[u] + j * strides[v];
          const before = plane > 0 ? cells[offset - strides[axis]] : 0;
          const after = plane < size[axis] ? cells[offset] : 0;
          mask[i + j * size[u]] = before && !after ? before : after && !before ? -after : 0;
        }
      }
      for (let j = 0; j < size[v]; j++) {
        for (let i = 0; i < size[u];) {
          const value = mask[i + j * size[u]];
          if (value === 0) {
            i++;
            continue;
          }
          let width = 1;
          while (i + width < size[u] && mask[i + width + j * size[u]] === value) width++;
          let height = 1;
          extend: while (j + height < size[v]) {
            for (let k = 0; k < width; k++) {
              if (mask[i + k + (j + height) * size[u]] !== value) break extend;
            }
            height++;
          }
          const first = positions.length / 3;
          const normal = [0, 0, 0];
          normal[axis] = Math.sign(value);
          color.setHex(Math.abs(value) - 1);
          for (const [du, dv] of [[0, 0], [width, 0], [width, height], [0, height]]) {
            const point = [...origin];
            point[axis] += plane;
            point[u] += i + du;
            point[v] += j + dv;
            positions.push(...point.map(coordinate => coordinate * cellSize));
            normals.push(...normal);
            colors.push(color.r, color.g, color.b);
          }
          const corners = value > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
          indices.push(...corners.map(corner => first + corner));
          for (let row = 0; row < height; row++) mask.fill(0, i + (j + row) * size[u], i + width + (j + row) * size[u]);
          i += width;
        }
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  return geometry;
}
