#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateRound001, validateReview } from './mission-lib.js';

const repoRoot = process.cwd();
const fixtures = path.join(repoRoot, '.fixtures');
const lintDir = path.join(fixtures, 'negative');
fs.rmSync(fixtures, { recursive: true, force: true });
fs.mkdirSync(lintDir, { recursive: true });

const makeMission = (id, worker, owner, reviewer, dep = []) => ({
  id,
  title: id,
  objective: 'mission contract test fixture',
  worker_slot: worker,
  owned_paths: [owner],
  readable_paths: ['src'],
  forbidden_paths: ['src/main.ts'],
  dependencies: dep,
  acceptance: ['pass'],
  required_tests: ['tests/world.test.ts'],
  reviewer_slot: reviewer,
  complexity: 'low',
});

const baseRound = {
  round: 'round-001',
  project: 'Eleven-Realms',
  mode: 'parallel',
  missions: [
    makeMission('ER-001', 'worker-01', 'src/core', 'worker-02'),
    makeMission('ER-002', 'worker-02', 'src/world', 'worker-03'),
    makeMission('ER-003', 'worker-03', 'src/player', 'worker-04'),
  ],
};

const baseReview = {
  round: 'round-002-review',
  project: 'Eleven-Realms',
  mode: 'evidence-review',
  review_pairs: [
    { mission_id: 'ER-001', reviewer_slot: 'worker-02', acceptance_commands: ['npm run missions:validate'] },
    { mission_id: 'ER-002', reviewer_slot: 'worker-03', acceptance_commands: ['npm run missions:audit'] },
    { mission_id: 'ER-003', reviewer_slot: 'worker-04', acceptance_commands: ['npm run smoke'] },
  ],
};

const cases = [];

cases.push({
  name: 'duplicate-owned-path',
  run: () => {
    const round = structuredClone(baseRound);
    round.missions[1].owned_paths = ['src/world'];
    round.missions[2].owned_paths = ['src/world'];
    const errors = validateRound001(round);
    return errors.some((e) => e.includes('ownership collision'));
  },
  expected: 'ownership collision',
});

cases.push({
  name: 'parent-child-owned-path',
  run: () => {
    const round = structuredClone(baseRound);
    round.missions[1].owned_paths = ['src/world'];
    round.missions[2].owned_paths = ['src/world/terrain'];
    const errors = validateRound001(round);
    return errors.some((e) => e.includes('ownership collision'));
  },
  expected: 'ownership collision',
});

cases.push({
  name: 'unknown-dependency',
  run: () => {
    const round = structuredClone(baseRound);
    round.missions[1].dependencies = ['ER-999'];
    const errors = validateRound001(round);
    return errors.some((e) => e.includes('ER-999'));
  },
  expected: 'dependency ER-999',
});

cases.push({
  name: 'missing-required-mission-field',
  run: () => {
    const round = structuredClone(baseRound);
    delete round.missions[1].complexity;
    const errors = validateRound001(round);
    return errors.some((e) => e.includes('missing complexity'));
  },
  expected: 'missing complexity',
});

cases.push({
  name: 'duplicate-mission-id',
  run: () => {
    const round = structuredClone(baseRound);
    round.missions[2].id = 'ER-001';
    const errors = validateRound001(round);
    return errors.some((e) => e.includes('duplicate mission id ER-001'));
  },
  expected: 'duplicate mission id ER-001',
});

cases.push({
  name: 'self-review',
  run: () => {
    const round = structuredClone(baseRound);
    round.missions[0].reviewer_slot = 'worker-01';
    const errors = validateRound001(round);
    return errors.some((e) => e.includes('self-review'));
  },
  expected: 'self-review',
});

cases.push({
  name: 'duplicate-review-assignment',
  run: () => {
    const round = structuredClone(baseRound);
    const review = structuredClone(baseReview);
    review.review_pairs.push({ mission_id: 'ER-001', reviewer_slot: 'worker-03', acceptance_commands: ['npm run missions:validate'] });
    const errors = validateReview(review, round);
    return errors.some((e) => e.includes('duplicate review assignment'));
  },
  expected: 'duplicate review assignment',
});

cases.push({
  name: 'mission-with-no-reviewer',
  run: () => {
    const round = structuredClone(baseRound);
    round.missions[2].reviewer_slot = '';
    const errors = validateRound001(round);
    return errors.some((e) => e.includes('missing')) || errors.some((e) => e.includes('reviewer_slot'));
  },
  expected: 'reviewer_slot',
});

cases.push({
  name: 'review-pointing-to-nonexistent-mission',
  run: () => {
    const round = structuredClone(baseRound);
    const review = structuredClone(baseReview);
    review.review_pairs = [{ mission_id: 'ER-999', reviewer_slot: 'worker-02', acceptance_commands: ['npm run missions:validate'] }];
    const errors = validateReview(review, round);
    return errors.some((e) => e.includes('unknown mission ER-999'));
  },
  expected: 'unknown mission ER-999',
});

cases.push({
  name: 'path-normalisation-and-traversal-attempt',
  run: () => {
    const round = structuredClone(baseRound);
    round.missions[1].owned_paths = ['src/../src/secret'];
    const errors = validateRound001(round);
    return errors.some((e) => e.includes('contains path traversal'));
  },
  expected: 'contains path traversal',
});

for (const test of cases) {
  const ok = test.run();
  if (!ok) {
    console.error(`negative test ${test.name} failed: expected ${test.expected}`);
    process.exitCode = 1;
  } else {
    console.log(`negative test ${test.name}: expected ${test.expected} caught`);
  }
}

const outOfScope = spawnSync('node', ['scripts/mission-check.js', 'ER-002', 'src/secret/does-not-belong.ts'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

if (outOfScope.status === 0) {
  console.error('negative ownership check unexpectedly passed for out-of-scope file');
  process.exitCode = 1;
} else if (!outOfScope.stderr.includes('not in owned_paths or readable_paths')) {
  console.error('negative ownership check failed for the wrong reason');
  console.error(outOfScope.stderr);
  process.exitCode = 1;
} else {
  console.log('negative test out-of-scope-ownership: ownership checker correctly rejected out-of-scope file');
}

console.log(`negative-tests ok (${cases.length + 1} cases)`);
