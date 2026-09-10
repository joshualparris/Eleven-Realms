import { createWorld, movePlayer, stepWorld } from '../src/core/world.js';

const world = createWorld(7);
const plan = ['east', 'south', 'west', 'north'] as const;

for (const action of plan) {
  stepWorld(world, action);
}

const expected = { x: 2, y: 2 };
if (world.player.x !== expected.x || world.player.y !== expected.y) {
  console.error('smoke fail: player state drifted');
  process.exit(1);
}

if (world.tick !== 4) {
  console.error(`smoke fail: tick ${world.tick} should be 4`);
  process.exit(1);
}

if (world.log.length < 1 || world.log[0].length < 4) {
  console.error('smoke fail: event log invalid');
  process.exit(1);
}

console.log('smoke ok');
console.log(`seed=${world.seed} tick=${world.tick} player=${world.player.x},${world.player.y}`);
