import { fragment, vertex } from "./gl.mjs";
import { tween } from "./util.mjs";

export default function({
  // required
  parent,
  displacementImage,
  image1,
  image2,
  // optional
  intensity = 1,
  intensity1 = intensity,
  intensity2 = intensity,
  commonAngle = Math.PI / 4,
  angle1 = commonAngle,
  angle2 = -commonAngle * 3,
  speed,
  speedIn = speed || 1600,
  speedOut = speed || 1200,
  userHover = true,
  easing = "easeOutExpo",
  video = false,
  ...opts
} = {}) {
  if (!parent) return console.warn("GLHoverEffect: Parent missing");
  if (!(image1 && image2 && displacementImage)) {
    console.warn("GLHoverEffect: One or more images are missing");
    return;
  }

  const [scene, camera, renderer] = createScene(parent);
  parent.appendChild(renderer.domElement);

  const render = () => renderer.render(scene, camera);
  const animate = () => {
    render();
    requestAnimationFrame(animate);
  };

  const loader = new THREE.TextureLoader();
  // loader.crossOrigin = "";
  const disp = loader.load(displacementImage, render);
  disp.wrapS = disp.wrapT = THREE.RepeatWrapping;

  let texture1, texture2;

  if (video) {
    animate();

    const video = createVideoElement(image1);
    video.load();
    texture1 = new THREE.VideoTexture(video);
    video.addEventListener("loadeddata", video.play, false);

    const video2 = createVideoElement(image2);
    video2.load();
    texture2 = new THREE.VideoTexture(video2);
    video2.addEventListener("loadeddata", video2.play, false);
  } else {
    texture1 = loader.load(image1, render);
    texture2 = loader.load(image2, render);
  }

  texture1.magFilter = texture1.minFilter = THREE.LinearFilter;
  texture2.magFilter = texture2.minFilter = THREE.LinearFilter;

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      intensity1: { type: "f", value: intensity1 },
      intensity2: { type: "f", value: intensity2 },
      dispFactor: { type: "f", value: 0.0 },
      angle1: { type: "f", value: angle1 },
      angle2: { type: "f", value: angle2 },
      texture1: { type: "t", value: texture1 },
      texture2: { type: "t", value: texture2 },
      disp: { type: "t", value: disp }
    },
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    opacity: 1.0
  });

  const geometry = new THREE.PlaneBufferGeometry(
    parent.offsetWidth,
    parent.offsetHeight,
    1
  );

  const mesh = new THREE.Mesh(geometry, mat);
  scene.add(mesh);

  const transitionIn = () =>
    tween(mat.uniforms.dispFactor, 1, speedIn, easing, render);
  const transitionOut = () =>
    tween(mat.uniforms.dispFactor, 0, speedOut, easing, render);

  if (userHover) {
    parent.addEventListener("mouseenter", transitionIn);
    parent.addEventListener("touchstart", transitionIn);
    parent.addEventListener("mouseleave", transitionOut);
    parent.addEventListener("touchend", transitionOut);
  }

  window.addEventListener("resize", () =>
    renderer.setSize(parent.offsetWidth, parent.offsetHeight)
  );

  this.next = transitionIn;
  this.previous = transitionOut;
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

function createVideoElement(src) {
  const v = document.createElement("video");
  [v.autoplay, v.loop, v.muted, v.src] = [true, true, true, src];
  return v;
}
