import { MUSHROOM } from '../Breakout_consts.js';

const MAX_TRIES = 30;

export default class Mushroom {
  constructor(scene, options) {
    this.scene = scene;
    this.options = options;
    this.timer = null;

    this.isPowerUp = false;
  }

  start() {
    this.stop();
    this.timer = this.scene.time.addEvent({
      delay: this.options.intervalMs,
      loop: true,
      callback: () => this.spawn(),
    });
  }

  stop() {
    if (this.timer) {
      this.timer.remove(false);
      this.timer = null;
    }
  }
  
  spawn() {
    const { cell, origin, cols, rows, maxCount, count, isFree, create } = this.options;
    if (count() >= maxCount) return false;

    for (let i = 0; i < MAX_TRIES; i++) {
      const x = origin.x + Phaser.Math.Between(0, cols - 1) * cell;
      const y = origin.y + Phaser.Math.Between(0, rows - 1) * cell;

      if (isFree(x, y)) {
        create(x, y);
        return true;
      }
    }
    return false;
  }
}