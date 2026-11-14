/** A corner of a block, in voxels. */
export type Corner = readonly [number, number, number];

/**
 * A solid block: its lowest corner and its size, in voxels, and its color by
 * role. The core only carries roles: each kind of creature names its own, and
 * whoever draws it picks the colors.
 */
export interface Box<R extends string = string> {
  readonly at: Corner;
  readonly size: Corner;
  readonly role: R;
}

/** A block of one role between two opposite corners. */
export function between<R extends string>(from: Corner, to: Corner, role: R): Box<R> {
  return { at: from, size: [to[0] - from[0], to[1] - from[1], to[2] - from[2]], role };
}

/** The same block on the other side of the body: mirrored left to right. */
export function mirrored<B extends Box>(box: B): B {
  return { ...box, at: [-box.at[0] - box.size[0], box.at[1], box.at[2]] };
}

/**
 * One piece of a creature: blocks that move together with one joint. Block
 * positions are measured from that joint's pivot. +y is up, +z is the front.
 */
export interface Part<R extends string = string, J extends string = string> {
  readonly name: string;
  readonly joint: J;
  readonly boxes: readonly Box<R>[];
}

/** Something worn or carried: blocks that move with one joint. */
export interface Worn<R extends string = string, J extends string = string> {
  readonly joint: J;
  readonly boxes: readonly Box<R>[];
}

/** A joint and where its pivot sits, measured from its parent's pivot, in voxels. */
export interface Joint<J extends string = string> {
  readonly name: J;
  /** Null for the root, which everything else hangs from. */
  readonly parent: J | null;
  readonly at: Corner;
}

/** How each joint is turned, in radians around x, y and z. A joint left out is not turned. */
export type Turns = Readonly<Record<string, Corner>>;

/**
 * Anything with a skeleton that can be posed: its joints, parent before child,
 * the parts hanging on them, and how it stands at rest.
 */
export interface Rig {
  readonly joints: readonly Joint[];
  readonly parts: readonly Part[];
  readonly posture: Turns;
}
