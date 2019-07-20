import { fragment, vertex } from "./gl.mjs";
import { tween } from "./util.mjs";

const load = (loader, url) => new Promise(resolve => loader.load(url, resolve));

export default function({
  // required
  parent,
  displacement,
  sources = [],
  // optional
  intensity = 1,
  angle = Math.PI / 4,
  speed = 1200,
  easing = "easeOutExpo"
} = {}) {
  const [scene, camera, renderer] = createScene(parent);
  parent.appendChild(renderer.domElement);

  const render = () => renderer.render(scene, camera);

  const loader = new THREE.TextureLoader();
  // loader.crossOrigin = "";
  const disp = loader.load(displacement, render);
  disp.wrapS = disp.wrapT = THREE.RepeatWrapping;

  const geometry = new THREE.PlaneBufferGeometry(
    parent.offsetWidth,
    parent.offsetHeight,
    1
  );

  const queue = [...sources, sources[0]];
  const pairs = [];
  const slides = [];
  // TODO: reduce not while
  while (queue.length) {
    const [from, to] = [queue.shift(), queue[0]];
    if (from && to) pairs.push([from, to]);

    //   // creqte queue from this array of loader.load entries?
    //   const promises = [load(loader, from), load(loader, to)];
    //   Promise.all(promises).then(textures =>
    //     slides.push(createSlide(textures, geometry, intensity, angle, disp))
    //   );
  }

  let current = 0;
  const promises = pairs[0].map(src => load(loader, src));
  Promise.all(promises)
    .then(textures =>
      slides.push(createSlide(textures, geometry, intensity, angle, disp))
    )
    .then(() => {
      scene.add(slides[current].mesh);
      render();
    });
  // console.log(pairs);

  // scene.add(slides[current].mesh);

  window.addEventListener("resize", () =>
    renderer.setSize(parent.offsetWidth, parent.offsetHeight)
  );

  this.next = () =>
    tween(slides[current].mat.uniforms.dispFactor, 1, speed, easing, render);

  this.previous = () =>
    tween(slides[current].mat.uniforms.dispFactor, 0, speed, easing, render);
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
