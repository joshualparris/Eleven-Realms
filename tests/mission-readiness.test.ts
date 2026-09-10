import { describe, expect, it } from 'vitest';
import { pathsOverlap, validateRound001, validateReview } from '../scripts/mission-lib.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('mission source-of-truth validation', () => {
  it('rejects parent-child overlap and collision by claimed path rules', () => {
    expect(pathsOverlap('src/game', 'src/game/player')).toBe(true);
    expect(pathsOverlap('src/game', 'src/world')).toBe(false);
  });

  it('fails when the authoritative round-001 file is not the schema shape', () => {
    const round = JSON.parse(readFileSync(path.join(process.cwd(), 'missions', 'round-001.json'), 'utf8'));
    const errors = validateRound001(round);
    expect(errors).toEqual([]);
  });

  it('fails review self-pairing and duplicate review assignment checks', () => {
    const round = JSON.parse(readFileSync(path.join(process.cwd(), 'missions', 'round-001.json'), 'utf8'));
    const review = JSON.parse(readFileSync(path.join(process.cwd(), 'missions', 'round-002-review.json'), 'utf8'));
    const errors = validateReview(review, round);
    expect(errors).toEqual([]);
  });
});
