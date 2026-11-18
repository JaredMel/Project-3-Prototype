import { CENTIPEDE, GAME, PADDLE, MUSHROOM } from '../Breakout_consts.js';
import Paddle from '../source/Paddle.js';
import Ball from '../source/Ball.js';
import Centipede from '../source/Centipede.js';
import Mushroom from '../source/Mushroom.js';

let winLoseConfig = {
    //fontFamily: "arcade",
    fontSize: "48px",
    fill: " #ff0000",
    align: "center",
};

const FIELD_TOP = 20;
const MUSHROOM_SPAWN_CHANCE = 0.05; // 5% chance of spawning a mushroom in each cell

export default class SampleScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

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

  create() {
    // Repeatedly used values
    let centerwidth = GAME.width / 2;
    let centerheight = GAME.height / 2;
    
    // Let the ball leave through the bottom; every other edge bounces.
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.paddle = new Paddle(this);
    this.ball = new Ball(this);

    this.ball.attachTo(this.paddle);

    this.path = this.createPath();
    this.segmentGroup = this.physics.add.staticGroup();
    this.mushroomGroup = this.physics.add.staticGroup();
    this.centipedes = [Centipede.spawn(this, this.path, this.segmentGroup)];

    this.physics.add.collider(this.ball, this.paddle, () => {
      this.ball.bounceOffPaddle(this.paddle);
      this.playRandomBounce();
    });
    this.physics.add.collider(this.ball, this.segmentGroup, (ball, segment) => {
      this.hitSegment(segment);
    });
    this.physics.add.collider(this.ball, this.mushroomGroup, (ball, mushroom) => {
      this.hitMushroom(mushroom);
    });

    this.input.on('pointerdown', () => this.ball.launch());
    this.input.keyboard.on('keydown-SPACE', () => this.ball.launch());

    this.createMap();
    this.score = 0;
    this.scoreText = this.add.text(centerwidth - 10, 10, '00000', { fontSize: '28px', fill: '#ff0000', Align: 'center' }).setOrigin(0.5, 0);

    // Win/Lose screen overlay and text
    this.winloseScreen = this.add.rectangle(centerwidth, centerheight, centerwidth, centerheight, 0x00ff22, 0.5).setOrigin(0.5, 0.5).setVisible(false);
    this.winText = this.add.text(centerwidth, centerheight, 'You Win!', winLoseConfig).setOrigin(0.5, 0.5).setVisible(false);
    this.loseText = this.add.text(centerwidth, centerheight, 'You Lose!', winLoseConfig).setOrigin(0.5, 0.5).setVisible(false);
    this.resetButton = this.makeButton(centerwidth, centerheight + 60, 'Reset', () => { this.scene.restart() }).setVisible(false)
  }

  update(time, delta) {
    this.paddle.update();
    this.ball.follow(this.paddle);

    if (this.ball.isOutOfBounds()) {
      this.ball.attachTo(this.paddle);
      this.sound.play('ball_Loss', { volume: 0.5 });
    }

    for (const centipede of this.centipedes) {
      centipede.update(delta);
    }

    // Lose when a head reaches the last row of the path.
    if (this.centipedes.some((c) => c.headDistance >= this.path.dangerDistance)) {
      this.physics.pause(); // game over
      this.winloseScreen.setVisible(true);
      this.loseText.setVisible(true);
      this.resetButton.setVisible(true);
    }
  }

  // changed to make a standard button
    makeButton(x, y, label, onClick) {
        const button = this.add.text(x, y, label, { fill: 'rgb(255, 0, 0)' })
            .setFontSize(28)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
        button.on('pointerover', () => button.setColor('#666666')) // when not hovering
        button.on('pointerout', () => button.setColor('#ff0000')) // when hovering
        button.on('pointerdown', () => {this.sound.play('click', { volume: 0.5 });}) // when clicking, play sound
        button.on('pointerdown', onClick)
        return button
    }

  // Path the centipede will follow
  createPath() {
    const size = CENTIPEDE.size;
    const paddleTop = GAME.height - PADDLE.bottomMargin - PADDLE.height / 2;
    const rows = Math.max(2, Math.floor((paddleTop - FIELD_TOP) / size));
    const xMin = size / 2;
    const xMax = GAME.width - size / 2;

    const points = [];
    for (let r = 0; r < rows; r++) {
      const y = FIELD_TOP + r * size + size / 2;
      const [from, to] = r % 2 === 0 ? [xMin, xMax] : [xMax, xMin];
      points.push({ x: from, y }, { x: to, y });
    }

    const cumulative = [0];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      cumulative.push(cumulative[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
    }
    const length = cumulative[cumulative.length - 1];
    const dangerDistance = cumulative[(rows - 1) * 2]; // start of the last row

    const first = points[0];
    const second = points[1];
    const firstLen = cumulative[1];
    const ux = (second.x - first.x) / firstLen;
    const uy = (second.y - first.y) / firstLen;

    return {
      length,
      dangerDistance,
      pointAt(distance) {
        if (distance <= 0) {
          return { x: first.x + ux * distance, y: first.y + uy * distance };
        }
        if (distance >= length) {
          return { ...points[points.length - 1] };
        }
        let i = 1;
        while (cumulative[i] < distance) i++;
        const a = points[i - 1];
        const b = points[i];
        const t = (distance - cumulative[i - 1]) / (cumulative[i] - cumulative[i - 1]);
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      },
    };
  }

  hitSegment(segment) {
    const centipede = segment.centipede;
    const spawned = centipede.hit(segment);

    if (spawned) this.centipedes.push(spawned);
    if (centipede.isDead) {
      this.centipedes = this.centipedes.filter((c) => c !== centipede);
    }

    if (this.centipedes.length === 0) {
      this.physics.pause(); // all centipedes destroyed
      this.winloseScreen.setVisible(true);
      this.winText.setVisible(true);
      this.resetButton.setVisible(true);
      this.score += 100; // bonus for clearing all centipedes
    }
    this.playHit();
    this.score += CENTIPEDE.points;
    this.scoreText.setText(this.score.toString().padStart(5, '0'));
  }

  createMushroom(x, y) {
    const mushroom = this.add.sprite(x, y, 'mushroom');
    this.mushroomGroup.add(mushroom);
  }

  hitMushroom(mushroom) {
    const destroyed = mushroom.destroy();
    this.mushroomGroup.remove(mushroom);

    this.playRandomBounce();
    this.score += MUSHROOM.points;
    this.scoreText.setText(this.score.toString().padStart(5, '0'));
  }

  createMap() {
    // Create a grid of mushrooms with random placement
    const rows = 40;
    const cols = 29;
    let x = 10;
    let y = 30;
    let map = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < MUSHROOM_SPAWN_CHANCE) {
          map[r][c] = true;
          this.createMushroom(x, y);
        }
        x += 20;
      }
      y += 20;
      x = 10;
    }
  }

  playRandomBounce() {
    const bounceSounds = ['bounce1', 'bounce2', 'bounce3', 'bounce4'];
    const randomBounce = bounceSounds[Math.floor(Math.random() * bounceSounds.length)];
    this.sound.play(randomBounce, { volume: 0.5 });
  }
  playHit() {
    this.sound.play('hit', { volume: 0.5 });
  }
}