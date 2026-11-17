import type { FaceArea } from '../../body.js';

// A face lies on the head like a decal: features are this thin, in voxels.
export const LAYER = 0.15;

export const EYE_MASK = ['.EEEE.', 'EEEEEE', 'EEEEEE', 'EEEEEE', '.RRRR.'];

export function faceLayout(area: FaceArea) {
  const width = EYE_MASK[0].length;
  const unit = Math.min(0.375, area.width / (2 * width + 1));
  return {
    unit,
    detailUnit: unit * 2 / 3,
    center: area.left + area.width / 2,
    top: area.bottom + Math.min(5.75, area.height - 2.5),
    halfSpacing: Math.min(3.5, area.width / 2 - width * unit / 2),
  };
}

export function mouthLayout(area: FaceArea) {
  const { detailUnit, center, top } = faceLayout(area);
  return { step: detailUnit, center, top: top - 13 * detailUnit };
}
