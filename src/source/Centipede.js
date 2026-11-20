//import { CENTIPEDE } from '../Breakout_consts.js';
import Segment from './Segment.js';
import { CENTIPEDE, POWERUP } from '../Breakout_consts.js';

export default class Centipede {
  constructor(scene, path, segments) {
    this.scene = scene;
    this.path = path;
    this.segments = segments; // index 0 is the head
    segments.forEach((s) => (s.centipede = this));
    this.place();
  }

  static spawn(scene, path, group, length = CENTIPEDE.length) {
    const segments = [];
    for (let i = 0; i < length; i++) {
      const segment = new Segment(scene, -i * CENTIPEDE.size); // body trails off the start
      group.add(segment);
      segments.push(segment);
    }
    const picks = Phaser.Utils.Array.Shuffle([...segments]).slice(0, POWERUP.perCentipede);
    picks.forEach((s) => s.makePowerup());
    return new Centipede(scene, path, segments);
  }

  get head() {
    return this.segments[0];
  }

  get headDistance() {
    return this.segments.length ? this.head.distance : -Infinity;
  }

  get isDead() {
    return this.segments.length === 0;
  }

  update(delta) {
    const step = (CENTIPEDE.speed * delta) / 1000;
    for (const segment of this.segments) segment.distance += step;
    this.place();
  }

  place() {
    for (const segment of this.segments) {
      segment.placeAt(this.path.pointAt(segment.distance));
    }
  }

  hit(segment) {
    const index = this.segments.indexOf(segment);
    if (index === -1) return null;

    const behind = this.segments.slice(index + 1);
    this.segments = this.segments.slice(0, index);
    segment.destroy();

    return behind.length > 0 ? new Centipede(this.scene, this.path, behind) : null;
  }
}