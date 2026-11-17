import type { Joint as CoreJoint } from '../core/model.js';

/**
 * The joints a person turns on. Left and right are the person's own: a person
 * faces +z, so their left side is at +x.
 */
export type JointName =
  | 'pelvis'
  | 'waist'
  | 'head'
  | 'shoulderLeft'
  | 'elbowLeft'
  | 'shoulderRight'
  | 'elbowRight'
  | 'hipLeft'
  | 'kneeLeft'
  | 'hipRight'
  | 'kneeRight';

/** A person's joint. The pelvis is the root, which everything else hangs from. */
export type Joint = CoreJoint<JointName>;
