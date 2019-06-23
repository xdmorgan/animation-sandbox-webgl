import { Scene } from "./src/ray-tracing.mjs";

document.addEventListener("DOMContentLoaded", () => {
  new Scene({ canvas: document.querySelector("canvas") });
});
