import hoverEffect from "./transition/hover-effect.mjs";
import slideshow from "./transition/slideshow.mjs";

export class App {
  constructor() {
    // window.HOVER_EFFECT = new hoverEffect({
    //   parent: document.querySelector(".demo"),
    //   intensity: 0.1,
    //   // intensity1: 0.1,
    //   // intensity2: 0.1,
    //   // angle2: Math.PI / 2,
    //   image1: "assets/1.jpg",
    //   image2: "assets/2.jpg",
    //   // video: true,
    //   displacementImage: "assets/displacement.jpg"
    // });
    const demo = new slideshow({
      parent: document.querySelector('[data-demo="parent"]'),
      intensity: 0.1,
      sources: [
        "assets/1.jpg",
        "assets/2.jpg",
        "assets/3.jpg",
        "assets/4.jpg",
        "assets/5.jpg"
      ],
      displacement: "assets/displacement.jpg"
    });
    window.SLIDESHOW = demo;
    const $next = document.querySelector('[data-demo="next"]');
    const $previous = document.querySelector('[data-demo="previous"]');
    if ($next) $next.addEventListener("click", demo.next);
    if ($previous) $previous.addEventListener("click", demo.previous);
  }
}

export default App;
