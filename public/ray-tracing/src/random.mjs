import { toRadian } from "./convert.mjs";

export const rand = (start = 0, end = 1, fn = Math.random) =>
  fn() * (end - start) + start;

export const randInt = (...args) => Math.floor(rand(...args));

export const randCoord = (x = [-1, 1], y = [-1, 1], z = [-1, 1]) => ({
  x: rand(...x),
  y: rand(...y),
  z: rand(...z)
});

export const randDegree = (range = [0, 360]) => rand(...range);

export const randRotation = (x, y, z) => ({
  x: toRadian(randDegree(x)),
  y: toRadian(randDegree(y)),
  z: toRadian(randDegree(z))
});

export const randColor = (
  h = randInt(1, 255),
  s = randInt(1, 100),
  l = randInt(1, 100)
) => `hsl(${h}, ${s}%, ${l}%)`;
