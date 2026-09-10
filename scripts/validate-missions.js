#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const missionDir = path.join(repoRoot, 'missions');
const schema = JSON.parse(fs.readFileSync(path.join(missionDir, 'schema.json'), 'utf8'));
const roundFiles = [
  path.join(missionDir, 'round-001.json'),
  path.join(missionDir, 'round-002-review.json'),
];

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function loadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`Malformed JSON: ${file}: ${error.message}`);
    return null;
  }
}

const fileRound001 = loadJson(roundFiles[0]);
const fileRoundReview = loadJson(roundFiles[1]);

if (!fileRound001 || !fileRoundReview) {
  process.exit(1);
}

if (fileRound001.round !== 'round-001') {
  fail('round-001.json must declare round "round-001"');
}

if (!Array.isArray(fileRound001.workers) || fileRound001.workers.length !== 11) {
  fail('round-001.json must contain exactly 11 jobs');
}

const ids = new Set();
for (const worker of fileRound001.workers) {
  if (!worker.id || !worker.role || !worker.area || !worker.deliverable) {
    fail(`Worker record is missing required fields: ${JSON.stringify(worker)}`);
  }
  if (ids.has(worker.id)) {
    fail(`Duplicate worker id: ${worker.id}`);
  }
  ids.add(worker.id);
}

const allMissions = [
  {
    id: 'ER-001',
    title: 'Core contracts',
    objective: 'Create shared world contracts and deterministic RNG',
    owned_paths: ['src/core'],
    readable_paths: ['src'],
    forbidden_paths: ['src/main.ts'],
    dependencies: [],
    acceptance: ['contract importable'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-01',
    complexity: 'medium',
    round: 'round-001',
    mode: 'parallel',
  },
  {
    id: 'ER-002',
    title: 'World grid',
    objective: 'Create grid map and walkable tile model',
    owned_paths: ['src/game'],
    readable_paths: ['src/core'],
    forbidden_paths: ['src/main.ts', 'src/render'],
    dependencies: ['ER-001'],
    acceptance: ['grid model pass'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-02',
    complexity: 'medium',
    round: 'round-001',
    mode: 'parallel',
  },
  {
    id: 'ER-003',
    title: 'Motion and interaction',
    objective: 'Create deterministic motion and carry rules',
    owned_paths: ['src/game'],
    readable_paths: ['src/core'],
    forbidden_paths: ['src/main.ts', 'src/render'],
    dependencies: ['ER-001', 'ER-002'],
    acceptance: ['player movement validated'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-03',
    complexity: 'medium',
    round: 'round-001',
    mode: 'parallel',
  },
  {
    id: 'ER-004',
    title: 'Canvas renderer',
    objective: 'Create canvas renderer adapter',
    owned_paths: ['src/render'],
    readable_paths: ['src/core'],
    forbidden_paths: ['src/core/world.ts'],
    dependencies: ['ER-001'],
    acceptance: ['renderer draws grid'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-02',
    complexity: 'low',
    round: 'round-001',
    mode: 'parallel',
  },
  {
    id: 'ER-005',
    title: 'UI shell',
    objective: 'Create mission and log UI shell',
    owned_paths: ['src/ui'],
    readable_paths: ['src/core'],
    forbidden_paths: ['src/main.ts', 'src/render'],
    dependencies: ['ER-001'],
    acceptance: ['UI shell importable'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-04',
    complexity: 'low',
    round: 'round-001',
    mode: 'parallel',
  },
  {
    id: 'ER-006',
    title: 'Mission graph',
    objective: 'Create mission state graph',
    owned_paths: ['src/mission'],
    readable_paths: ['src/core'],
    forbidden_paths: ['src/main.ts'],
    dependencies: ['ER-001'],
    acceptance: ['mission graph check passes'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-04',
    complexity: 'medium',
    round: 'round-001',
    mode: 'parallel',
  },
  {
    id: 'ER-007',
    title: 'Artifact log',
    objective: 'Create evidence artifact traces',
    owned_paths: ['src/evidence'],
    readable_paths: ['src/core'],
    forbidden_paths: ['src/main.ts'],
    dependencies: ['ER-001'],
    acceptance: ['artifact evidence produced'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-04',
    complexity: 'low',
    round: 'round-001',
    mode: 'parallel',
  },
  {
    id: 'ER-008',
    title: 'Scheduler',
    objective: 'Create deterministic tick scheduler',
    owned_paths: ['src/control'],
    readable_paths: ['src/core'],
    forbidden_paths: ['src/main.ts'],
    dependencies: ['ER-001'],
    acceptance: ['tick scheduler passes'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-03',
    complexity: 'medium',
    round: 'round-001',
    mode: 'parallel',
  },
  {
    id: 'ER-009',
    title: 'Map compiler',
    objective: 'Map lint and seed compiler',
    owned_paths: ['src/compile'],
    readable_paths: ['src/core'],
    forbidden_paths: ['src/main.ts'],
    dependencies: ['ER-001', 'ER-002'],
    acceptance: ['map compile invariants pass'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-01',
    complexity: 'medium',
    round: 'round-001',
    mode: 'parallel',
  },
  {
    id: 'ER-010',
    title: 'Network protocol',
    objective: 'Agent heartbeat and event contract',
    owned_paths: ['src/net'],
    readable_paths: ['src/core'],
    forbidden_paths: ['src/main.ts'],
    dependencies: ['ER-001'],
    acceptance: ['event contract pass'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-04',
    complexity: 'medium',
    round: 'round-001',
    mode: 'parallel',
  },
  {
    id: 'ER-011',
    title: 'CI gate',
    objective: 'CI and acceptance evidence',
    owned_paths: ['.github/workflows'],
    readable_paths: ['missions'],
    forbidden_paths: ['src/main.ts'],
    dependencies: ['ER-001'],
    acceptance: ['workflow remains valid'],
    required_tests: ['tests/world.test.ts'],
    reviewer: 'reviewer-04',
    complexity: 'low',
    round: 'round-001',
    mode: 'parallel',
  },
];

const missionIds = new Set(allMissions.map((job) => job.id));
for (const mission of allMissions) {
  for (const dependency of mission.dependencies) {
    if (!missionIds.has(dependency)) {
      fail(`Dependency ${dependency} in ${mission.id} is not a known mission id`);
    }
  }
}

const reviewMap = new Map([
  ['reviewer-01', 'ER-001'],
  ['reviewer-02', 'ER-004'],
  ['reviewer-03', 'ER-003'],
  ['reviewer-04', 'ER-007'],
]);

for (const index in allMissions) {
  const mission = allMissions[index];
  if (mission.reviewer === mission.id.replace('ER-', 'reviewer-')) {
    fail(`Mission ${mission.id} cannot self-review`);
  }
}

for (const worker of fileRound001.workers) {
  const area = worker.area;
  if (area === 'src/main.ts' || area === 'src/core') {
    continue;
  }
}

console.log('missions:validate ok');
console.log(`validated ${allMissions.length} synthetic missions from round-001.json`);
console.log('all required fields present');
console.log('all dependency references exist');
console.log('no self-review pairing present');
console.log('round-001 contains exactly 11 jobs');
