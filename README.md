# Character Anatomy

An interactive anatomy mock using the original Studio adult female body.
Click a body part or choose it in the inspector to view its bounding dimensions,
world-space center, and connected joint. Drag to rotate, scroll to zoom, and
press Escape to clear the selection. Left and right follow the character.

## Development

Run `npm install`, then `npm run dev`. Open http://localhost:5175/.
Vite uses port 5175 strictly. If a dev server is already running, use that server.

- `npm run build` checks TypeScript and creates a production build.
- `npm test` runs the geometry and import-isolation checks.

The `/character-study/` URL opens the same anatomy mock.
Previous character and gold gown/cape generators in `character-study/` are
preserved for reference, but are not imported by the active application.
The anatomy mock has no editing or animation controls yet.
