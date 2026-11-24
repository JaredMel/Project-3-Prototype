import { CENTIPEDE, GAME, PLAYER, MUSHROOM, BALL, POWERUP } from '../Breakout_consts.js';
import Player from '../source/Player.js';
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
const MUSHROOM_SPAWN_CHANCE = 0.025; // 2.5% chance of spawning a mushroom in each cell

export class Play extends Phaser.Scene {
  constructor() {
    super('playScene');
  }

  create() {
    console.log("Currently on Play Scene");

    // Repeatedly used values
    let centerwidth = GAME.width / 2;
    let centerheight = GAME.height / 2;

    // Let the ball leave through the bottom; every other edge bounces.
    this.physics.world.setBoundsCollision(true, true, true, true);

    this.mushroomGroup = this.physics.add.staticGroup();

    // Player
    const half = CENTIPEDE.size / 2;
    this.playerGroup = this.physics.add.staticGroup();
    this.player = new Player(
      this,
      this.playerGroup,
      { x: GAME.width / 2, y: GAME.height - PLAYER.bottomMargin },
      { minX: half, maxX: GAME.width - half, minY: half, maxY: GAME.height - half },
      this.mushroomGroup
    );
    this.segmentGroup = this.physics.add.staticGroup();

    // Enemy
    this.balls = this.add.group();
    this.ball = this.addBall();
    this.time.delayedCall(BALL.startDelayMs, () => this.ball.launch());

    this.physics.add.collider(this.balls, this.playerGroup, (ball, segment) => {
      ball.bounceOff(segment);
      this.playerHit();
    });

    // ========================
    // PHYSICS COLLISIONS
    // ========================
    this.physics.add.collider(this.balls, this.segmentGroup, (ball, segment) => {
      this.hitSegment(segment);
    });
    this.physics.add.collider(this.balls, this.mushroomGroup, (ball, mushroom) => {
      this.hitMushroom(mushroom);
    });

    // this.input.on('pointerdown', () => this.ball.launch());
    // this.input.keyboard.on('keydown-SPACE', () => this.ball.launch());

    // Create the map of mushrooms
    this.createMap();

    // ========================
    //UI
    // ========================
    this.score = 0;
    this.scoreText = this.add.text(centerwidth - 10, 10, '00000', { fontSize: '28px', fill: '#ff0000', Align: 'center' }).setOrigin(0.5, 0);

    // Win/Lose screen overlay and text
    this.winloseScreen = this.add.rectangle(centerwidth, centerheight, centerwidth, centerheight, 0x00ff22, 0.5).setOrigin(0.5, 0.5).setVisible(false);
    this.winText = this.add.text(centerwidth, centerheight, 'You Win!', winLoseConfig).setOrigin(0.5, 0.5).setVisible(false);
    this.loseText = this.add.text(centerwidth, centerheight, 'You Lose!', winLoseConfig).setOrigin(0.5, 0.5).setVisible(false);
    this.resetButton = this.makeButton(centerwidth, centerheight + 60, 'Reset', () => { this.scene.restart() }).setVisible(false)

    this.mushroomSpawner = new Mushroom(this, {
      cell: CENTIPEDE.size,
      origin: { x: CENTIPEDE.size / 2, y: FIELD_TOP + CENTIPEDE.size / 2 },
      cols: Math.floor(GAME.width / CENTIPEDE.size),
      rows: Math.floor((GAME.height - FIELD_TOP) / CENTIPEDE.size),
      intervalMs: MUSHROOM.spawnMs,
      maxCount: MUSHROOM.maxCount,
      count: () => this.mushroomGroup.getLength(),
      isFree: (x, y) => this.isMushroomSpotFree(x, y),
      create: (x, y) => this.createMushroom(x, y),
    });
    this.mushroomSpawner.start();
  }

  update(time, delta) {
    this.player.update(delta);
  }

  // Standard Button
  makeButton(x, y, label, onClick) {
    const button = this.add.text(x, y, label, { fill: 'rgb(255, 0, 0)' })
      .setFontSize(28)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    button.on('pointerover', () => button.setColor('#666666')) // when not hovering
    button.on('pointerout', () => button.setColor('#ff0000')) // when hovering
    button.on('pointerdown', () => { this.sound.play('click', { volume: 0.5 }); }) // when clicking, play sound
    button.on('pointerdown', onClick)
    return button
  }


  //========================
  // GAME FUNCTIONS
  //======================== 
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

  createMushroom(x, y, randomPowerUp) {
    // default mushroom
    const mushroom = this.add.sprite(x, y, 'mushroom');
    mushroom.setTint(MUSHROOM.color);

    // power-up mushroom
    randomPowerUp = Phaser.Math.Between(0, 10);
    if (randomPowerUp < 2) {
      mushroom.setData('isPowerUp', true);
      mushroom.setTint(POWERUP.color);
    }
    this.mushroomGroup.add(mushroom);

  }

  isMushroomSpotFree(x, y) {
    const clear = CENTIPEDE.size * 1.5;
    const near = (o) => Math.abs(o.x - x) < clear && Math.abs(o.y - y) < clear;
    return !this.mushroomGroup.getChildren().some((m) => Math.abs(m.x - x) < 1 && Math.abs(m.y - y) < 1)
      && !this.player.segments.some(near)
      && !near(this.ball);
  }

  hitMushroom(mushroom) {
    if (mushroom.getData('isPowerUp')) {
      if (this.balls.getLength() < 5) {
        this.addBall();
        this.launchBalls();
        this.ball.count += 1;
      }
    }
    const destroyed = mushroom.destroy();
    this.mushroomGroup.remove(mushroom);

    this.playRandomBounce();
    this.scoreText.setText(this.score.toString().padStart(5, '0'));
  }

  createMap() {
    // Create a grid of mushrooms with random placement
    const rows = 40;
    const cols = 29;
    let x = 10;
    let y = 30;
    let randomPowerUp = 0;
    let map = Array.from({ length: rows }, () => Array.from({ length: cols }, () => false));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < MUSHROOM_SPAWN_CHANCE) {
          map[r][c] = true;
          this.createMushroom(x, y, randomPowerUp);
        }
        x += 20;
      }
      y += 20;
      x = 10;
    }
  }

  playerHit() {
    if (this.player.invulnerable) return;
    this.player.startGrace();
    if (!this.player.loseBlock()) {
      this.scene.restart();
    }
  }

  addBall() {
    const ball = new Ball(this);
    this.balls.add(ball);
    return ball;
  }

  launchBalls() {
    this.balls.getChildren().forEach((ball) => ball.launch());
  }

  spawnExtraBall(x, y) {
    if (this.balls.getLength() >= POWERUP.maxBalls) return;
    this.time.delayedCall(0, () => this.addBall().launchFrom(x, y));
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