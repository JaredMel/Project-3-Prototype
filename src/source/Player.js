import { CENTIPEDE, PLAYER } from '../Breakout_consts.js';
import Segment from './Segment.js';

const TRAIL_STEP = 2;
const MAX_STEP = 4;
const HEAD_BOX = CENTIPEDE.size - 4;

export default class Player {
  constructor(scene, group, start, bounds, obstacles = null) {
    this.scene = scene;
    this.bounds = bounds;
    this.obstacles = obstacles;
    this.keys = scene.input.keyboard.addKeys({
      up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT',
      w: 'W', a: 'A', s: 'S', d: 'D',
    });
    this.graceLeft = 0;

    this.trail = [];
    for (let k = 0; k <= PLAYER.length * CENTIPEDE.size; k += TRAIL_STEP) {
      this.trail.push({ x: start.x - k, y: start.y });
    }

    this.segments = []; // index 0 is the head
    for (let i = 0; i < PLAYER.length; i++) {
      const segment = new Segment(scene, 0, PLAYER.color);
      group.add(segment);
      this.segments.push(segment);
    }
    this.place();
  }

  get head() {
    return this.segments[0];
  }

  get invulnerable() {
    return this.graceLeft > 0;
  }

  update(delta) {
    const k = this.keys;
    const dx = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0);
    const dy = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0);

    if (dx || dy) {
      const distance = (PLAYER.speed * delta) / 1000;
      const steps = Math.max(1, Math.ceil(distance / MAX_STEP));
      const reach = distance / steps / Math.hypot(dx, dy);
      for (let i = 0; i < steps; i++) {
        this.moveHead(dx * reach, dy * reach);
      }
    }
    this.place();

    // Blink while invulnerable.
    this.graceLeft = Math.max(0, this.graceLeft - delta);
    const alpha = this.invulnerable && Math.floor(this.graceLeft / 100) % 2 ? 0.3 : 1;
    this.segments.forEach((s) => s.setAlpha(alpha));
  }

  moveHead(mx, my) {
    const head = this.trail[0];
    const x = Phaser.Math.Clamp(head.x + mx, this.bounds.minX, this.bounds.maxX);
    const y = Phaser.Math.Clamp(head.y + my, this.bounds.minY, this.bounds.maxY);

    if (this.canStand(head, x, y)) {
      head.x = x;
      head.y = y;
    } else if (this.canStand(head, x, head.y)) {
      head.x = x;
    } else if (this.canStand(head, head.x, y)) {
      head.y = y;
    }
    this.recordTrail();
  }

  canStand(from, x, y) {
    if (!this.obstacles) return true;
    const r = HEAD_BOX / 2;
    const overlaps = (right, up, b) =>
      right+ r > b.left && right - r < b.right && up + r > b.top && up - r < b.bottom;

    for (const obstacle of this.obstacles.getChildren()) {
      const b = obstacle.body;
      if (b && overlaps(x, y, b) && !overlaps(from.x, from.y, b)) return false;
    }
    return true;
  }

  startGrace() {
    this.graceLeft = PLAYER.graceMs;
  }

  loseBlock() {
    if (this.segments.length <= 1) return false;
    this.segments.pop().destroy();
    return true;
  }

  recordTrail() {
    const [head, last] = this.trail;
    if (Math.hypot(head.x - last.x, head.y - last.y) >= TRAIL_STEP) {
      this.trail.unshift({ x: head.x, y: head.y });
    }
    this.trimTrail();
  }

  trimTrail() {
    const needed = this.segments.length * CENTIPEDE.size;
    let along = 0;
    for (let i = 1; i < this.trail.length; i++) {
      along += Math.hypot(this.trail[i].x - this.trail[i - 1].x, this.trail[i].y - this.trail[i - 1].y);
      if (along > needed) {
        this.trail.length = i + 1;
        return;
      }
    }
  }

  place() {
    this.segments.forEach((segment, i) => {
      segment.placeAt(this.pointBack(i * CENTIPEDE.size));
    });
  }

  pointBack(distance) {
    const trail = this.trail;
    for (let i = 1; i < trail.length; i++) {
      const length = Math.hypot(trail[i].x - trail[i - 1].x, trail[i].y - trail[i - 1].y);
      if (distance <= length) {
        const f = length ? distance / length : 0;
        return { x: trail[i - 1].x + (trail[i].x - trail[i - 1].x) * f, y: trail[i - 1].y + (trail[i].y - trail[i - 1].y) * f };
      }
      distance -= length;
    }
    return { x: trail[trail.length - 1].x, y: trail[trail.length - 1].y };
  }
}