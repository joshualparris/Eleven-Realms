import type { CanvasRenderer, WorldState } from '../core/contracts.js';

export class GridCanvasRenderer implements CanvasRenderer {
  constructor(private canvas: HTMLCanvasElement) {}

  draw(world: WorldState): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, world.width, world.height);
    ctx.fillStyle = '#07161c';
    ctx.fillRect(0, 0, world.width, world.height);

    const cellWidth = world.width / world.gridWidth;
    const cellHeight = world.height / world.gridHeight;

    for (let y = 0; y < world.gridHeight; y += 1) {
      for (let x = 0; x < world.gridWidth; x += 1) {
        const color = (x + y) % 2 === 0 ? '#102b2e' : '#0c2230';
        ctx.fillStyle = color;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }

    ctx.fillStyle = '#9affb8';
    ctx.fillRect(
      world.player.x * cellWidth + 6,
      world.player.y * cellHeight + 6,
      Math.max(10, cellWidth - 12),
      Math.max(10, cellHeight - 12),
    );

    ctx.strokeStyle = '#d6ffe9';
    ctx.strokeRect(0, 0, world.width, world.height);
  }
}
