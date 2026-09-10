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

const mission = (round.missions || []).find((entry) => entry.id === missionId);
if (!mission) {
  console.error(`unknown mission id ${missionId}`);
  process.exit(1);
}

const violations = [];
for (const file of changedFiles) {
  const owned = mission.owned_paths.some((pattern) => file === pattern || file.startsWith(pattern + '/'));
  const readable = mission.readable_paths.some((pattern) => file === pattern || file.startsWith(pattern + '/'));
  const forbidden = mission.forbidden_paths.some((pattern) => file === pattern || file.startsWith(pattern + '/'));

  if (forbidden) {
    violations.push(`${file}: forbidden path ${pattern}`);
  }
  if (!owned && !readable) {
    violations.push(`${file}: not in owned_paths or readable_paths for ${missionId}`);
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
