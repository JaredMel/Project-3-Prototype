// Title: Project 3 Prototype
// Authors: Jared Melendez, Max Brockmann, Ava Johnson, Sophia Aguado
// Citations: 
//
import { GAME } from './Breakout_consts.js';
import { Start } from './scenes/startScene.js';
import { Play } from './scenes/playScene.js';

let config = {
    parent: 'phaser-game',
    type: Phaser.AUTO,
    width: GAME.width,
    height: GAME.height,
    backgroundColor: '#1b1b2f',
    scene: [ Start, Play ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: { 
        default: 'arcade', 
        arcade: { debug: false } 
    },
}
let game = new Phaser.Game(config);