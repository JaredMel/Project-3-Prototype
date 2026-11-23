import Paddle from '../source/Paddle.js';
import Ball from '../source/Ball.js';
import Centipede from '../source/Centipede.js';
import Mushroom from '../source/Mushroom.js';
import { CENTIPEDE, GAME, PADDLE, MUSHROOM, POWERUP } from '../Breakout_consts.js';

let winLoseConfig = {
  //fontFamily: "arcade",
  fontSize: "48px",
  fill: " #ff0000",
  align: "center",
};

const FIELD_TOP = 20;
const MUSHROOM_SPAWN_CHANCE = 0.05; // 5% chance of spawning a mushroom in each cell

export class Play extends Phaser.Scene {
  constructor() {
    super('playScene');
  }

  create() {
    console.log("Currently on Play Scene")

    // Repeatedly used values
    let centerwidth = GAME.width / 2;
    let centerheight = GAME.height / 2;

    // Let the ball leave through the bottom; every other edge bounces.
    this.physics.world.setBoundsCollision(true, true, true, false);

    // create paddle and ball
    this.paddle = new Paddle(this);

    this.balls = this.add.group();
    // Basic behaviors for the ball and paddle
    this.addBall().attachTo(this.paddle);
    this.path = this.createPath();

    this.segmentGroup = this.physics.add.staticGroup();
    this.mushroomGroup = this.physics.add.staticGroup();
    this.createMap(); // Create the initial map of mushrooms
    this.centipedes = [Centipede.spawn(this, this.path, this.segmentGroup)];

    //PHYSICS COLLISIONS
    this.physics.add.collider(this.balls, this.paddle, (ball) => {
      ball.bounceOffPaddle(this.paddle);
      this.playRandomBounce();
    });
    this.physics.add.collider(this.balls, this.segmentGroup, (ball, segment) => {
      this.hitSegment(segment);
    });
    this.physics.add.collider(this.balls, this.mushroomGroup, (ball, mushroom) => {
      this.hitMushroom(mushroom);
    });


    // Input handling for launching the ball
    this.input.on('pointerdown', () => this.launchBalls());
    this.input.keyboard.on('keydown-SPACE', () => this.launchBalls());


    // UI
    // Score display
    this.score = 0;
    this.scoreText = this.add.text(centerwidth - 10, 10, '00000', { fontSize: '28px', fill: '#ff0000', Align: 'center' }).setOrigin(0.5, 0);

    // Win/Lose screen overlay
    // TODO: Pause the game when the win/lose screen is displayed, and reset the game when the player clicks the reset button.
    this.winloseScreen = this.add.rectangle(centerwidth, centerheight, centerwidth, centerheight, 0x00ff22, 0.5).setOrigin(0.5, 0.5).setVisible(false);
    this.winText = this.add.text(centerwidth, centerheight, 'You Win!', winLoseConfig).setOrigin(0.5, 0.5).setVisible(false);
    this.loseText = this.add.text(centerwidth, centerheight, 'You Lose!', winLoseConfig).setOrigin(0.5, 0.5).setVisible(false);
    this.resetButton = this.makeButton(centerwidth, centerheight + 60, 'Reset', () => { this.scene.restart() }).setVisible(false)
  }

  update(time, delta) {
    this.paddle.update();

    // Check if the ball is out of bounds and reset it if necessary
    for (const ball of this.balls.getChildren().slice()) {
      ball.follow(this.paddle);
      if (!ball.isOutOfBounds()) continue;

      if (this.balls.getLength() > 1) {
        ball.destroy();
      } else {
        ball.attachTo(this.paddle);
        this.sound.play('loss', { volume: 0.5 });
      }
    }

    // CENTIPEDE
    // Update each centipede's position based on the elapsed time
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

  hitSegment(segment) {
    if (segment.isPowerup) this.spawnExtraBall(segment.x, segment.y);

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

  // MUSHROOM HANDLING
  createMushroom(x, y) {
    const mushroom = new Mushroom(this, x, y);
    this.mushroomGroup.add(mushroom);
  }

  // Handle the event when the ball hits a mushroom
  hitMushroom(mushroom) {
    const destroyed = mushroom.destroy();
    this.mushroomGroup.remove(mushroom);

    this.playRandomBounce();
    this.score += MUSHROOM.points;
    this.scoreText.setText(this.score.toString().padStart(5, '0'));
  }

  // Create a grid of mushrooms with a random chance of spawning in each cell
  createMap() {
    const rows = 39; // number of rows in the grid
    const cols = 29; // number of columns in the grid
    let x = 10; // starting x position for the grid
    let y = 50; // starting y position for the grid

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

  // UI Helper Functions
  // changed to make a standard button
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

  // SFX Helper Functions
  playRandomBounce() {
    const bounceSounds = ['bounce1', 'bounce2', 'bounce3', 'bounce4'];
    const randomBounce = bounceSounds[Math.floor(Math.random() * bounceSounds.length)];
    this.sound.play(randomBounce, { volume: 0.5 });
  }
  playHit() {
    this.sound.play('hit', { volume: 0.5 });
  }
}