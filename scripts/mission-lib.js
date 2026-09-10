import fs from 'node:fs';
import path from 'node:path';

export const repoRoot = process.cwd();
export const missionsDir = path.join(repoRoot, 'missions');
export const round001Path = path.join(missionsDir, 'round-001.json');
export const round002Path = path.join(missionsDir, 'round-002-review.json');
export const schemaPath = path.join(missionsDir, 'schema.json');
export const collisionReportPath = path.join(missionsDir, 'collision-report.json');

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function loadRound001() {
  return readJson(round001Path);
}

export function loadRound002() {
  return readJson(round002Path);
}

export function normalizePath(p) {
  const value = String(p).replace(/\\/g, '/');
  return value.replace(/^\.\//, '').replace(/^\//, '').replace(/\/\*\*$/, '').replace(/\/\*$/, '').replace(/\/\.\.$/, '').replace(/\/\.\./, '');
}

export function pathContainsChild(parent, child) {
  const p = normalizePath(parent).replace(/\*\*$/, '').replace(/\*$/, '');
  const c = normalizePath(child).replace(/\*\*$/, '').replace(/\*$/, '');
  return c === p || c.startsWith(p + '/');
}

export function pathsOverlap(a, b) {
  const p = normalizePath(a);
  const q = normalizePath(b);

  if (!p || !q) return false;

  // exact own same directory/file
  if (p === q) return true;

  // parent/child overlap
  if (p.startsWith(q + '/') || q.startsWith(p + '/')) return true;

  // broad directory with nested child
  return pathContainsChild(p, q) || pathContainsChild(q, p);
}

export function validateMissionRecord(mission, index, ownMissionSet) {
  const errors = [];
  const req = [
    'id',
    'title',
    'objective',
    'worker_slot',
    'owned_paths',
    'readable_paths',
    'forbidden_paths',
    'dependencies',
    'acceptance',
    'required_tests',
    'reviewer_slot',
    'complexity',
  ];

  for (const key of req) {
    if (!(key in mission)) {
      errors.push(`mission ${index}: missing ${key}`);
    }
  }

  if (!mission || !mission.id || !/^ER-\d{3}$/.test(mission.id)) {
    errors.push(`mission ${index}: invalid id ${mission.id}`);
  }

  for (const key of ['owned_paths', 'readable_paths', 'forbidden_paths', 'dependencies', 'acceptance', 'required_tests']) {
    if (mission[key] && !Array.isArray(mission[key])) {
      errors.push(`mission ${index}: ${key} must be an array`);
    }
  }

  if (mission.owned_paths) {
    for (const pathValue of mission.owned_paths) {
      if (!/^src\//.test(pathValue) && !/^\.github\//.test(pathValue)) {
        errors.push(`mission ${index}: owned path ${pathValue} is not inside an allowed project area`);
      }
      if (pathValue.includes('..')) {
        errors.push(`mission ${index}: owned path ${pathValue} contains path traversal`);
      }
    }
  }

  for (const dep of mission.dependencies || []) {
    if (!/^ER-\d{3}$/.test(dep)) {
      errors.push(`mission ${index}: dependency ${dep} has invalid format`);
    }
  }

  if (mission.reviewer_slot === mission.worker_slot) {
    errors.push(`mission ${index}: self-review is forbidden`);
  }

  return errors;
}

export function validateRound001(round) {
  const errors = [];
  const ownMissionSet = new Set();

  if (!round || round.round !== 'round-001') {
    errors.push('round-001 file must declare round "round-001"');
  }

  if (!round || round.mode !== 'parallel') {
    errors.push('round-001 file must declare mode "parallel"');
  }

  if (!round || !Array.isArray(round.missions)) {
    errors.push('round-001 file must contain a missions array');
    return errors;
  }

  if (round.missions.length !== 11) {
    errors.push(`round-001 must contain exactly 11 missions; found ${round.missions.length}`);
  }

  for (const mission of round.missions) {
    if (!mission.id) {
      errors.push('one mission has no id');
      continue;
    }
    if (ownMissionSet.has(mission.id)) {
      errors.push(`duplicate mission id ${mission.id}`);
    }
    ownMissionSet.add(mission.id);
  }

  const missionsById = new Map(round.missions.map((m) => [m.id, m]));
  for (const [i, mission] of round.missions.entries()) {
    const recordErrors = validateMissionRecord(mission, i, ownMissionSet);
    errors.push(...recordErrors);
  }

  for (const mission of round.missions) {
    for (const dep of mission.dependencies || []) {
      if (!missionsById.has(dep)) {
        errors.push(`mission ${mission.id} dependency ${dep} is not declared`);
      }
    }
  }

  const reviewerSlots = new Set(round.missions.map((m) => m.reviewer_slot));
  if (reviewerSlots.size !== 11) {
    errors.push('reviewer_slot assignment must include all 11 distinct reviewers');
  }

  for (let i = 0; i < round.missions.length; i += 1) {
    for (let j = i + 1; j < round.missions.length; j += 1) {
      const lhs = round.missions[i];
      const rhs = round.missions[j];
      for (const a of lhs.owned_paths) {
        for (const b of rhs.owned_paths) {
          if (pathsOverlap(a, b)) {
            errors.push(`ownership collision between ${lhs.id} and ${rhs.id}: ${a} overlaps ${b}`);
          }
        }
      }
    }
  }

  return errors;
}

export function validateReview(roundReview, round) {
  const errors = [];
  if (!roundReview || !Array.isArray(roundReview.review_pairs)) {
    return ['round-002-review must contain review_pairs array'];
  }

  const missionIds = new Set((round.missions || []).map((m) => m.id));
  const reviewed = new Set();
  for (const pair of roundReview.review_pairs) {
    if (!pair.mission_id || !pair.reviewer_slot) {
      errors.push('review pair is missing mission_id or reviewer_slot');
      continue;
    }
    if (!missionIds.has(pair.mission_id)) {
      errors.push(`review pair references unknown mission ${pair.mission_id}`);
      continue;
    }
    if (reviewed.has(pair.mission_id)) {
      errors.push(`duplicate review assignment for ${pair.mission_id}`);
    }
    reviewed.add(pair.mission_id);
  }

  // Ensure exactly 11 review pairs, no self-review, all missions covered once.
  if (roundReview.review_pairs.length !== 11) {
    errors.push(`review_pairs must contain exactly 11 entries; found ${roundReview.review_pairs.length}`);
  }

  const workerSlots = new Set((round.missions || []).map((m) => m.worker_slot));
  const reviewByReviewer = new Map();
  for (const pair of roundReview.review_pairs) {
    if (!workerSlots.has(pair.reviewer_slot)) {
      errors.push(`unknown reviewer_slot ${pair.reviewer_slot}`);
    }
    const mission = round.missions.find((m) => m.id === pair.mission_id);
    if (mission && pair.reviewer_slot === mission.worker_slot) {
      errors.push(`self-review detected: ${pair.reviewer_slot} reviews ${pair.mission_id}`);
    }
    if (!reviewByReviewer.has(pair.reviewer_slot)) reviewByReviewer.set(pair.reviewer_slot, new Set());
    reviewByReviewer.get(pair.reviewer_slot).add(pair.mission_id);
  }

  for (const mission of round.missions) {
    const hasReview = roundReview.review_pairs.some((pair) => pair.mission_id === mission.id);
    if (!hasReview) {
      errors.push(`mission ${mission.id} is unreviewed`);
    }
  }

  return errors;
}
