import { BoxGeometry, Group, Mesh, MeshLambertMaterial } from 'three';
import { CHARACTER_SCALE, metresPerVoxel } from './packages/characters/src';

/**
 * The size standard the characters are made for, one voxel to one unit here:
 * a cell of ground is 3 m across and 64 voxels, so a voxel is about 4.7 cm.
 */
export const VOXELS_PER_CELL = CHARACTER_SCALE.voxelsPerCell;
export const METRES_PER_CELL = CHARACTER_SCALE.metresPerCell;
export const METRES_PER_VOXEL = metresPerVoxel(CHARACTER_SCALE);

// A door is 2.2 m tall and a little over 1 m wide. One storey is 3 m.
const DOOR_HEIGHT = Math.round(2.2 / METRES_PER_VOXEL);
const DOOR_WIDTH = Math.round(1.1 / METRES_PER_VOXEL);
const STOREY = VOXELS_PER_CELL;
const WALL_THICKNESS = 2;
// The wall stands behind the figure, with the door beside the figure's left side, at +x, both far
// enough off to leave room for arms out, a swinging hoop and a turning rope.
const WALL_BEHIND = 30;
// The door starts clear of a figure's reach, and a pillar of wall stands past it.
const DOOR_LEFT = 16;
const PILLAR = 8;
// Cells of ground around the figure, in each direction.
const GROUND_CELLS = 2;

function block(material: MeshLambertMaterial, x: number, y: number, z: number, w: number, h: number, d: number): Mesh {
  const mesh = new Mesh(new BoxGeometry(w, h, d).translate(x + w / 2, y + h / 2, z + d / 2), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Ground cells and a one-storey wall with a door, to judge a figure's size against the town. */
export function createScaleGuide(): Group {
  const guide = new Group();
  const wall = new MeshLambertMaterial({ color: 0xf2e6cf });
  const groundA = new MeshLambertMaterial({ color: 0x9fd07a });
  const groundB = new MeshLambertMaterial({ color: 0x8fc46b });

  // The wall: one storey high, with a door cut into it and a pillar on its far side.
  const z = -WALL_BEHIND - WALL_THICKNESS;
  const left = -STOREY / 2;
  const doorX = DOOR_LEFT;
  guide.add(
    block(wall, left, 0, z, doorX - left, STOREY, WALL_THICKNESS),
    block(wall, doorX + DOOR_WIDTH, 0, z, PILLAR, STOREY, WALL_THICKNESS),
    block(wall, doorX, DOOR_HEIGHT, z, DOOR_WIDTH, STOREY - DOOR_HEIGHT, WALL_THICKNESS),
  );

  // Checkered ground cells, so the size of a cell can be seen.
  for (let cz = -GROUND_CELLS; cz < GROUND_CELLS; cz++) {
    for (let cx = -GROUND_CELLS; cx < GROUND_CELLS; cx++) {
      const tile = block((cx + cz) % 2 === 0 ? groundA : groundB, cx * STOREY, -1, cz * STOREY, STOREY, 1, STOREY);
      tile.castShadow = false;
      guide.add(tile);
    }
  }
  return guide;
}
