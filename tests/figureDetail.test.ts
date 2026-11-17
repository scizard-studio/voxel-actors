import { expect, it } from 'vitest';
import { Group, Mesh, Vector3 } from 'three';
import { createFigure } from '../figure';
import { createBody, createFace, createHair, createHat, createMotion, dress, expressions, faceOptionsFor, hairUnder } from '../packages/characters/src';
import { actionHand, equipItem } from '../props/equipment';

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

it('swaps the striking arm and keeps the hammer aligned in both detail levels', () => {
  const body = createBody({ age: 'adult', gender: 'female' });
  const figure = createFigure(body, createFace(body.head.face, faceOptionsFor(body.spec.gender)), []);
  const right = createMotion('work').poseAt(0.2, body);
  const left = createMotion('workLeft').poseAt(0.2, body);
  expect(left.turns.shoulderLeft).toEqual(right.turns.shoulderRight);
  expect(left.turns.elbowLeft).toEqual(right.turns.elbowRight);
  expect(left.turns.elbowRight).toEqual(right.turns.elbowLeft);
  try {
    for (const hand of ['handLeft', 'handRight'] as const) {
      const attach = figure.attach.bind(figure);
      const grip = new Group();
      attach(grip, body.sockets[hand]);
      let holder: Group | undefined;
      const hammer = equipItem({ ...figure, attach(object, socket) {
        holder = object as Group;
        attach(object, socket);
      } }, body, hand, 'hammer');
      try {
        figure.pose(hand === 'handLeft' ? left : right);
        figure.setDetail('high');
        const position = holder!.getWorldPosition(new Vector3());
        const forward = holder!.localToWorld(new Vector3(0, 1, 0));
        expect(position.toArray()).toEqual(grip.getWorldPosition(new Vector3()).toArray());
        expect(forward.distanceTo(grip.localToWorld(new Vector3(0, 0, 1)))).toBeLessThan(1e-8);
        figure.setDetail('low');
        expect(holder!.getWorldPosition(new Vector3()).toArray()).toEqual(position.toArray());
      } finally {
        hammer.dispose();
        holder?.removeFromParent();
        grip.removeFromParent();
      }
    }
  } finally {
    figure.dispose();
  }
});

it('chooses the hand with equipment that supports the action', () => {
  expect(actionHand({ handLeft: 'shield', handRight: 'sword' }, 'work')).toBeUndefined();
  expect(actionHand({ handLeft: 'hammer', handRight: 'shield' }, 'work')).toBe('handLeft');
  expect(actionHand({ handLeft: 'shield', handRight: 'hammer' }, 'work')).toBe('handRight');
});
