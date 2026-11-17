import type { FaceState } from '../../appearance/face.js';

// Speech comes in syllables this long, in seconds, in phrases this long with a pause this long at the end.
const SYLLABLE = 0.13;
const PHRASE = 2.4;
const PAUSE = 0.5;
// This share of syllables open the mouth.
const OPEN_SHARE = 0.6;
// Each seed moves the words this many syllables along, and the phrases this many seconds, so a crowd
// does not talk as one.
const SEED_SYLLABLES = 7919;
const SEED_SECONDS = 0.77;

/** A number from 0 to 1 that looks random but is always the same for the same count. */
function scatter(count: number): number {
  const spread = Math.sin(count * 12.9898) * 43758.5453;
  return spread - Math.floor(spread);
}

/** A face talking: the mouth opening and closing syllable by syllable, resting at the end of each phrase. */
export function talkingMouth(face: FaceState, seconds: number, seed: number): FaceState {
  const shifted = seconds + seed * SEED_SECONDS;
  const intoPhrase = ((shifted % PHRASE) + PHRASE) % PHRASE;
  if (intoPhrase > PHRASE - PAUSE) return face;
  return scatter(Math.floor(shifted / SYLLABLE) + seed * SEED_SYLLABLES) < OPEN_SHARE ? { ...face, mouth: 'open' } : face;
}
