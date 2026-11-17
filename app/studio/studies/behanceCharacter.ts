import { buildBehanceFace } from './behanceFace';
import { Group, Mesh, MeshStandardMaterial } from 'three';
import { sculptGeometry, type SculptBlock } from '../../rendering/voxelGeometry';

type Look = 'base' | 'dressed';

/** A shared body and face, with the gold gown and brown hairstyle fitted around them. */
export function createBehanceCharacter(look: Look): Group {
  const blocks: SculptBlock[] = [];
  const skin = 0xf6c5a4;
  const skinShadow = 0xe9ac8b;
  const brown = 0x955d35;
  const brownLight = 0x9f6b40;
  const brownShadow = 0x784629;
  const gold = 0xe6a01b;
  const goldShadow = 0xcb8314;
  const goldLight = 0xf3b02d;
  const ivory = 0xffdc88;
  const green = 0x205c36;
  const greenLight = 0x2d7543;
  const greenDark = 0x103b25;

  // Boxes are painted into a solid voxel volume, avoiding coincident surfaces.
  function box(x: number, y: number, z: number, w: number, h: number, d: number, color: number): void {
    blocks.push({ min: [x - w / 2, y, z - d / 2], max: [x + w / 2, y + h, z + d / 2], color });
  }
  function bevel(x: number, y: number, z: number, w: number, h: number, d: number, cut: number, color: number): void {
    box(x, y + cut, z, w, h - 2 * cut, d - 2 * cut, color);
    box(x, y, z, w - 2 * cut, h, d - 2 * cut, color);
    box(x, y + cut, z, w - 2 * cut, h - 2 * cut, d, color);
  }
  function pixels(pattern: readonly string[], x: number, top: number, z: number, unit: number, colors: Record<string, number>): void {
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        const color = colors[pattern[row][col]];
        if (color !== undefined) box(x + (col + 0.5) * unit, top - (row + 1) * unit, z - 0.125, unit, unit, 0.25, color);
      }
    }
  }

  // Interpolated cross-sections produce small voxel steps around the silhouette.
  function section(x: number, y: number, z: number, width: number, depth: number): void {
    box(x, y, z, width, 0.25, depth - 0.75, skin);
    box(x, y, z, width - 0.375, 0.25, depth - 0.25, skin);
    box(x, y, z, width - 0.75, 0.25, depth, skin);
  }
  const torsoProfile = [
    [9.25, 6.25, 3.75], [10.25, 7.25, 4.5], [11.5, 7.5, 4.75],
    [13.5, 6.5, 4.25], [15.25, 6.75, 4.5], [17.75, 7.5, 4.75],
    [19, 7.25, 4.5], [20.25, 4.5, 3.5],
  ];
  for (let y = 9.25; y < 20.25; y += 0.25) {
    const end = torsoProfile.findIndex(point => point[0] > y);
    const a = torsoProfile[end - 1];
    const b = torsoProfile[end];
    const t = (y - a[0]) / (b[0] - a[0]);
    section(0, y, 0, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t);
  }
  box(0, 19.75, 0, 2.75, 2.25, 2.75, skin);
  for (const side of [-1, 1]) {
    for (let y = 1; y < 10.5; y += 0.25) {
      const width = y < 5 ? 2.125 + 0.5 * Math.sin((y - 1) / 4 * Math.PI) : 2.5 + (y - 5) * 0.125;
      section(side * 1.875, y, 0, width, width + 0.25);
    }
    bevel(side * 1.875, 0, 0.625, 2.625, 1.375, 3.875, 0.25, skin);
    for (let y = 11.5; y < 19.75; y += 0.25) {
      const shoulder = Math.max(0, (y - 18.5) / 1.25);
      const width = (y < 15 ? 1.875 + (y - 11.5) * 0.1 : 2.25) - shoulder * 0.75;
      const x = 4.75 - Math.max(0, y - 16) * 0.16;
      section(side * x, y, 0, width, width + 0.25);
    }
    bevel(side * 4.75, 9.75, 0.25, 2, 2.5, 2.5, 0.375, skin);
    box(side * 3.875, 10.5, 0.875, 0.5, 1, 0.75, skin);
  }

  if (look === 'dressed') {
    // The cape is fitted over the shoulders and falls in thin, stepped folds.
    for (let row = 0; row < 42; row++) {
      const y = row * 0.5;
      const outside = 10 - Math.floor(y / 2) * 0.5;
      const inside = 4.7 + Math.max(0, 10 - y) * 0.045;
      const back = -4.25 - (21 - y) * 0.05;
      box(0, y, back, outside * 2, 0.5, 0.75, green);
      for (const side of [-1, 1]) {
        const width = outside - inside;
        const foldDepth = 1.875 - back + 0.375;
        const foldCenter = (1.875 + back - 0.375) / 2;
        box(side * (inside + width / 2), y, foldCenter, width, 0.5, foldDepth, greenDark);
        box(side * (outside - 0.3), y, foldCenter, 0.6, 0.5, foldDepth, green);
        box(side * (outside - 0.25), y, 1.95, 0.5, 0.5, 0.25, greenLight);
      }
    }
    for (const side of [-1, 1]) {
      box(side * 9.1, 0, -1.1, 3.8, 0.375, 8, greenLight);
      box(side * 9.05, 0.375, -1.25, 2.8, 0.25, 7.25, green);
    }

    // Each skirt tier grows slightly toward the floor. Pleats lie on its surface.
    for (let row = 0; row < 28; row++) {
      const y = row * 0.5;
      const w = 7.25 + Math.floor((13.5 - y) / 2) * 0.375;
      const d = 5.25 + Math.floor((13.5 - y) / 3) * 0.375;
      box(0, y, 0, w, 0.5, d, gold);
      for (const x of [-3.5, -1.875, 0.25, 2.375, 3.625]) {
        box(x, y, d / 2 - 0.0625, 0.125, 0.5, 0.125, goldShadow);
        box(x + 0.25, y, d / 2 - 0.0625, 0.125, 0.5, 0.125, goldLight);
      }
      for (const side of [-1, 1]) {
        box(side * (w / 2 - 0.125), y, 0, 0.25, 0.5, d, goldShadow);
      }
      // The bottom sprigs wrap onto the sides of the hem.
      if (y < 2) {
        const sprig = ['..I..', '.I.I.', '.I.I.', 'I...I'][3 - Math.floor(y / 0.5)];
        for (const x of [-3.5, -1.25, 1.25, 3.5]) pixels([sprig, sprig], x - 0.625, y + 0.5, d / 2, 0.25, { I: ivory });
      }
    }
    bevel(0, 13.5, 0, 6.75, 2, 4.75, 0.125, gold);
    bevel(0, 15.25, 0, 7.875, 3.75, 5, 0.125, gold);
    // Straps frame a modest square neckline.
    for (const side of [-1, 1]) box(side * 3.375, 18.75, 0, 0.75, 1.5, 4.75, gold);
    box(0, 14.875, 2.5, 6.75, 0.25, 0.25, goldShadow);
    pixels([
      '....I.....I.....I....',
      '...ILI...ILI...ILI...',
      '..IL.LI.IL.LI.IL.LI..',
      '...I.I...I.I...I.I...',
      '....I.....I.....I....',
      '.I....I.I....I.I...I.',
      'ILI..ILIIL..ILIIL.ILI',
      '.I....I.I....I.I...I.',
      '..I.I...I.I...I.I...',
      '...I.....I.....I....',
    ], -3.5, 18.75, 2.5, 0.35, { I: ivory, L: 0xf8bf4f });

    for (const side of [-1, 1]) {
      for (let step = 0; step < 5; step++) {
        const x = side * (1.1 + step * 0.8);
        const y = 21.5 - step * 0.375;
        box(x, y, 0.125, 1, 0.625, 4.5, green);
        box(x, y, 2.375, 0.75, 0.375, 0.25, greenLight);
      }
    }
    box(-0.375, 20, 2.25, 0.25, 1.625, 0.25, greenDark);
    box(0.375, 19.75, 2.25, 0.25, 1.875, 0.25, greenLight);
    box(0, 21.25, 2.375, 0.5, 0.5, 0.25, ivory);
  }

  const headStart = blocks.length;
  // The face has full cheeks and a small rounded jaw; its front remains one plane.
  const headRows = [
    [22, 0.5, 9.5, 6.5], [22.5, 0.5, 11, 7],
    [23, 0.5, 12, 7.5], [23.5, 1, 13, 8],
    [24.5, 9, 13.5, 8], [33.5, 0.75, 13, 7.5],
    [34.25, 0.75, 12, 7], [35, 0.5, 10.5, 6],
  ];
  for (const [y, height, width, depth] of headRows) {
    box(0, y, 4 - depth / 2, width, height, depth, skin);
  }
  // The upper ear follows eyebrow height, with a short, inset inner fold.
  for (const side of [-1, 1]) {
    box(side * 6.875, 26.5, 0, 1, 3, 1.75, skin);
    box(side * 7.25, 27, 0, 0.75, 2, 1.75, skin);
    box(side * 7.5, 27.25, 0.125, 0.25, 1.5, 1, skinShadow);
    box(side * 7.5, 27.25, 0.375, 0.25, 0.375, 0.5, 0xf0b598);
  }
  buildBehanceFace((x, y, z, w, h, d, color) => box(x, y + 22, z + 4, w, h, d, color));

  if (look === 'dressed') {
    // The back curtain and sides wrap the head, with broader steps only at the ends.
    box(0, 18.5, -4.625, 14.5, 17, 1.25, brownShadow);
    for (const side of [-1, 1]) {
      for (const [y, height, x, width] of [[22, 13, 7.125, 1.25], [19.5, 2.5, 7.375, 1.25], [17.5, 2, 7.75, 1.5], [16.75, 0.75, 8, 1.75]]) {
        box(side * x, y, -0.125, width, height, 9.25, brown);
        box(side * x, y, 4.5, width, 0.125, 0.25, brownLight);
      }
    }
    // A broad rounded cap gives the hair a continuous forehead-facing surface.
    box(0, 31.75, -0.125, 15, 3.25, 9.75, brown);
    for (let layer = 0; layer < 5; layer++) {
      box(0, 35 + layer * 0.5, -0.25, 14.5 - layer, 0.5, 9.5 - layer * 0.5, brownLight);
    }
    const fringe = [
      [-5.5, 2.5, 31.25], [-3, 2.25, 31], [-0.5, 2.5, 30.875],
      [2.125, 2.5, 31.125], [4.875, 2.75, 31],
    ];
    for (const [x, width, bottom] of fringe) {
      box(x, bottom + 0.375, 4.375, width, 2.125, 0.75, brown);
      box(x - 0.125, bottom, 4.375, width - 0.5, 0.375, 0.75, brown);
      box(x + width / 2 - 0.125, bottom + 1, 4.625, 0.125, 0.625, 0.25, brownShadow);
      box(x + width / 2 - 0.25, bottom + 0.5, 4.625, 0.125, 0.5, 0.25, brownShadow);
    }
  }

  // Fit the entire head assembly together so eyes, ears and hair retain alignment.
  // A slightly smaller head and shorter visible neck balance the compact body.
  for (const block of blocks.slice(headStart)) {
    for (const point of [block.min, block.max]) {
      point[0] *= 0.96;
      point[1] = 22 + (point[1] - 22) * 0.96 - 0.5;
      point[2] *= 0.95;
    }
  }
  const mesh = new Mesh(sculptGeometry(blocks), new MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const character = new Group();
  character.add(mesh);
  return character;
}
