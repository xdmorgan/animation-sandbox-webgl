export function getCanvasDimensions(canvas) {
  const [width, height] = [canvas.clientWidth, canvas.clientHeight];
  const needResize = canvas.width !== width || canvas.height !== height;
  const aspect = canvas.clientWidth / canvas.clientHeight;
  return [needResize, { width, height, aspect }];
}
