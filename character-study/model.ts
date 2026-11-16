import { Group, Mesh, MeshStandardMaterial } from 'three';
import { sculptGeometry, type SculptBlock } from './voxelGeometry';
import { studioBodyBlocks, STUDIO_FOREHEAD_HEIGHT } from './studioBody';

/**
 * Gold-gown sculpture, with either the study anatomy or the original studio anatomy.
 * Positive Z is the face. All dimensions and decorative pixels are authored here.
 */
export function createCharacter(outfit: 'base' | 'dressed' = 'dressed', bodyStyle: 'study' | 'studio' = 'study'): Group {
  const pieces: SculptBlock[] = bodyStyle === 'studio' ? studioBodyBlocks() : [];
  const palette = {
    skin: 0xffc49f, skinLight: 0xf8c99e, ear: 0xe7a67b,
    hair: 0x80502e, hairLight: 0x996438, hairDark: 0x593522,
    gold: 0xdf8e06, goldLight: 0xf1a51a, goldShade: 0xc77a07,
    stitch: 0xffdf8a, stitchShade: 0xf3be45,
    cape: 0x155831, capeLight: 0x237841, capeDark: 0x0c351e,
  };
  function block(x: number, y: number, z: number, width: number, height: number, depth: number, color: number): void {
    pieces.push({
      min: [x - width / 2, y, z - depth / 2],
      max: [x + width / 2, y + height, z + depth / 2],
      color,
    });
  }

  // Match the studio's eight-voxel head depth, including its fitted facial details and hair.
  function studyHeadBlock(x: number, y: number, z: number, width: number, height: number, depth: number, color: number): void {
    const depthScale = 0.8;
    block(x, y, z * depthScale, width, height, depth * depthScale, color);
  }

  // Fit the same garment to the studio's wider torso and shorter shoulder height.
  function garment(x: number, y: number, z: number, width: number, height: number, depth: number, color: number): void {
    if (bodyStyle === 'studio') {
      block(x * 1.16, y * 0.89, (z - 0.3) * 1.15, width * 1.16, height * 0.89, depth * 1.15, color);
    } else {
      block(x, y, z, width, height, depth, color);
    }
  }
  function hairBlock(x: number, y: number, z: number, width: number, height: number, depth: number, color: number): void {
    if (bodyStyle === 'studio') {
      block(x * 15 / 14, 21 + (y - 23.8) * 13 / 12.8 + STUDIO_FOREHEAD_HEIGHT, z * 0.8, width * 15 / 14, height * 13 / 12.8, depth * 0.8, color);
    } else {
      studyHeadBlock(x, y, z, width, height, depth, color);
    }
  }

  if (bodyStyle === 'study') {
    // Shared, simple mannequin anatomy beneath either presentation.
    block(0, 10.5, 0.5, 7.2, 3.5, 4.8, palette.skin);
    block(0, 14, 0.5, 6.4, 2, 4.5, palette.skin);
    block(0, 16, 0.5, 7.2, 4.8, 5, palette.skin);
    block(0, 20.7, 0.4, 4.1, 3.1, 3.8, palette.skin);
    for (const side of [-1, 1]) {
      block(side * 2, 6, 0.5, 3, 4.5, 3.5, palette.skin);
      block(side * 2, 1.5, 0.5, 2.6, 4.5, 3, palette.skin);
      block(side * 2, 0, 1.1, 2.9, 1.5, 4.2, palette.skin);
    }

  }

  if (outfit === 'dressed') {
    // The cape widens in small square steps and pools behind the hem.
    // Its dark inner face frames the gold dress, with brighter outer folds.
    for (let row = 0; row < 23; row++) {
      const spread = 5.2 + Math.floor((22 - row) / 2) * 0.46;
      const back = -3.8 - (22 - row) * 0.08;
      garment(0, row, back, spread * 2, 1, 0.9, palette.cape);
      for (const sign of [-1, 1]) {
        const opening = 4.6 + Math.max(0, 12 - row) * 0.07;
        const width = spread - opening;
        garment(sign * (opening + width / 2), row, -1.1, width, 1, 6.1, palette.capeDark);
        garment(sign * (spread - 0.4), row, -1.1, 0.8, 1, 6.6, palette.cape);
        garment(sign * (spread - 0.12), row, 2.3, 0.55, 0.85, 0.45, palette.capeLight);
      }
    }
    for (const side of [-1, 1]) {
      garment(side * 9.3, 0, -0.6, 4.5, 0.45, 8.8, palette.capeLight);
      garment(side * 9.4, 0.45, -1, 3.1, 0.35, 7.7, palette.cape);
    }

    // Full-length gown, narrow at the waist and wider toward the floor.
    for (let row = 0; row < 15; row++) {
      const width = 7.6 + Math.floor((14 - row) / 3) * 0.55;
      const depth = 5.9 + Math.floor((14 - row) / 4) * 0.3;
      garment(0, row, 0.6, width, 1, depth, palette.gold);
      for (const side of [-1, 1]) {
        garment(side * (width / 2 - 0.28), row, 0.7, 0.55, 1, depth, palette.goldShade);
      }
    }
    garment(0, 14.5, 0.5, 7.6, 5.5, 5.9, palette.goldLight);
    garment(0, 19.5, 0.5, 7.3, 1.5, 5.6, palette.gold);
    // Subtle pleat colors follow each skirt tier's actual surface.
    for (let row = 0; row < 14; row++) {
      const depth = 5.9 + Math.floor((14 - row) / 4) * 0.3;
      const front = 0.6 + depth / 2;
      for (const x of [-2.8, -0.8, 1.5, 3.2]) {
        garment(x, row, front - 0.0625, 0.125, 1, 0.125, palette.goldShade);
        garment(x + 0.25, row, front - 0.0625, 0.125, 1, 0.125, palette.goldLight);
      }
    }
    garment(0, 14.2, 3.45, 7.5, 0.25, 0.25, palette.goldShade);

  }

  if (bodyStyle === 'study') {
    // Bare arms hang at either side of the sleeveless bodice.
    for (const side of [-1, 1]) {
      block(side * 4.45, 15, 0.5, 1.8, 5.8, 2.6, palette.skin);
      block(side * 4.8, 11.4, 0.7, 1.7, 4, 2.5, palette.skinLight);
      block(side * 4.9, 10.4, 0.85, 1.8, 1.7, 2.6, palette.skin);
    }

  }

  if (outfit === 'dressed') {
    for (const side of [-1, 1]) {
      garment(side * 3, 20.6, 0.5, 0.7, 1.6, 5.4, palette.gold);
    }
    // Small embroidered curls and leaf shapes on the gold bodice.
    const stitch = (x: number, y: number, shade = false): void =>
      garment(x, y, 3.55, 0.28, 0.32, 0.16, shade ? palette.stitchShade : palette.stitch);
    for (const x of [-2.55, -0.85, 0.85, 2.55]) {
      for (const [dx, dy] of [[0, 0], [-0.3, 0.32], [-0.3, 0.64], [0, 0.96], [0.3, 1.28], [0.3, 1.6], [0, 1.92]]) {
        stitch(x + dx, 16.1 + dy, dx > 0);
      }
      stitch(x, 19.4);
      stitch(x - 0.3, 19.7);
      stitch(x + 0.3, 19.7);
    }
    for (let i = 0; i < 10; i++) stitch(-3.15 + i * 0.7, 15.2, i % 2 === 0);
    // Repeated ivory sprigs embroidered along the hem.
    for (const x of [-3.5, -1.2, 1.2, 3.5]) {
      for (const [dx, dy] of [[0, 0.4], [-0.35, 0.75], [0.35, 0.75], [-0.35, 1.1], [0.35, 1.1], [0, 1.45], [0, 1.8]]) {
        garment(x + dx, dy, 4.08, 0.3, 0.35, 0.16, palette.stitch);
      }
    }
    for (let i = 0; i < 32; i++) garment(-4.6 + i * 0.3, 0.08, 4.1, 0.1, 0.5, 0.12, palette.stitchShade);

    // The green collar arcs over both shoulders and joins beneath the chin.
    for (const side of [-1, 1]) {
      for (let step = 0; step < 5; step++) {
        garment(side * (1.4 + step * 0.75), 22.5 - step * 0.45, 1.4, 1.1, 0.9, 4.9, palette.cape);
        garment(side * (1.4 + step * 0.75), 22.45 - step * 0.45, 3.9, 0.9, 0.45, 0.3, palette.capeLight);
      }
    }
    garment(-0.45, 21.1, 3.3, 0.3, 1.6, 0.25, palette.capeDark);
    garment(0.45, 20.8, 3.3, 0.3, 1.9, 0.25, palette.capeLight);
    garment(0, 22, 3.4, 0.5, 0.65, 0.3, palette.stitchShade);

  }

  if (bodyStyle === 'study') {
    // Trim a quarter voxel from each cheek and jaw edge for a subtly narrower face.
    studyHeadBlock(0, 23.8, 0, 9.1, 0.5, 10, palette.skin);
    studyHeadBlock(0, 24.3, 0, 11, 0.5, 10, palette.skin);
    studyHeadBlock(0, 24.8, 0, 12.3, 0.7, 10, palette.skin);
    studyHeadBlock(0, 25.5, 0, 13.5, 10, 10, palette.skin);
    studyHeadBlock(0, 35.5, 0, 11, 1.1, 7, palette.skin);
    // Pigment occupies the skin's outer cells, so cheeks and eyes cast no separate shadows.
    function facePixel(x: number, y: number, width: number, height: number, color: number): void {
      studyHeadBlock(x, y, 4.875, width, height, 0.25, color);
    }
    for (const side of [-1, 1]) {
      studyHeadBlock(side * 6.85, 27, 0.2, 0.9, 2.3, 2.1, palette.ear);
      facePixel(side * 3.55, 28.5, 2, 1.25, 0x301713);
      facePixel(side * 3.55, 29.75, 1.5, 0.375, 0x301713);
      facePixel(side * 3.55, 28.5, 1.75, 0.25, 0x673328);
      facePixel(side * 3.6, 31.25, 1.75, 0.375, 0x935737);
      facePixel(side * 3.85, 31.625, 1.25, 0.125, 0x935737);
      facePixel(side * 4.05, 26.5, 2.25, 0.75, 0xed947d);
      facePixel(side * 4.05, 26.25, 1.5, 1.25, 0xed947d);
    }
    // Tiny two-pixel nose and a shallow red smile with a cream upper edge.
    facePixel(0.375, 28.25, 0.25, 0.75, 0xd59a75);
    facePixel(0.125, 28.25, 0.5, 0.25, 0xd59a75);
    facePixel(0.125, 28.5, 0.25, 0.5, 0xffd5ae);
    facePixel(0, 26.375, 1.5, 0.75, 0xbc3c2e);
    facePixel(0.125, 26.125, 1, 0.25, 0xbc3c2e);
    facePixel(-0.125, 26.875, 1.25, 0.375, 0xfff1d6);

  }

  if (outfit === 'dressed') {
    // Long straight brown hair. The rear and side lengths break into broad stair steps.
    hairBlock(0, 20, -5.1, 15.4, 16.5, 1.9, palette.hairDark);
    for (const side of [-1, 1]) {
      for (let row = 0; row < 7; row++) {
        const flare = Math.max(0, 3 - row) * 0.45;
        const x = side * (7.25 + flare);
        hairBlock(x, 17.7 + row * 2.2, -0.2, 1.5, 2.2, 10.6, palette.hair);
        hairBlock(x + side * 0.1, 17.7 + row * 2.2, 5.13, 1.5, 0.3, 0.25, palette.hairLight);
      }
      hairBlock(side * 7.3, 31.7, -0.3, 1.5, 3.7, 10.8, palette.hair);
    }
    // The crown curves in voxel steps from the forehead to the top and back.
    for (let layer = 0; layer < 7; layer++) {
      const inset = layer * 0.48;
      hairBlock(0, 34.5 + layer * 0.5, -0.2, 16 - inset * 2, 0.5, 11.6 - inset * 1.45, palette.hairLight);
    }
    // Raise the fringe to clear the studio face's higher eyebrows.
    const fringeLift = bodyStyle === 'studio' ? 1.5 : 0;
    hairBlock(0, 33 + fringeLift, 5, 14, 2.5, 1, palette.hairLight);
    const fringe = [
      { x: -5.65, width: 2.6, bottom: 32.5 },
      { x: -3.05, width: 2.3, bottom: 32.3 },
      { x: -0.5, width: 2.4, bottom: 32.05 },
      { x: 2.1, width: 2.3, bottom: 32.35 },
      { x: 4.8, width: 2.7, bottom: 32.25 },
    ];
    for (const lock of fringe) {
      hairBlock(lock.x, lock.bottom + fringeLift + 0.4, 5, lock.width, 2.8, 1, palette.hairLight);
      hairBlock(lock.x - 0.15, lock.bottom + fringeLift, 5, lock.width - 0.65, 0.4, 1, palette.hairLight);
      hairBlock(lock.x + lock.width / 2 - 0.15, lock.bottom + fringeLift + 1, 5.375, 0.125, 0.6, 0.25, palette.hairDark);
      hairBlock(lock.x + lock.width / 2 - 0.35, lock.bottom + fringeLift + 0.5, 5.375, 0.125, 0.45, 0.25, palette.hairDark);
    }

  }

  const geometry = sculptGeometry(pieces);
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const character = new Group();
  character.add(mesh);
  return character;
}

