import { BALL, GAME, PADDLE } from '../Breakout_consts.js';

export default class Ball extends Phaser.GameObjects.Arc {
  constructor(scene) {
    super(scene, GAME.width / 2, GAME.height / 2, BALL.radius, 0, 360, false, BALL.color);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCircle(BALL.radius);
    this.body.setBounce(1, 1);
    this.body.setCollideWorldBounds(true);
    this.body.allowGravity = false;

    this.launched = false;
  }

  attachTo(paddle) {
    this.launched = false;
    this.body.reset(
      paddle.body.center.x,
      paddle.y - PADDLE.height / 2 - BALL.radius - 1
    );
  }

  follow(paddle) {
    if (!this.launched) {
      this.x = paddle.x;
    }
  }

  launch() {
    if (this.launched) return;
    this.launched = true;
    // Slight random angle so the first shot isn't always dead straight.
    const angle = Phaser.Math.DegToRad(-90 + Phaser.Math.Between(-20, 20));
    this.body.setVelocity(Math.cos(angle) * BALL.speed, Math.sin(angle) * BALL.speed);
  }

  launchFrom(x, y) {
    this.launched = true;
    this.body.reset(x, y);
    const angle = Phaser.Math.DegToRad(-90 + Phaser.Math.Between(-45, 45));
    this.body.setVelocity(Math.cos(angle) * BALL.speed, Math.sin(angle) * BALL.speed);
  }
  
  bounceOffPaddle(paddle) {
    const offset = paddle.hitOffset(this.x);
    const angle = Phaser.Math.DegToRad(-90 + offset * BALL.maxBounceAngle);
    this.body.setVelocity(Math.cos(angle) * BALL.speed, Math.sin(angle) * BALL.speed);
  }

  isOutOfBounds() {
    return this.y - BALL.radius > GAME.height;
  }
}