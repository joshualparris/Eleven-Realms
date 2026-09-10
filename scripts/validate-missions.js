#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { loadRound001, loadRound002, validateRound001, validateReview } from './mission-lib.js';

const round = loadRound001();
const review = loadRound002();
const errors = [];
errors.push(...validateRound001(round));
errors.push(...validateReview(review, round));

if (errors.length) {
  console.error('missions:validate fail');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('missions:validate ok');
console.log(`validated ${round.missions.length} real missions from round-001.json`);
console.log('all required fields present');
console.log('all dependency references exist');
console.log('all review pairs point to a known mission');
console.log('reviewer slot is not the same as worker_slot');
console.log('round-001 contains exactly 11 jobs');
