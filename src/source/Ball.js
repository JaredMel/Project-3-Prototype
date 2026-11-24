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

  // attachTo(anchor) {
  //   this.launched = false;
  //   this.body.reset(
  //     anchor.body.center.x,
  //     anchor.y - PADDLE.height / 2 - BALL.radius - 1
  //   );
  // }

  // follow(paddle) {
  //   if (!this.launched) {
  //     this.x = paddle.x;
  //   }
  // }

  // sitOn(anchor) {
  //   const { x, y } = anchor.ballAnchor();
  //   this.body.reset(x + ATTACH_OFFSET_X, y - BALL.radius - 1);
  // }

  launch() {
    const angle = Phaser.Math.DegToRad(Phaser.Math.Between(30, 150)); // 90 = straight down
    this.body.setVelocity(Math.cos(angle) * BALL.speed, Math.sin(angle) * BALL.speed);
  }

  // bounceOffPaddle(paddle) {
  //   const offset = paddle.hitOffset(this.x);
  //   const angle = Phaser.Math.DegToRad(-90 + offset * BALL.maxBounceAngle);
  //   this.body.setVelocity(Math.cos(angle) * BALL.speed, Math.sin(angle) * BALL.speed);
  // }

  // isOutOfBounds() {
  //   return this.y - BALL.radius > GAME.height;
  // }

  bounceOff(target) {
    let dx = this.x - target.x;
    let dy = this.y - target.y;
    const length = Math.hypot(dx, dy) || 1;
    dx /= length;
    dy /= length;

    if (Math.abs(dy) < BALL.minVertical) {
      dy = (dy < 0 ? -1 : 1) * BALL.minVertical;
      dx = (dx < 0 ? -1 : 1) * Math.sqrt(1 - dy * dy);
    }
    this.body.setVelocity(dx * BALL.speed, dy * BALL.speed);
  }
}