import { createScene, createSlide } from "./gl.mjs";
import { tween, load, time, sourcesToPairs } from "./util.mjs";

export default class Slideshow {
  constructor({
    // required
    parent,
    displacement,
    sources = [],
    // optional
    intensity = 1,
    angle = Math.PI / 4,
    speed = 2000,
    easing = "easeOutExpo",
    delay = 1000
  } = {}) {
    this.parent = parent;
    [this.intensity, this.angle] = [intensity, angle];
    [this.speed, this.easing, this.delay] = [speed, easing, delay];
    [this.scene, this.camera, this.renderer] = createScene(parent);
    this.parent.appendChild(this.renderer.domElement);
    this.loader = new THREE.TextureLoader();
    this.disp = this.loader.load(displacement, this.render);
    [this.disp.wrapS, this.disp.wrapT] = [
      THREE.RepeatWrapping,
      THREE.RepeatWrapping
    ];
    const { offsetWidth: ow, offsetHeight: oh } = this.parent;
    this.geometry = new THREE.PlaneBufferGeometry(ow, oh, 1);
    this.pairs = sourcesToPairs(sources);
    this.slides = [];

    window.addEventListener("resize", () =>
      this.renderer.setSize(this.parent.offsetWidth, this.parent.offsetHeight)
    );

    this.current = 0;
    const [pair] = this.pairs; // first set
    this.load(pair)
      .then(slide => {
        this.slides.push(slide);
        this.scene.add(this.slides[this.current].mesh);
        this.render();
        return time(this.delay);
      })
      .then(this.next)
      .then(() => this.play(this.current + 1));
  }

  play = async idx => {
    if (!this.slides[idx]) {
      const pair = this.pairs[idx];
      const [slide] = await Promise.all([this.load(pair), time(this.delay)]);
      this.slides.push(slide);
    } else {
      await time(this.delay);
    }
    this.scene.remove.apply(this.scene, this.scene.children);
    this.scene.add(this.slides[idx].mesh);
    this.current = idx;
    await this.next();
    this.reset(this.current % this.pairs.length);
    this.play((this.current + 1) % this.pairs.length);
  };

  reset = idx => (this.slides[idx].mat.uniforms.dispFactor.value = 0);

  load = async pair => {
    const textures = await Promise.all(pair.map(src => load(this.loader, src)));
    const { geometry, intensity, angle, disp } = this;
    return createSlide(textures, geometry, intensity, angle, disp);
  };

  render = () => this.renderer.render(this.scene, this.camera);
  // loop = () => requestAnimationFrame(() => { this.render(); this.loop() })

  next = () => {
    const { slides, current, speed, easing, render } = this;
    const { dispFactor } = slides[current].mat.uniforms;
    return tween(dispFactor, 1, speed, easing, render);
  };
}
