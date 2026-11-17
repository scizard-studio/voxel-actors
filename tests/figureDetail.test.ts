import { expect, it } from 'vitest';
import { Group, Mesh, Vector3 } from 'three';
import { createFigure } from '../figure';
import { createBody, createFace, createHair, createHat, dress, expressions, faceOptionsFor, hairUnder } from '../packages/characters/src';

it('reduces the dressed mesh count while preserving the posed hand and expression', () => {
  const body = dress(createBody({ age: 'adult', gender: 'female' }), 'builder');
  const face = createFace(body.head.face, faceOptionsFor(body.spec.gender));
  const hat = createHat('hardHat', body.head);
  const hair = hairUnder(createHair('ponytail', body.head), hat);
  const figure = createFigure(body, face, [hair, hat, ...body.worn], { palette: body.colors });
  try {
    const held = new Group();
    figure.attach(held, body.sockets.handLeft);
    figure.pose({ lift: 1, turns: { elbowLeft: [0.4, 0, 0] } });
    figure.showFace(expressions.happy);
    const visibleMeshes = () => {
      const meshes: Mesh[] = [];
      figure.root.traverseVisible(object => { if (object instanceof Mesh) meshes.push(object); });
      return meshes;
    };
    const full = visibleMeshes();
    const position = held.getWorldPosition(new Vector3());
    figure.setDetail('low');
    const reduced = visibleMeshes();
    expect(reduced.length).toBeLessThan(full.length);
    expect(reduced.filter(mesh => full.includes(mesh))).toHaveLength(
      Object.values(expressions.happy).length,
    );
    expect(held.getWorldPosition(new Vector3()).toArray()).toEqual(position.toArray());
    figure.setDetail('high');
    expect(visibleMeshes()).toEqual(full);
  } finally {
    figure.dispose();
  }
});
