import { CENTIPEDE } from '../Breakout_consts.js';

export default class Segment extends Phaser.GameObjects.Sprite {
  constructor(scene, distance) {
    const size = CENTIPEDE.size;
    super(scene, 0, 0, 'centipede');

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    this.distance = distance; // position along the path, in pixels
    this.centipede = null;    // set by Centipede
  }

  placeAt({ x, y }) {
    this.setPosition(x, y);
    this.body.updateFromGameObject();
  }
}

