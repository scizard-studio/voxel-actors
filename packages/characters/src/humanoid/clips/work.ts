import { X, type Clip } from './pose';

/**
 * Hammering at a bench: leaning in, the left hand steadying the work, the
 * right arm lifting and striking down in front, the body dipping with each blow.
 */
export const work: Clip = {
  cyclesPerSecond: 1.1,
  swings: [
    { joint: 'waist', axis: X, size: 0.04, base: 0.15 },
    { joint: 'shoulderLeft', axis: X, size: 0, base: -0.5 },
    { joint: 'elbowLeft', axis: X, size: 0, base: -0.8 },
    { joint: 'shoulderRight', axis: X, size: 0.45, base: -0.9 },
    { joint: 'elbowRight', axis: X, size: 0.3, base: -0.6, phase: Math.PI / 2 },
  ],
};

/** Same stroke with the arm roles exchanged. The work clip only rotates around X. */
export const workLeft: Clip = {
  ...work,
  swings: work.swings?.map(swing => {
    switch (swing.joint) {
      case 'shoulderLeft': return { ...swing, joint: 'shoulderRight' };
      case 'shoulderRight': return { ...swing, joint: 'shoulderLeft' };
      case 'elbowLeft': return { ...swing, joint: 'elbowRight' };
      case 'elbowRight': return { ...swing, joint: 'elbowLeft' };
      default: return swing;
    }
  }),
};
