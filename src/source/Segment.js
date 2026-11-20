import { CENTIPEDE, POWERUP } from '../Breakout_consts.js';

export default class Segment extends Phaser.GameObjects.Sprite {
  constructor(scene, distance) {
    const size = CENTIPEDE.size;
    super(scene, 0, 0, 'centipede'); // load sprite from the 'centipede-segment' texture
    this.setTint(CENTIPEDE.color); // set the tint color to the centipede color

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.distance = distance; // position along the path, in pixels
    this.centipede = null;    // set by Centipede
    this.isPowerup = false;
    this.flashTimer = null;
  }

  makePowerup() {
    if (this.isPowerup) return;
    this.isPowerup = true;
    this.setFillStyle(POWERUP.color);

    let blue = true;
    this.flashTimer = this.scene.time.addEvent({
      delay: POWERUP.flashMs,
      loop: true,
      callback: () => {
        blue = !blue;
        this.setFillStyle(blue ? POWERUP.color : CENTIPEDE.color);
      },
    });
  }

  placeAt({ x, y }) {
    this.setPosition(x, y);
    this.body.updateFromGameObject();
  }

  destroy(fromScene) {
    if (this.flashTimer) {
      this.flashTimer.remove();
      this.flashTimer = null;
    }
    super.destroy(fromScene);
  }
}

