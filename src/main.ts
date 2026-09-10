import './style.css';
import { createWorld, stepWorld } from './core/world.js';
import { GridCanvasRenderer } from './render/canvasRenderer.js';

const world = createWorld(1);
const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
const eventLog = document.querySelector<HTMLUListElement>('#event-log');
const tickReadout = document.querySelector<HTMLElement>('#tick-readout');
const seedReadout = document.querySelector<HTMLElement>('#seed-readout');
const questText = document.querySelector<HTMLElement>('#quest-text');

if (!canvas) {
  throw new Error('Canvas element #game-canvas is required.');
}

const renderer = new GridCanvasRenderer(canvas);
renderer.draw(world);

if (seedReadout) {
  seedReadout.textContent = `seed: ${world.seed}`;
}

if (tickReadout) {
  tickReadout.textContent = `tick: ${world.tick}`;
}

if (questText) {
  questText.textContent = 'Find the first gate.';
}

if (eventLog) {
  eventLog.innerHTML = '';
  for (const item of world.log) {
    const li = document.createElement('li');
    li.textContent = item;
    eventLog.appendChild(li);
  }
}

window.addEventListener('keydown', (event) => {
  const direction = {
    ArrowUp: 'north',
    ArrowDown: 'south',
    ArrowLeft: 'west',
    ArrowRight: 'east',
  }[event.key] as string | undefined;

  if (!direction) {
    return;
  }

  const next = stepWorld(world, direction as 'north' | 'south' | 'east' | 'west');
  renderer.draw(next);

  if (tickReadout) {
    tickReadout.textContent = `tick: ${next.tick}`;
  }

  if (eventLog) {
    eventLog.innerHTML = '';
    for (const item of next.log) {
      const li = document.createElement('li');
      li.textContent = item;
      eventLog.appendChild(li);
    }
  }
});
