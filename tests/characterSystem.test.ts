import { expect, it } from 'vitest';
import {
  createBody, colorOf, defaultPalette, bodyRegions, isBodyRegion, oppositeRegion, measureBody,
  measureSolids, resolveProportions, applyOutfit, dress, outfits,
  CHARACTER_SCALE, metresPerVoxel, voxelScaleFactor,
  type Age, type Gender, type BodyRegionId, type BodySpec, type BodyBox, type JointName,
} from '../packages/voxel-actors/src';
import { painted } from '../packages/voxel-actors/src/humanoid/appearance/outfits/paint';
import { roleColors, skinTones, hairColors } from '../app/studio/palette';

const palette = roleColors(skinTones[0], hairColors[0]);
const spec = { age: 'adult', gender: 'female' } as const;
const ages: Age[] = ['child', 'teen', 'adult', 'elder', 'aged'];
const genders: Gender[] = ['female', 'male'];

it('gives every preset valid region identities and uniform base skin', () => {
  for (const age of ages) for (const gender of genders) {
    const body = createBody({ age, gender });
    const boxes = body.parts.flatMap(part => part.boxes);
    expect(new Set(boxes.map(box => box.role))).toEqual(new Set(['skin']));
    expect(new Set(boxes.map(box => box.region))).toEqual(new Set(Object.keys(bodyRegions)));
    expect(boxes.every(box => box.size.every(value => value > 0 && Number.isFinite(value)))).toBe(true);
    expect(body.parts.every(part => body.joints.some(joint => joint.name === part.joint))).toBe(true);
    for (const joint of body.joints) {
      if (joint.parent !== null) expect(body.joints.findIndex(item => item.name === joint.parent)).toBeLessThan(body.joints.indexOf(joint));
    }
    const measurements = measureBody(body);
    expect(measurements.total.size[1]).toBe(body.height);
    expect(measurements.total.min[1]).toBe(0);
    expect(Number.isInteger(measurements.total.voxelVolume)).toBe(true);
  }
});

it('applies inner-ear overrides without any geometry option or mutation', () => {
  const body = createBody(spec);
  const before = JSON.stringify(body);
  const appearance = { palette, regions: { innerEarLeft: 0x123456, innerEarRight: 0x123456 } };
  for (const box of body.parts.flatMap(part => part.boxes)) {
    expect(colorOf(box, appearance)).toBe(box.region.startsWith('innerEar') ? 0x123456 : palette.skin);
  }
  expect(JSON.stringify(body)).toBe(before);
});

it('uses region, ancestor, then palette precedence, including black', () => {
  const body = createBody(spec);
  const inner = body.parts.flatMap(part => part.boxes).find(box => box.region === 'innerEarLeft')!;
  expect(colorOf(inner, { palette })).toBe(palette.skinShade);
  expect(colorOf(inner, { palette, regions: { head: 1 } })).toBe(1);
  expect(colorOf(inner, { palette, regions: { head: 1, earLeft: 2 } })).toBe(2);
  expect(colorOf(inner, { palette, regions: { head: 1, earLeft: 2, innerEarLeft: 0 } })).toBe(0);
  expect(isBodyRegion('innerEarLeft', 'head')).toBe(true);
  expect(isBodyRegion('innerEarLeft', 'earRight')).toBe(false);
  expect(oppositeRegion('innerEarLeft')).toBe('innerEarRight');
});

it('colors any region independently, not only the old shaded areas', () => {
  const body = createBody(spec);
  for (const region of Object.keys(bodyRegions) as BodyRegionId[]) {
    const appearance = { palette, regions: { [region]: 0 } };
    for (const box of body.parts.flatMap(part => part.boxes)) {
      expect(colorOf(box, appearance)).toBe(isBodyRegion(box.region, region) ? 0 : colorOf(box));
    }
  }
});

