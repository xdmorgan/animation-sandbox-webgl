import { App } from "./src/tutorial.mjs";

document.addEventListener("DOMContentLoaded", () => {
  const app = new App({ canvas: document.querySelector("canvas") });
  app.start();
});
