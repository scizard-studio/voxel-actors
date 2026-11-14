import { expect, it } from 'vitest';

// Studio source files, excluding the bundled character library and tests.
const sources = import.meta.glob<string>(['../**/*.ts', '!../packages/**', '!../tests/**'], { query: '?raw', import: 'default', eager: true });
const IMPORT = /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

/** Resolves a relative import within the studio directory. */
function target(file: string, spec: string): string | null {
  const parts = file.slice(3).split('/').slice(0, -1);
  for (const step of spec.split('/')) {
    if (step === '..') {
      if (parts.pop() === undefined) return null;
    } else if (step !== '.') {
      parts.push(step);
    }
  }
  return parts.join('/');
}

/** The studio may use its own files, the character library, and Three.js. Nothing of the game or its engine. */
function allowed(file: string, spec: string): boolean {
  if (spec === 'three' || spec.startsWith('three/addons/')) return true;
  if (!spec.startsWith('.')) return false;
  const path = target(file, spec);
  return path !== null && (!path.startsWith('packages/') || path === 'packages/characters/src');
}

it('uses only its own files, the character library and Three.js', () => {
  const outside: string[] = [];
  for (const [file, text] of Object.entries(sources)) {
    for (const match of text.matchAll(IMPORT)) {
      const spec = match[1] ?? match[2] ?? match[3];
      if (!allowed(file, spec)) outside.push(`${file} imports ${spec}`);
    }
  }
  expect(Object.keys(sources).some((file) => file.startsWith('../props/'))).toBe(true);
  expect(outside).toEqual([]);
});
