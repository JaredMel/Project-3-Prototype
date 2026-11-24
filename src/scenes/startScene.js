import { GAME } from '../Breakout_consts.js';

export class Start extends Phaser.Scene {
    constructor() {
        super("startScene")
    }

    // ========================
    // PRELOAD
    // ========================
    preload() {
        //sprites
        this.load.image('mushroom', './assets/mushroom.png');
        this.load.image('centipede', './assets/centipede.png');

        //audio assets
        this.load.audio('click', './assets/sfx/click.wav');
        this.load.audio('hit', './assets/sfx/hit.wav');
        this.load.audio('ball_Loss', './assets/sfx/Loss.wav');
        this.load.audio('bounce1', './assets/sfx/bounce.wav');
        this.load.audio('bounce2', './assets/sfx/bounce2.wav');
        this.load.audio('bounce3', './assets/sfx/bounce3.wav');
        this.load.audio('bounce4', './assets/sfx/bounce4.wav');
    }

    // ========================
    // CREATE
    // ========================
    create() {
        // MENU
        // CSS for the Menu Text
        let menuConfig = {
            fontFamily: "Courier",
            fontSize: "48px",
            color: "#00FF00",
            align: "center",
            padding: { top: 5, bottom: 5 },
            fixedWidth: 0
        }

        let buttonConfig = {
            fontFamily: "Courier",
            color: "#00FF00",
            fontSize: "28px",  
        }

        // display menu text
        this.title = this.add.text(GAME.width / 2, GAME.height / 2 - 100, 'Team 28 - TSA', menuConfig).setOrigin(0.5);
        this.startText = this.add.text(GAME.width / 2, GAME.height / 2 + 50, 'Press SPACE to Start', buttonConfig).setOrigin(0.5);

        //define keys
        this.keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // ========================
    // UPDATE
    // ========================
    update() {
        console.log("Currently on Start Scene")
        if (Phaser.Input.Keyboard.JustDown(this.keySPACE)) {
            this.sound.play('click', { volume: 0.5 });
            this.scene.start('playScene');
            console.log("Switching to Play Scene")
        }
    }
}