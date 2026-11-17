// Title: Project 3 Prototype
// Authors: Jared Melendez, Max Brockmann, Ava Johnson, Niko Distefano, 
// Citations: 
//
import { GAME } from './Breakout_consts.js';
import SampleScene from './scenes/SampleScene.js'

let config = {
    parent: 'phaser-game',
    type: Phaser.AUTO,
    width: GAME.width,
    height: GAME.height,
    backgroundColor: '#1b1b2f',
    scene: [ SampleScene ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: { 
        default: 'arcade', 
        arcade: { debug: false } 
    },
}
let game = new Phaser.Game(config)