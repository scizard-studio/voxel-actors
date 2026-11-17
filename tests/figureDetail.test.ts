import { expect, it } from 'vitest';
import { Group, Mesh, Vector3 } from 'three';
import { createFigure } from '../app/rendering/figure';
import { createBody, createFace, createHair, createHat, createMotion, dress, expressions, faceOptionsFor, hairUnder } from '../packages/voxel-actors/src';
import { carryArms, createEquipmentActions, equipmentItems } from '../packages/voxel-actors/src';
import { equipItem } from '../app/rendering/props/equipment';

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

it('keeps the hammer grip aligned in either hand through an action and LOD switch', () => {
  const body = createBody({ age: 'adult', gender: 'female' });
  const figure = createFigure(body, createFace(body.head.face, faceOptionsFor(body.spec.gender)), []);
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
        const actions = createEquipmentActions();
        actions.equip(hand, equipmentItems.hammer);
        expect(actions.use(hand, 0)).toBe('started');
        figure.pose(createMotion('walk').poseAt(0.3, body, actions.layersAt(0.3)));
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

it('layers sword and shield independently over walk and rejects a swing while carrying', () => {
  const actions = createEquipmentActions();
  expect(actions.use('handRight', 0)).toBe('no-action');
  actions.equip('handLeft', equipmentItems.shield);
  actions.equip('handRight', equipmentItems.sword);
  expect(actions.use('handRight', 0, carryArms().joints)).toBe('busy');
  expect(actions.use('handLeft', 0)).toBe('started');
  expect(actions.use('handRight', 0)).toBe('started');
  expect(actions.use('handRight', 0.1)).toBe('busy');
  const motion = createMotion('walk');
  const base = motion.poseAt(0.35);
  const layered = motion.poseAt(0.35, undefined, actions.layersAt(0.35));
  expect(layered.turns.shoulderRight).not.toEqual(base.turns.shoulderRight);
  expect(layered.turns.shoulderLeft).not.toEqual(base.turns.shoulderLeft);
  expect(layered.turns.hipRight).toEqual(base.turns.hipRight);
  expect(layered.lift).toBe(base.lift);
  expect(actions.layersAt(0.7).map(layer => layer.joints)).toEqual([['shoulderLeft', 'elbowLeft']]);
  expect(actions.layersAt(1)).toEqual([]);
});
