import type { Direction, WorldState } from './contracts.js';

export const GRID_WIDTH = 16;
export const GRID_HEIGHT = 12;

export function createWorld(seed = 1): WorldState {
  return {
    seed,
    tick: 0,
    width: 640,
    height: 480,
    gridWidth: GRID_WIDTH,
    gridHeight: GRID_HEIGHT,
    player: { x: 2, y: 2 },
    log: ['Entrance opens.'],
  };
}

export function movePlayer(world: WorldState, direction: Direction): WorldState {
  const delta = {
    north: { x: 0, y: -1 },
    south: { x: 0, y: 1 },
    east: { x: 1, y: 0 },
    west: { x: -1, y: 0 },
  }[direction];

  const nextX = Math.max(0, Math.min(world.gridWidth - 1, world.player.x + delta.x));
  const nextY = Math.max(0, Math.min(world.gridHeight - 1, world.player.y + delta.y));

  world.player.x = nextX;
  world.player.y = nextY;
  world.tick += 1;
  world.log = [`Realm signal: ${direction} tick ${world.tick}`].concat(world.log).slice(0, 4);

  return world;
}

export function stepWorld(world: WorldState, direction: Direction): WorldState {
  return movePlayer(world, direction);
}
