import { expect, it } from 'vitest';
import { Group, Mesh, Vector3 } from 'three';
import { createFigure } from '../app/rendering/figure';
import { createBody, createFace, createHair, createHat, dress, faceOptionsFor, hairUnder } from '../packages/voxel-actors/src';

// Check that reduced detail uses fewer meshes and keeps held items from jumping during a detail switch.
it('uses fewer meshes at reduced detail and keeps the held item in place', () => {
  const body = dress(createBody({ age: 'adult', gender: 'female' }), 'builder');
  const face = createFace(body.head.face, faceOptionsFor(body.spec.gender));
  const hat = createHat('hardHat', body.head);
  const hair = hairUnder(createHair('ponytail', body.head), hat);
  const figure = createFigure(body, face, [...body.worn, hair, hat], { palette: body.colors });
  try {
    const held = new Group();
    figure.attach(held, body.sockets.handLeft);
    figure.pose({ lift: 1, turns: { elbowLeft: [0.4, 0, 0] } });

    const countVisibleMeshes = () => {
      let count = 0;
      figure.root.traverseVisible(object => {
        if (object instanceof Mesh) count++;
      });
      return count;
    };
    const fullMeshCount = countVisibleMeshes();
    const fullPosition = held.getWorldPosition(new Vector3());

    figure.setDetail('low');

    expect(countVisibleMeshes()).toBeLessThan(fullMeshCount);
    expect(held.getWorldPosition(new Vector3()).toArray()).toEqual(fullPosition.toArray());
  } finally {
    figure.dispose();
  }
});
