#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const checks = [
  { name: 'mission-schema', command: 'npm run missions:validate' },
  { name: 'unit-tests', command: 'npm test' },
  { name: 'typecheck', command: 'npm run typecheck' },
  { name: 'deterministic-smoke', command: 'npm run smoke' },
  { name: 'build', command: 'npm run build' },
];

let failures = 0;
console.log('fleet:verify start');
for (const check of checks) {
  try {
    console.log(`running ${check.name}`);
    execSync(check.command, { cwd: repoRoot, stdio: 'inherit' });
  } catch (error) {
    failures += 1;
    console.error(`fleet:verify failure: ${check.name}`);
  }
}

const round = JSON.parse(fs.readFileSync(path.join(repoRoot, 'missions', 'round-001.json'), 'utf8'));
const assignmentTemplate = JSON.parse(fs.readFileSync(path.join(repoRoot, 'missions', 'round-001-assignment-template.json'), 'utf8'));
if (!Array.isArray(round.missions) || round.missions.length !== 11) {
  failures += 1;
  console.error('fleet:verify failure: round-001 must contain exactly 11 missions');
}
if (!assignmentTemplate.assignment_template.mapping || Object.keys(assignmentTemplate.assignment_template.mapping).length !== 11) {
  failures += 1;
  console.error('fleet:verify failure: assignment-template has 11 mapping slots');
}

if (failures > 0) {
  console.error(`fleet:verify finished with ${failures} failures`);
  process.exit(1);
}

console.log('fleet:verify ok');
console.log('mission schema, ownership scaffolding, tests, smoke, typecheck, and build accepted');
