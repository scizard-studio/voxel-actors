import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
import type { Body } from './packages/characters/src';
import type { Figure } from './figure';

// A marker is this many voxels across: easy to see, still smaller than a child's hand.
const MARKER_SIZE = 1.2;
const MARKER_COLOR = 0x12a38f;
// Markers are drawn last and through the body, since the hand sockets sit inside the hands.
const DRAWN_LAST = 1;

/** Markers that show where things attach to a figure. */
export interface SocketMarkers {
  dispose(): void;
}

/** Puts a small marker on every socket of a figure. The markers move with the figure as it moves. */
export function addSocketMarkers(figure: Figure, sockets: Body['sockets']): SocketMarkers {
  const geometry = new BoxGeometry(MARKER_SIZE, MARKER_SIZE, MARKER_SIZE);
  const material = new MeshBasicMaterial({ color: MARKER_COLOR, depthTest: false });
  for (const socket of Object.values(sockets)) {
    const marker = new Mesh(geometry, material);
    marker.renderOrder = DRAWN_LAST;
    figure.attach(marker, socket);
  }
  return {
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
