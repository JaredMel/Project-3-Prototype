// Central place for tunable values so game objects don't hardcode numbers.
export const GAME = {
  width: 600,
  height: 900,
};

export const PADDLE = {
  width: 110,
  height: 16,
  bottomMargin: 40,
  color: 0x4fc3f7,
};

export const BALL = {
  radius: 8,
  speed: 360,
  color: 0xffe700,
  maxBounceAngle: 60, // max + or - degrees from vertical when hitting paddle edge
};

export const CENTIPEDE = {
  size: 25,        // segment size in px
  length: 16,      // segments in the first centipede
  speed: 220,      // pixels per second along the path
  color: 0xf000ff, // this is easily replacible with sprites
};
