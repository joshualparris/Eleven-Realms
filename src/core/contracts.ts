export type Direction = 'north' | 'south' | 'east' | 'west';

export interface PlayerState {
  x: number;
  y: number;
}

export interface WorldState {
  seed: number;
  tick: number;
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  player: PlayerState;
  log: string[];
}

export interface CanvasRenderer {
  draw(world: WorldState): void;
}
