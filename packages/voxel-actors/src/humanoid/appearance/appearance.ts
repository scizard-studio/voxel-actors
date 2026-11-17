import type { Box, Role } from '../model.js';
import { parentRegion, type BodyRegionId } from '../regions.js';
import { defaultPalette } from './defaultPalette.js';

const defaultRegionRoles: Readonly<Partial<Record<BodyRegionId, Role>>> = Object.freeze({
  innerEarLeft: 'skinShade',
  innerEarRight: 'skinShade',
});

/** Optional caller overrides over the library's default appearance. */
export interface Appearance {
  readonly palette?: Readonly<Partial<Record<Role, number>>>;
  /** Most-specific region wins, then its ancestors, then the box's palette role. */
  readonly regions?: Readonly<Partial<Record<BodyRegionId, number>>>;
}

export function colorOf(box: Box, appearance: Appearance = {}): number {
  let region = box.region;
  while (region !== undefined) {
    const override = appearance.regions?.[region];
    if (override !== undefined) return override;
    region = parentRegion(region);
  }
  const role = box.role === 'skin' && box.region !== undefined ? defaultRegionRoles[box.region] ?? box.role : box.role;
  return appearance.palette?.[role] ?? defaultPalette[role];
}
