import { BoxGeometry, Group, Mesh, MeshLambertMaterial, type Object3D } from 'three';

type Size = readonly [number, number, number];

/** Something put on the figure in the studio to show a motion off. */
export interface HeldProp {
  /** Shows or hides it, as while the arms are still gliding into place. */
  show(visible: boolean): void;
  /** Moves it to where it is this far into the clip, for things that move with the clip, such as a hoop. */
  update(clipSeconds: number): void;
  dispose(): void;
}

/** What a prop is built with: a holder group, coloured blocks in it, and the finished prop. */
export interface Pieces {
  readonly holder: Group;
  /** A coloured block of this size with its middle at `at`, in `parent`, or in the holder if none is given. */
  block(color: number, size: Size, at: Size, parent?: Object3D): Mesh;
  /** The finished prop, shown and hidden as a whole, moved by `move` as its clip plays. */
  prop(move?: (clipSeconds: number) => void): HeldProp;
}

/** Starts a prop. Everything made with it is freed together when the prop is disposed. */
export function createPieces(): Pieces {
  const holder = new Group();
  const made: [Mesh, MeshLambertMaterial][] = [];
  return {
    holder,
    block(color, size, at, parent = holder) {
      const material = new MeshLambertMaterial({ color });
      const mesh = new Mesh(new BoxGeometry(...size), material);
      mesh.position.set(...at);
      mesh.castShadow = true;
      parent.add(mesh);
      made.push([mesh, material]);
      return mesh;
    },
    prop(move = () => {}) {
      return {
        show(visible) {
          holder.visible = visible;
        },
        update: move,
        dispose() {
          holder.removeFromParent();
          for (const [mesh, material] of made) {
            mesh.geometry.dispose();
            material.dispose();
          }
        },
      };
    },
  };
}
