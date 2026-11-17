/** Stable anatomical identities, independent of box order, color and joint names. */
export const bodyRegions = {
  hips: { label: 'Hips' },
  waist: { label: 'Waist' },
  chest: { label: 'Chest' },
  neck: { label: 'Neck' },
  head: { label: 'Head' },
  earLeft: { label: 'Left ear', parent: 'head' },
  earRight: { label: 'Right ear', parent: 'head' },
  innerEarLeft: { label: 'Left inner ear', parent: 'earLeft' },
  innerEarRight: { label: 'Right inner ear', parent: 'earRight' },
  upperArmLeft: { label: 'Left upper arm' },
  upperArmRight: { label: 'Right upper arm' },
  forearmLeft: { label: 'Left forearm' },
  forearmRight: { label: 'Right forearm' },
  handLeft: { label: 'Left hand' },
  handRight: { label: 'Right hand' },
  thighLeft: { label: 'Left thigh' },
  thighRight: { label: 'Right thigh' },
  shinLeft: { label: 'Left shin' },
  shinRight: { label: 'Right shin' },
  footLeft: { label: 'Left foot' },
  footRight: { label: 'Right foot' },
} as const;

export type BodyRegionId = keyof typeof bodyRegions;

export function parentRegion(region: BodyRegionId): BodyRegionId | undefined {
  const definition = bodyRegions[region];
  return 'parent' in definition ? definition.parent : undefined;
}

/** A parent selection includes its descendants (head includes both ears). */
export function isBodyRegion(region: BodyRegionId, ancestor: BodyRegionId): boolean {
  let current: BodyRegionId | undefined = region;
  while (current !== undefined) {
    if (current === ancestor) return true;
    current = parentRegion(current);
  }
  return false;
}

export function oppositeRegion(region: BodyRegionId): BodyRegionId {
  if (region.endsWith('Left')) return region.replace(/Left$/, 'Right') as BodyRegionId;
  if (region.endsWith('Right')) return region.replace(/Right$/, 'Left') as BodyRegionId;
  return region;
}