it('provides default appearance without caller setup and accepts partial overrides', () => {
  const boxes = createBody(spec).parts.flatMap(part => part.boxes);
  const chest = boxes.find(box => box.region === 'chest')!;
  const ear = boxes.find(box => box.region === 'innerEarLeft')!;
  for (const box of boxes) {
    expect(colorOf(box)).toBe(box.region.startsWith('innerEar') ? defaultPalette.skinShade : defaultPalette.skin);
  }
  expect(colorOf(chest, { palette: { skin: 0 } })).toBe(0);
  expect(colorOf(ear, { palette: { skinShade: 0x123456 } })).toBe(0x123456);
  expect(colorOf(chest, { regions: { chest: 0x123456 } })).toBe(0x123456);
  expect(colorOf(chest)).toBe(defaultPalette.skin);
});

it('keeps region painting correct after boxes are reordered or subdivided', () => {
  const body = createBody(spec);
  const torso = body.parts.find(part => part.name === 'torso')!;
  const chest = torso.boxes.find(box => box.region === 'chest')!;
  const half: BodyBox = { ...chest, size: [chest.size[0], chest.size[1] / 2, chest.size[2]] };
  const split = [half, { ...half, at: [half.at[0], half.at[1] + half.size[1], half.at[2]] as const }];
  const parts = [{ ...torso, boxes: [...torso.boxes.filter(box => box !== chest), ...split].reverse() }];
  const result = painted(parts, { chest: 'top', neck: 'hatBand' });
  for (const box of result[0].boxes) expect(box.role).toBe(box.region === 'chest' ? 'top' : box.region === 'neck' ? 'hatBand' : 'skin');
  expect(parts[0].boxes.every(box => box.role === 'skin')).toBe(true);
  const legs = painted(body.parts, { feet: 'shoes', footLeft: 'top' }).flatMap(part => part.boxes);
  expect(legs.find(box => box.region === 'footLeft')?.role).toBe('top');
  expect(legs.find(box => box.region === 'footRight')?.role).toBe('shoes');
});

it('preserves all registered outfits across all presets', () => {
  const expectedRegions = {
    hips: ['hips'], waist: ['waist'], chest: ['chest'],
    upperArms: ['upperArmLeft', 'upperArmRight'], forearms: ['forearmLeft', 'forearmRight'],
    thighs: ['thighLeft', 'thighRight'], shins: ['shinLeft', 'shinRight'], feet: ['footLeft', 'footRight'],
  };
  for (const age of ages) for (const gender of genders) for (const name of Object.keys(outfits) as (keyof typeof outfits)[]) {
    const body = createBody({ age, gender });
    const dressed = dress(body, name);
    for (const [group, role] of Object.entries(outfits[name].paint)) {
      const ids = expectedRegions[group as keyof typeof expectedRegions];
      expect(dressed.parts.flatMap(part => part.boxes).filter(box => ids.includes(box.region)).every(box => box.role === role)).toBe(true);
    }
    expect(dressed.worn).toEqual([]);
    expect(body.parts.flatMap(part => part.boxes).every(box => box.role === 'skin')).toBe(true);
  }
});

it('counts solid volume once, not overlapping boxes or empty bounding space', () => {
  const cube = { at: [0, 0, 0] as const, size: [2, 2, 2] as const };
  expect(measureSolids([cube, cube]).voxelVolume).toBe(8);
  expect(measureSolids([cube, { ...cube, at: [1, 0, 0] }]).voxelVolume).toBe(12);
  expect(measureSolids([cube, { ...cube, at: [4, 0, 0] }]).voxelVolume).toBe(16);
  expect(measureSolids([cube, { at: [0.5, 0.5, 0.5], size: [0.5, 0.5, 0.5] }]).voxelVolume).toBe(8);
  expect(measureSolids([{ at: [-0.5, 0, 0], size: [0.5, 1, 1] }]).voxelVolume).toBe(0.5);
  expect(measureSolids([]).voxelVolume).toBe(0);
  expect(() => measureSolids([{ at: [0, 0, 0], size: [0, 1, 1] }])).toThrow();
});

