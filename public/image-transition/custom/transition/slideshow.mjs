import { fragment, vertex } from "./gl.mjs";
import { tween } from "./util.mjs";

const load = (loader, url) => new Promise(resolve => loader.load(url, resolve));
const time = dur => new Promise(resolve => setTimeout(resolve, dur));

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

    const queue = [...sources, sources[0]];
    this.pairs = [];
    this.slides = [];
    // TODO: reduce not while
    while (queue.length) {
      const [from, to] = [queue.shift(), queue[0]];
      if (from && to) this.pairs.push([from, to]);
    }

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
    if(!this.slides[idx]) {
      const pair = this.pairs[idx];
      const [slide] = await Promise.all([this.load(pair), time(this.delay)]);
      this.slides.push(slide);
    }else {
      await time(this.delay);
    }
    this.scene.remove.apply(this.scene, this.scene.children);
    this.scene.add(this.slides[idx].mesh);
    this.current = idx;
    await this.next();
    this.reset(this.current % this.pairs.length)
    this.play((this.current + 1) % this.pairs.length);
  };

  reset = (idx) => this.slides[idx].mat.uniforms.dispFactor.value = 0

  load = async pair => {
    const textures = await Promise.all(pair.map(src => load(this.loader, src)));
    const { geometry, intensity, angle, disp } = this;
    return createSlide(textures, geometry, intensity, angle, disp);
  };

  render = () => this.renderer.render(this.scene, this.camera);

  next = () => {
    const { slides, current, speed, easing, render } = this;
    const { dispFactor } = slides[current].mat.uniforms;
    return tween(dispFactor, 1, speed, easing, render);
  };

  previous = () => {
    const { slides, current, speed, easing, render } = this;
    tween(slides[current].mat.uniforms.dispFactor, 0, speed, easing, render);
  };
}

function createScene({ offsetWidth: ow, offsetHeight: oh }) {
  const scene = new THREE.Scene();
  // camera
  const [l, r, t, b] = [ow / -2, ow / 2, oh / 2, oh / -2];
  const [near, far] = [1, 1000];
  const camera = new THREE.OrthographicCamera(l, r, t, b, near, far);
  camera.position.z = 1;
  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xffffff, 0.0);
  renderer.setSize(ow, oh);
  // return it all
  return [scene, camera, renderer];
}

function createSlide([texture1, texture2], geometry, intensity, angle, disp) {
  texture1.magFilter = texture1.minFilter = THREE.LinearFilter;
  texture2.magFilter = texture2.minFilter = THREE.LinearFilter;

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      intensity1: { type: "f", value: intensity },
      intensity2: { type: "f", value: intensity },
      dispFactor: { type: "f", value: 0.0 },
      angle1: { type: "f", value: angle },
      angle2: { type: "f", value: angle },
      texture1: { type: "t", value: texture1 },
      texture2: { type: "t", value: texture2 },
      disp: { type: "t", value: disp }
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    opacity: 1.0
  });

  const mesh = new THREE.Mesh(geometry, mat);

  return { mat, mesh };
}
