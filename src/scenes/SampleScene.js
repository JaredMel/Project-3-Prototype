import { CENTIPEDE, GAME, PADDLE } from '../Breakout_consts.js';
import Paddle from '../source/Paddle.js';
import Ball from '../source/Ball.js';
import Centipede from '../source/Centipede.js';

const FIELD_TOP = 20;

export default class SampleScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    // Let the ball leave through the bottom; every other edge bounces.
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.paddle = new Paddle(this);
    this.ball = new Ball(this);

    this.ball.attachTo(this.paddle);

    this.path = this.createPath();
    this.segmentGroup = this.physics.add.staticGroup();
    this.centipedes = [Centipede.spawn(this, this.path, this.segmentGroup)];

    this.physics.add.collider(this.ball, this.paddle, () => {
      this.ball.bounceOffPaddle(this.paddle);
    });
    this.physics.add.collider(this.ball, this.segmentGroup, (ball, segment) => {
      this.hitSegment(segment);
    });

    this.input.on('pointerdown', () => this.ball.launch());
    this.input.keyboard.on('keydown-SPACE', () => this.ball.launch());
  }

  update(time, delta) {
    this.paddle.update();
    this.ball.follow(this.paddle);

    if (this.ball.isOutOfBounds()) {
      this.ball.attachTo(this.paddle);
    }

    for (const centipede of this.centipedes) {
      centipede.update(delta);
    }

    // Lose when a head reaches the last row of the path.
    if (this.centipedes.some((c) => c.headDistance >= this.path.dangerDistance)) {
      this.scene.restart();
    }
  }

  // Path the centipede will follow
  createPath() {
    const size = CENTIPEDE.size;
    const paddleTop = GAME.height - PADDLE.bottomMargin - PADDLE.height / 2;
    const rows = Math.max(2, Math.floor((paddleTop - FIELD_TOP) / size));
    const xMin = size / 2;
    const xMax = GAME.width - size / 2;

    const points = [];
    for (let r = 0; r < rows; r++) {
      const y = FIELD_TOP + r * size + size / 2;
      const [from, to] = r % 2 === 0 ? [xMin, xMax] : [xMax, xMin];
      points.push({ x: from, y }, { x: to, y });
    }

    const cumulative = [0];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      cumulative.push(cumulative[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
    }
    const length = cumulative[cumulative.length - 1];
    const dangerDistance = cumulative[(rows - 1) * 2]; // start of the last row

    const first = points[0];
    const second = points[1];
    const firstLen = cumulative[1];
    const ux = (second.x - first.x) / firstLen;
    const uy = (second.y - first.y) / firstLen;

    return {
      length,
      dangerDistance,
      pointAt(distance) {
        if (distance <= 0) {
          return { x: first.x + ux * distance, y: first.y + uy * distance };
        }
        if (distance >= length) {
          return { ...points[points.length - 1] };
        }
        let i = 1;
        while (cumulative[i] < distance) i++;
        const a = points[i - 1];
        const b = points[i];
        const t = (distance - cumulative[i - 1]) / (cumulative[i] - cumulative[i - 1]);
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      },
    };
  }

  hitSegment(segment) {
    const centipede = segment.centipede;
    const spawned = centipede.hit(segment);

    if (spawned) this.centipedes.push(spawned);
    if (centipede.isDead) {
      this.centipedes = this.centipedes.filter((c) => c !== centipede);
    }

    if (this.centipedes.length === 0) {
      this.scene.restart(); // all centipedes destroyed
    }
  }
}