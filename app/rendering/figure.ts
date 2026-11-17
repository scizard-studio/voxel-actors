import { BoxGeometry, BufferGeometry, Color, Float32BufferAttribute, Group, Mesh, MeshLambertMaterial, type Object3D } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { colorOf, type Appearance, type Body, type Box, type Face, type FaceState, type FeatureName, type JointName, type Pose, type Socket, type Worn } from '../../packages/voxel-actors/src';
import { sculptGeometry } from './voxelGeometry';

/** A character drawn with Three.js, one voxel to one unit. It stands on y = 0 and faces +z. */
export interface Figure {
  readonly root: Group;
  /** Turns the joints to a pose. Call each frame with the pose of the moment. */
  pose(pose: Pose): void;
  /** Shows the face as it is at this moment: one shape for every feature. */
  showFace(state: FaceState): void;
  setDetail(detail: 'high' | 'low'): void;
  /** Hangs an object on a socket: it sits on the socket's spot and moves with the socket's joint. */
  attach(object: Object3D, socket: Socket): void;
  /** Frees the figure's own meshes. Whoever attached an object frees that object. */
  dispose(): void;
}

/** One mesh for a set of blocks, each block colored by its role. */
function geometryOf(boxes: readonly Box[], appearance: Appearance): BufferGeometry {
  const color = new Color();
  const pieces = boxes.map((box) => {
    const [w, h, d] = box.size;
    const piece = new BoxGeometry(w, h, d).translate(box.at[0] + w / 2, box.at[1] + h / 2, box.at[2] + d / 2);
    color.setHex(colorOf(box, appearance));
    const count = piece.getAttribute('position').count;
    piece.setAttribute('color', new Float32BufferAttribute(Array.from({ length: count }, () => [color.r, color.g, color.b]).flat(), 3));
    return piece;
  });
  const merged = mergeGeometries(pieces);
  for (const piece of pieces) piece.dispose();
  if (merged === null) throw new Error('The blocks could not be merged.');
  return merged;
}

/**
 * Builds a figure from a body, a face, and whatever it wears. Each joint is a
 * group placed at its pivot, so turning a group turns everything hanging from
 * it. Every shape of every face feature gets a mesh of its own, and only the
 * shapes of the moment show.
 */
export function createFigure(body: Body, face: Face, worn: readonly Worn[], appearance: Appearance = {}): Figure {
  const root = new Group();
  const material = new MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const geometries: BufferGeometry[] = [];
  const joints = new Map<JointName, Group>();
  for (const joint of body.joints) {
    const group = new Group();
    group.position.set(...joint.at);
    (joint.parent === null ? root : joints.get(joint.parent))?.add(group);
    joints.set(joint.name, group);
  }

  const addMesh = (boxes: readonly Box[], joint: JointName): Mesh => {
    const geometry = geometryOf(boxes, appearance);
    geometries.push(geometry);
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    joints.get(joint)?.add(mesh);
    return mesh;
  };
  const solidMeshes: Mesh[] = [];
  const jointBoxes = new Map<JointName, Box[]>();
  for (const piece of [...body.parts, ...worn]) {
    if (piece.boxes.length === 0) continue;
    solidMeshes.push(addMesh(piece.boxes, piece.joint));
    const boxes = jointBoxes.get(piece.joint) ?? [];
    boxes.push(...piece.boxes);
    jointBoxes.set(piece.joint, boxes);
  }
  let reducedMeshes: Mesh[] | undefined;
  let currentDetail: 'high' | 'low' = 'high';
  function buildReducedMeshes(): Mesh[] {
    return [...jointBoxes].map(([joint, boxes]) => {
      const geometry = sculptGeometry(boxes.map(box => ({
        min: [...box.at],
        max: [box.at[0] + box.size[0], box.at[1] + box.size[1], box.at[2] + box.size[2]],
        color: colorOf(box, appearance),
      })), 0.5);
      geometries.push(geometry);
      const mesh = new Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      joints.get(joint)?.add(mesh);
      return mesh;
    });
  }

  const faceMeshes: { feature: FeatureName; shape: string; mesh: Mesh }[] = [];
  for (const [feature, byShape] of Object.entries(face.shapes) as [FeatureName, Record<string, readonly Box[]>][]) {
    for (const [shape, boxes] of Object.entries(byShape)) {
      // A shape such as "no blush" has nothing to draw.
      if (boxes.length === 0) continue;
      const mesh = addMesh(boxes, face.joint);
      if (feature === 'eyes' || feature === 'blush') mesh.castShadow = false;
      faceMeshes.push({ feature, shape, mesh });
    }
  }

  const pelvis = body.joints.find((joint) => joint.parent === null);
  const restHeight = pelvis?.at[1] ?? 0;

  return {
    root,
    pose({ lift, turns }) {
      for (const [name, group] of joints) {
        const turn = turns[name];
        group.rotation.set(turn?.[0] ?? 0, turn?.[1] ?? 0, turn?.[2] ?? 0);
      }
      if (pelvis !== undefined) joints.get(pelvis.name)?.position.setY(restHeight + lift);
    },
    showFace(state) {
      for (const { feature, shape, mesh } of faceMeshes) mesh.visible = state[feature] === shape;
    },
    setDetail(detail) {
      if (detail === currentDetail) return;
      currentDetail = detail;
      reducedMeshes ??= buildReducedMeshes();
      for (const mesh of solidMeshes) mesh.visible = detail === 'high';
      for (const mesh of reducedMeshes) mesh.visible = detail === 'low';
    },
    attach(object, socket) {
      object.position.set(...socket.at);
      if (socket.rotation) object.rotation.set(...socket.rotation);
      joints.get(socket.joint)?.add(object);
    },
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      material.dispose();
    },
  };
}
