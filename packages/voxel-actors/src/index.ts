/**
 * Voxel characters. Describe a person by age and gender, and get back a body
 * made of voxel blocks, the joints it turns on, the spots where things attach,
 * a face whose expression can change, and motions to move it with.
 *
 * The library knows nothing of any game or engine, and draws nothing itself.
 * Sizes are in voxels and colors are roles: the user decides how big a voxel
 * is and what color each role gets.
 *
 * `core` is what any creature is made of: blocks, joints, poses and motion.
 * `humanoid` is the people built on it. Another kind of creature is another
 * folder beside it.
 */
export { blendPoses } from './core/pose.js';
export type { Pose } from './core/pose.js';
export { createBody, resolveProportions } from './humanoid/body.js';
export type { Age, Body, BodySpec, Proportions, ProportionOverrides, EarPlace, FaceArea, Gender, HeadShape, Posture, Socket, SocketName } from './humanoid/body.js';
export { bodyRegions, parentRegion, isBodyRegion, oppositeRegion } from './humanoid/regions.js';
export type { BodyRegionId } from './humanoid/regions.js';
export { colorOf } from './humanoid/appearance/appearance.js';
export { defaultPalette } from './humanoid/appearance/defaultPalette.js';
export type { Appearance } from './humanoid/appearance/appearance.js';
export { measureSolids } from './core/measure.js';
export type { SolidMeasurements } from './core/measure.js';
export { measureBody } from './humanoid/anatomy.js';
export type { AnatomyMeasurements, RegionMeasurements } from './humanoid/anatomy.js';
export { CHARACTER_SCALE, metresPerVoxel, voxelScaleFactor } from './core/units.js';
export type { VoxelScale } from './core/units.js';
export { carryingRoom } from './humanoid/clips/carry/load.js';
export type { Room } from './humanoid/clips/carry/load.js';
export { clips, poseAt } from './humanoid/clips/clips.js';
export type { ClipName } from './humanoid/clips/clips.js';
export { hoopAt } from './humanoid/clips/hulaHoop/hoop.js';
export type { Hoop } from './humanoid/clips/hulaHoop/hoop.js';
export type { Clip, Swing } from './humanoid/clips/pose.js';
export { ropeAt } from './humanoid/clips/ropeSkip/rope.js';
export type { Rope } from './humanoid/clips/ropeSkip/rope.js';
export { createFace, expressions, faceAt, faceBoxes, faceOptionsFor } from './humanoid/appearance/face.js';
export type { ExpressionName, Face, FaceOptions, FaceShapes, FaceState, FeatureName, FeatureShapes } from './humanoid/appearance/face.js';
export { createHair, hairStyles } from './humanoid/appearance/hair/hair.js';
export type { Hair, HairStyle, HairStyleName } from './humanoid/appearance/hair/hair.js';
export { createHat, hairUnder, hatStyles } from './humanoid/appearance/hats/hats.js';
export type { Hat, HatStyle, HatStyleName } from './humanoid/appearance/hats/hats.js';
export type { Box, BodyBox, BodyPart, Part, Role, Worn } from './humanoid/model.js';
export { dress, applyOutfit, everydayOutfits, outfits, workOutfits } from './humanoid/appearance/outfits/outfits.js';
export type { Dressed, EverydayOutfitName, Outfit, OutfitName, WorkOutfitName } from './humanoid/appearance/outfits/outfits.js';
export { createMotion } from './humanoid/motion.js';
export type { Motion } from './humanoid/motion.js';
export type { Joint, JointName } from './humanoid/skeleton.js';
export { actionHand, equipmentGrip, equipmentItems } from './equipment/equipment.js';
export type { Equipment, EquipmentHand, EquipmentItem, EquipmentName } from './equipment/equipment.js';
export { crateFor, hoopFor, skippingRopeFor } from './equipment/items/motionProps.js';
export type { PropBlock } from './equipment/items/motionProps.js';
