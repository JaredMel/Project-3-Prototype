import { PADDLE, GAME } from '../Breakout_consts.js';

export default class Paddle extends Phaser.GameObjects.Rectangle {
  constructor(scene) {
    super(
      scene,
      GAME.width / 2,
      GAME.height - PADDLE.bottomMargin,
      PADDLE.width,
      PADDLE.height,
      PADDLE.color
    );

    scene.add.existing(this);
    scene.physics.add.existing(this); // dynamic body, configured below

    this.body.setImmovable(true);
    this.body.setCollideWorldBounds(true);
    this.body.allowGravity = false;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.speed = 520;

    // Mouse / touch control
    scene.input.on('pointermove', (pointer) => this.moveTo(pointer.x));
  }

  moveTo(x) {
    const half = this.width / 2;
    this.x = Phaser.Math.Clamp(x, half, GAME.width - half);
    this.body.updateFromGameObject();
  }

  update() {
    const { left, right } = this.cursors;
    if (left.isDown) {
      this.body.setVelocityX(-this.speed);
    } else if (right.isDown) {
      this.body.setVelocityX(this.speed);
    } else {
      this.body.setVelocityX(0);
    }
  }

  hitOffset(x) {
    return Phaser.Math.Clamp((x - this.x) / (this.width / 2), -1, 1);
  }
}