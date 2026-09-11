import type { Direction, WorldState, Entity } from './contracts.js';
import { DeterministicRng } from './rng.js';

export const GRID_WIDTH = 16;
export const GRID_HEIGHT = 12;
export const MAX_HEALTH = 3;

export function createWorld(seed = 1, score = 0, inventory: string[] = [], health = MAX_HEALTH): WorldState {
  const rng = new DeterministicRng(seed);
  
  const walls: boolean[][] = [];
  const discovered: boolean[][] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    walls[y] = [];
    discovered[y] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      const isStart = Math.abs(x - 2) <= 1 && Math.abs(y - 2) <= 1;
      const isEnd = Math.abs(x - 14) <= 1 && Math.abs(y - 10) <= 1;
      walls[y][x] = (!isStart && !isEnd && rng.int(0, 100) < 25);
      discovered[y][x] = false;
    }
  }

  const entities: Entity[] = [
    { id: 'gate-1', type: 'gate', x: 14, y: 10, collected: false },
    { id: 'key-1', type: 'key', x: rng.int(4, 13), y: rng.int(4, 9), collected: false },
    { id: 'enemy-1', type: 'enemy', x: rng.int(8, 15), y: rng.int(0, 5), collected: false },
    { id: 'enemy-2', type: 'enemy', x: rng.int(0, 8), y: rng.int(6, 11), collected: false },
  ];
  
  for (let i = 0; i < 6; i++) {
    let cx = rng.int(0, GRID_WIDTH - 1);
    let cy = rng.int(0, GRID_HEIGHT - 1);
    if (!walls[cy][cx]) {
      entities.push({ id: `coin-${i}`, type: 'coin', x: cx, y: cy, collected: false });
    }
  }

  const state: WorldState = {
    seed,
    tick: 0,
    width: 640,
    height: 480,
    gridWidth: GRID_WIDTH,
    gridHeight: GRID_HEIGHT,
    player: { x: 2, y: 2 },
    entities,
    walls,
    discovered,
    inventory,
    score,
    health,
    maxHealth: MAX_HEALTH,
    relicsFound: 0,
    questCompleted: false,
    gameOver: false,
    log: [`Realm ${seed} entrance opens.`],
  };
  updateVisibility(state);
  return state;
}

export function movePlayer(world: WorldState, direction: Direction): WorldState {
  if (world.questCompleted || world.gameOver) {
    return world;
  }

  const delta = {
    north: { x: 0, y: -1 },
    south: { x: 0, y: 1 },
    east: { x: 1, y: 0 },
    west: { x: -1, y: 0 },
  }[direction];

  let nextX = Math.max(0, Math.min(world.gridWidth - 1, world.player.x + delta.x));
  let nextY = Math.max(0, Math.min(world.gridHeight - 1, world.player.y + delta.y));

  if (world.walls[nextY][nextX]) {
    nextX = world.player.x;
    nextY = world.player.y;
  }

  // Check gate lock
  const gate = world.entities.find(e => e.type === 'gate' && e.x === nextX && e.y === nextY);
  if (gate && !world.inventory.includes('key')) {
    nextX = world.player.x;
    nextY = world.player.y;
    world.log = ['The gate is locked! Find a key.'].concat(world.log).slice(0, 4);
    return world;
  }

  world.player.x = nextX;
  world.player.y = nextY;
  world.tick += 1;

  let newLogs = [`Realm signal: ${direction} tick ${world.tick}`];

  for (const entity of world.entities) {
    if (!entity.collected && entity.x === nextX && entity.y === nextY) {
      if (entity.type === 'coin') {
        entity.collected = true;
        world.score += 10;
        newLogs.unshift('You found a coin!');
      } else if (entity.type === 'key') {
        entity.collected = true;
        world.inventory.push('key');
        newLogs.unshift('You found a Key! The gate is unlocked.');
      } else if (entity.type === 'gate') {
        newLogs.unshift('You passed through the gate!');
        // Generate new level and return entirely new world state!
        return createWorld(world.seed + 1, world.score, [], world.health);
      }
    }
  }

  // Move enemies
  for (const entity of world.entities) {
    if (entity.type === 'enemy' && !entity.collected) {
      let ex = entity.x;
      let ey = entity.y;
      if (Math.abs(world.player.x - ex) > Math.abs(world.player.y - ey)) {
        ex += world.player.x > ex ? 1 : -1;
      } else {
        ey += world.player.y > ey ? 1 : -1;
      }
      
      if (!world.walls[ey][ex]) {
        entity.x = ex;
        entity.y = ey;
      }

      if (entity.x === world.player.x && entity.y === world.player.y) {
        world.health = Math.max(0, world.health - 1);
        newLogs.unshift(`An enemy struck you! Health ${world.health}/${world.maxHealth}.`);
        if (world.health === 0) {
          world.gameOver = true;
          newLogs.unshift('The realm claimed you. Restart to try again.');
        }
      }
    }
  }

  world.log = newLogs.concat(world.log).slice(0, 4);

  updateVisibility(world);
  return world;
}

export function stepWorld(world: WorldState, direction: Direction): WorldState {
  return movePlayer(world, direction);
}

export function updateVisibility(world: WorldState) {
  for (let y = 0; y < world.gridHeight; y++) {
    for (let x = 0; x < world.gridWidth; x++) {
      const dx = x - world.player.x;
      const dy = y - world.player.y;
      if (Math.sqrt(dx * dx + dy * dy) <= 4.5) {
        world.discovered[y][x] = true;
      }
    }
  }
}
