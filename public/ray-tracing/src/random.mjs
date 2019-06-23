export function rand(start = 0, end = 1, fn = Math.random) {
  return fn() * (end - start) + start;
}

export function randInt(...args) {
  return Math.floor(rand(...args));
}

export function randCoord(x = [-1, 1], y = [-1, 1], z = [-1, 1]) {
  return { x: rand(...x), y: rand(...y), z: rand(...z) };
}

export function randColor(
  h = randInt(1, 255),
  s = randInt(1, 100),
  l = randInt(1, 100)
) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}
