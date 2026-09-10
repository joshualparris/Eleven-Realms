import { describe, expect, it } from 'vitest';
import { createWorld, movePlayer, stepWorld } from '../src/core/world.js';

describe('world contract', () => {
  it('creates a deterministic baseline world', () => {
    const world = createWorld(1);
    expect(world.seed).toBe(1);
    expect(world.tick).toBe(0);
    expect(world.gridWidth).toBe(16);
    expect(world.gridHeight).toBe(12);
    expect(world.player).toEqual({ x: 2, y: 2 });
  });

  it('moves the player and increments the tick deterministically', () => {
    const world = createWorld(1);
    const next = stepWorld(world, 'east');
    expect(next.player).toEqual({ x: 3, y: 2 });
    expect(next.tick).toBe(1);
    expect(next.log[0]).toContain('east');
  });

  it('clips movement to the grid boundary', () => {
    const world = createWorld(1);
    world.player = { x: 15, y: 11 };
    const next = movePlayer(world, 'east');
    expect(next.player).toEqual({ x: 15, y: 11 });
  });
});
