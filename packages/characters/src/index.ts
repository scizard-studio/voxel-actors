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
export { blendPoses } from './core/pose';
export type { Pose } from './core/pose';
export { createBody, resolveProportions } from './humanoid/body';
export type { Age, Body, BodySpec, Proportions, ProportionOverrides, EarPlace, FaceArea, Gender, HeadShape, Posture, Socket, SocketName } from './humanoid/body';
export { bodyRegions, parentRegion, isBodyRegion, oppositeRegion } from './humanoid/regions';
export type { BodyRegionId } from './humanoid/regions';
export { colorOf } from './humanoid/appearance';
export { defaultPalette } from './humanoid/defaultPalette';
export type { Appearance } from './humanoid/appearance';
export { measureSolids } from './core/measure';
export type { SolidMeasurements } from './core/measure';
export { measureBody } from './humanoid/anatomy';
export type { AnatomyMeasurements, RegionMeasurements } from './humanoid/anatomy';
export { CHARACTER_SCALE, metresPerVoxel, voxelScaleFactor } from './core/units';
export type { VoxelScale } from './core/units';
export { carryingRoom } from './humanoid/clips/carry/load';
export type { Room } from './humanoid/clips/carry/load';
export { clips, poseAt } from './humanoid/clips/clips';
export type { ClipName } from './humanoid/clips/clips';
export { hoopAt } from './humanoid/clips/hulaHoop/hoop';
export type { Hoop } from './humanoid/clips/hulaHoop/hoop';
export type { Clip, Swing } from './humanoid/clips/pose';
export { ropeAt } from './humanoid/clips/ropeSkip/rope';
export type { Rope } from './humanoid/clips/ropeSkip/rope';
export { createFace, expressions, faceAt, faceOptionsFor } from './humanoid/face';
export type { ExpressionName, Face, FaceOptions, FaceShapes, FaceState, FeatureName, FeatureShapes } from './humanoid/face';
export { createHair, hairStyles } from './humanoid/hair/hair';
export type { Hair, HairStyle, HairStyleName } from './humanoid/hair/hair';
export { createHat, hairUnder, hatStyles } from './humanoid/hats/hats';
export type { Hat, HatStyle, HatStyleName } from './humanoid/hats/hats';
export type { Box, BodyBox, BodyPart, Part, Role, Worn } from './humanoid/model';
export { dress, applyOutfit, everydayOutfits, outfits, workOutfits } from './humanoid/outfits/outfits';
export type { Dressed, EverydayOutfitName, Outfit, OutfitName, WorkOutfitName } from './humanoid/outfits/outfits';
export { createMotion } from './humanoid/motion';
export type { Motion } from './humanoid/motion';
export type { Joint, JointName } from './humanoid/skeleton';
