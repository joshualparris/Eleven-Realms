export type Direction = 'north' | 'south' | 'east' | 'west';

export interface PlayerState {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: 'coin' | 'relic' | 'gate' | 'hazard' | 'key' | 'enemy';
  x: number;
  y: number;
  collected?: boolean;
}

export interface WorldState {
  seed: number;
  tick: number;
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  player: PlayerState;
  entities: Entity[];
  walls: boolean[][];
  discovered: boolean[][];
  inventory: string[];
  score: number;
  health: number;
  maxHealth: number;
  relicsFound: number;
  questCompleted: boolean;
  gameOver: boolean;
  log: string[];
}

export interface CanvasRenderer {
  draw(world: WorldState): void;
}
