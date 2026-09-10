#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { loadRound001, loadRound002, pathsOverlap, pathContainsChild, validateRound001, validateReview } from './mission-lib.js';

const repoRoot = process.cwd();
const missionsDir = path.join(repoRoot, 'missions');
const round = loadRound001();
const review = loadRound002();

const errors = [];
errors.push(...validateRound001(round));
errors.push(...validateReview(review, round));

if (!errors.length) {
  const rows = [];
  for (const mission of round.missions) {
    rows.push({
      id: mission.id,
      title: mission.title,
      worker_slot: mission.worker_slot,
      owned_paths: mission.owned_paths,
      readable_paths: mission.readable_paths,
      forbidden_paths: mission.forbidden_paths,
      dependencies: mission.dependencies,
      acceptance: mission.acceptance,
      required_tests: mission.required_tests,
      reviewer_slot: mission.reviewer_slot,
      complexity: mission.complexity,
    });
  }

  const collisionRows = [];
  for (let i = 0; i < round.missions.length; i += 1) {
    for (let j = i + 1; j < round.missions.length; j += 1) {
      const lhs = round.missions[i];
      const rhs = round.missions[j];
      for (const a of lhs.owned_paths) {
        for (const b of rhs.owned_paths) {
          if (pathsOverlap(a, b)) {
            collisionRows.push({ mission_ids: [lhs.id, rhs.id], owned_paths: [a, b] });
          }
        }
      }
    }
  }

  const report = {
    round: round.round,
    project: round.project,
    parallelisable: errors.length === 0,
    summary: {
      mission_count: round.missions.length,
      collision_count: collisionRows.length,
      dependency_issue_count: 0,
      review_pairs_count: review.review_pairs.length,
      dispatch_ready_from_project_side: errors.length === 0,
    },
    missions: rows,
    collisions: collisionRows,
    architecture_changes: {
      'src/core/contracts.ts': 'stable shared contract surface',
      'src/core/world.ts': 'authoritative state transition contract',
      'src/render/canvasRenderer.ts': 'isolated renderer adapter',
      'src/main.ts': 'composition-only shell, no feature ownership',
    },
    notes: [
      'No two Round 001 missions have overlapping writable ownership paths in the authoritative mission dataset.'
    ],
  };

  fs.writeFileSync(path.join(missionsDir, 'collision-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('missions:audit ok');
  console.log(`missions=${round.missions.length} collisions=${collisionRows.length}`);
} else {
  const report = {
    round: round.round,
    project: round.project,
    parallelisable: false,
    summary: {
      mission_count: round.missions.length,
      collision_count: 0,
      dependency_issue_count: 0,
      review_pairs_count: review.review_pairs.length,
      dispatch_ready_from_project_side: false,
    },
    missions: round.missions,
    collisions: [],
    errors,
    notes: ['Audit failed because validateRound001/review failed.'],
  };

  fs.writeFileSync(path.join(missionsDir, 'collision-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.error('missions:audit fail');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}
