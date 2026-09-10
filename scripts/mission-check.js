#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const missionDir = path.join(repoRoot, 'missions');
const missionJson = path.join(missionDir, 'round-001.json');
const round = JSON.parse(fs.readFileSync(missionJson, 'utf8'));

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('usage: npm run mission:check -- ER-004 src/core/world.ts');
  process.exit(1);
}

const missionId = args[0];
const changedFiles = args.slice(1);

const missionMap = {
  'ER-001': { owned_paths: ['src/core'], readable_paths: ['src'], forbidden_paths: ['src/main.ts'] },
  'ER-002': { owned_paths: ['src/game'], readable_paths: ['src/core'], forbidden_paths: ['src/main.ts', 'src/render'] },
  'ER-003': { owned_paths: ['src/game'], readable_paths: ['src/core'], forbidden_paths: ['src/main.ts', 'src/render'] },
  'ER-004': { owned_paths: ['src/render'], readable_paths: ['src/core'], forbidden_paths: ['src/core/world.ts'] },
  'ER-005': { owned_paths: ['src/ui'], readable_paths: ['src/core'], forbidden_paths: ['src/main.ts', 'src/render'] },
  'ER-006': { owned_paths: ['src/mission'], readable_paths: ['src/core'], forbidden_paths: ['src/main.ts'] },
  'ER-007': { owned_paths: ['src/evidence'], readable_paths: ['src/core'], forbidden_paths: ['src/main.ts'] },
  'ER-008': { owned_paths: ['src/control'], readable_paths: ['src/core'], forbidden_paths: ['src/main.ts'] },
  'ER-009': { owned_paths: ['src/compile'], readable_paths: ['src/core'], forbidden_paths: ['src/main.ts'] },
  'ER-010': { owned_paths: ['src/net'], readable_paths: ['src/core'], forbidden_paths: ['src/main.ts'] },
  'ER-011': { owned_paths: ['.github/workflows'], readable_paths: ['missions'], forbidden_paths: ['src/main.ts'] },
};

const mission = missionMap[missionId];
if (!mission) {
  console.error(`unknown mission id ${missionId}`);
  process.exit(1);
}

const violations = [];
for (const file of changedFiles) {
  const allowed = mission.owned_paths.some((pathPattern) => file.startsWith(pathPattern));
  const forbidden = mission.forbidden_paths.some((forbiddenPath) => file.startsWith(forbiddenPath));
  if (forbidden) {
    violations.push(`${file}: forbidden path ${forbidden}`);
  }
  if (!allowed) {
    violations.push(`${file}: not in owned_paths for ${missionId}`);
  }
}

if (violations.length) {
  console.error(`mission:check fail for ${missionId}`);
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`mission:check ok for ${missionId}`);
console.log(`allowed changes: ${changedFiles.join(', ')}`);
