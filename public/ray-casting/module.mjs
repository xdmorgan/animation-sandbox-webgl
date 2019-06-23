import { Scene } from "./src/ray-casting.mjs";

document.addEventListener("DOMContentLoaded", () => {
  new Scene({ canvas: document.querySelector("canvas") });
});
