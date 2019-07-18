import hoverEffect from "./transition/transition.mjs";

export class App {
  constructor() {
    window.HOVER_EFFECT = new hoverEffect({
      parent: document.querySelector(".demo"),
      intensity: 0.1,
      // intensity1: 0.1,
      // intensity2: 0.1,
      // angle2: Math.PI / 2,
      image1: "assets/1.jpg",
      image2: "assets/2.jpg",
      // video: true,
      displacementImage: "assets/displacement.jpg"
    });
  }
}

export default App;