it('measures base foot and hierarchical head anatomy in bind space', () => {
  const report = measureBody(createBody(spec));
  expect(report.total.voxelVolume).toBe(2385);
  expect(report.total.boxCount).toBe(29);
  const foot = report.regions.find(region => region.id === 'footLeft')!;
  expect(foot.size).toEqual([3, 2, 6]);
  expect(foot.voxelVolume).toBe(36);
  expect(foot.boxCount).toBe(1);
  expect(foot.center).toEqual([2.5, 1, 1]);
  expect(foot.joints).toEqual(['kneeLeft']);
  const head = report.regions.find(region => region.id === 'head')!;
  expect(head.size[0]).toBe(17); // skull 15 + one-voxel ear on either side
  expect(head.voxelVolume).toBeLessThan(head.size.reduce((a, b) => a * b, 1));
  const body = createBody(spec);
  const duplicates = { ...body, parts: [...body.parts, ...body.parts] };
  expect(measureBody(duplicates).total.voxelVolume).toBe(report.total.voxelVolume);
});

it('resolves dimension overrides and updates joints, height and sockets', () => {
  const before = createBody(spec);
  const custom = createBody({ ...spec, proportions: { leg: { upper: 6, toe: 3 }, head: [15, 14, 8] } });
  expect(custom.height).toBe(before.height + 3);
  expect(custom.joints.find(joint => joint.name === 'pelvis')!.at[1]).toBe(11);
  expect(custom.sockets.headTop.at[1]).toBe(14);
  expect(measureBody(custom).regions.find(region => region.id === 'footLeft')?.size).toEqual([3, 2, 7]);
  expect(resolveProportions(spec).leg.upper).toBe(4);
  expect(measureBody(createBody({ ...spec, proportions: { neck: 0 } })).regions.some(region => region.id === 'neck')).toBe(false);
});

it('rejects invalid dimensions before generating unusable blocks', () => {
  for (const proportions of [
    { leg: { upper: -1 } }, { arm: { thick: 2 } }, { head: [15, 5, 8] },
    { neck: NaN }, { waist: [0, 3, 5] }, { leg: { foot: 1.5 } }, { stoop: Infinity },
  ]) expect(() => createBody({ ...spec, proportions } as BodySpec)).toThrow();
});

it('adds custom joint-attached outfit geometry without changing base anatomy', () => {
  const body = createBody(spec);
  const before = JSON.stringify(body);
  const dressed = applyOutfit(body, {
    paint: { chest: 'top' }, colors: { top: 0xffcc00 },
    build: fitted => [{ joint: 'waist', boxes: [{ at: [-5, -8, -3], size: [10, fitted.proportions.waist[1] + 8, 6], role: 'bottom' }] }],
  });
  expect(dressed.worn).toHaveLength(1);
  expect(dressed.worn[0].boxes[0].size).toEqual([10, 11, 6]);
  expect(JSON.stringify(body)).toBe(before);
  expect(measureBody(dressed).total.voxelVolume).toBe(measureBody(body).total.voxelVolume);
  expect(() => applyOutfit(body, { paint: {}, colors: {}, build: () => [{ joint: 'missing' as JointName, boxes: [] }] })).toThrow();
});

it('converts character units into coarser world units without changing physical size', () => {
  const world = { voxelsPerCell: 8, metresPerCell: 3 };
  expect(metresPerVoxel(CHARACTER_SCALE)).toBe(0.046875);
  expect(metresPerVoxel(world)).toBe(0.375);
  expect(voxelScaleFactor(CHARACTER_SCALE, world)).toBe(0.125);
  expect(34 * metresPerVoxel(CHARACTER_SCALE)).toBe(1.59375);
  expect(34 * voxelScaleFactor(CHARACTER_SCALE, world) * metresPerVoxel(world)).toBe(1.59375);
  expect(() => metresPerVoxel({ voxelsPerCell: 0, metresPerCell: 3 })).toThrow();
});
