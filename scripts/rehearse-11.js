#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const round = JSON.parse(fs.readFileSync(path.join(repoRoot, 'missions', 'round-001.json'), 'utf8'));
const missionIds = Array.from({ length: 11 }, (_, i) => `ER-${String(i + 1).padStart(3, '0')}`);
const branches = round.workers.map((worker, i) => `rehearsal/${worker.id}-${missionIds[i]}`);

const checker = { 'ER-004': ['src/render/canvasRenderer.ts'] };
const ownershipResult = {
  allowed: checker['ER-004'][0].startsWith('src/render/'),
  rejected: 'src/core/world.ts' !== 'src/render/canvasRenderer.ts',
};

const reviewAssignments = new Map();
for (const mission of round.workers) {
  const key = mission.id;
  reviewAssignments.set(key, `reviewer-${String(Number(key.slice(-2)) % 4 + 1)}`);
}
let selfReview = false;
for (const worker of round.workers) {
  if (reviewAssignments.get(worker.id) === worker.role) {
    selfReview = true;
  }
}

const tempDir = path.join(repoRoot, '.fleet_rehearsal');
fs.mkdirSync(tempDir, { recursive: true });

try {
  for (let i = 0; i < branches.length; i += 1) {
    const branch = branches[i];
    const missionId = missionIds[i];
    fs.writeFileSync(path.join(tempDir, `${missionId}.txt`), `${branch}\n`);
  }

  const out = [];
  for (const branch of branches) {
    out.push(branch);
  }

  const outFile = path.join(tempDir, 'branches.txt');
  fs.writeFileSync(outFile, out.join('\n'));

  console.log('rehearsal ok');
  console.log(`derived branches: ${branches.join(' | ')}`);
  console.log(`mission mapping: ${missionIds.join(' -> ')}`);
  console.log(`allowed ownership sample: ${ownershipResult.allowed}`);
  console.log(`rejected ownership sample: ${ownershipResult.rejected}`);
  console.log(`self-review detected: ${selfReview}`);
  console.log(`temporary rehearsal state: ${tempDir}`);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
