# Voxel Actors

Voxel Actors is a work-in-progress TypeScript library for voxel characters. It currently supports humanoid bodies, facial expressions, hairstyles, outfits, equipment, and animation clips. The library provides the character data and poses. The preview app draws them with Three.js.

## Run locally

Run `npm install` to install dependencies, then `npm run dev` to start Vite on port 5175.

- [Studio](http://localhost:5175/) lets you customize and equip a character, preview animations, and compare rendering detail levels.
- [Anatomy](http://localhost:5175/anatomy) lets you compare body presets and inspect part dimensions, position, joints, and voxel counts.

## Project layout

- `packages/voxel-actors/` contains the shared library. Its public API starts at `src/index.ts`.
- `app/` contains Studio, Anatomy, and the Three.js renderer. Earlier character studies, including the gown and cape, live in `app/studio/studies/`.
- `tests/` contains the automated checks for the library and app.

Run `npm run build` to type-check and build both the library and preview app.
Run `npm test` to run the automated tests.
