import { MUSHROOM } from '../Breakout_consts.js';

export default class Segment extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        const size = MUSHROOM.size;
        super(scene, x, y, 'mushroom'); // load sprite from the 'mushroom' texture
        this.setTint(MUSHROOM.color); // set the tint color to the mushroom color

        scene.add.existing(this);
        scene.physics.add.existing(this, true);
    }
}