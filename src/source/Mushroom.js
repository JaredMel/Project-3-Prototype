import { MUSHROOM } from '../Breakout_consts.js';

export default class Segment extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y) {
        const size = MUSHROOM.size;
        super(scene, x, y, size - 2, size - 2, MUSHROOM.color);

        scene.add.existing(this);
        scene.physics.add.existing(this, true);
    }
}