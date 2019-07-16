// import * as THREE from "three";
// import TweenMax from "gsap/TweenMax";
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

  var render = function() {
    // This will be called by the TextureLoader as well as TweenMax.
    renderer.render(scene, camera);
  };

  var loader = new THREE.TextureLoader();
  loader.crossOrigin = "";

  var disp = loader.load(displacementImage, render);
  disp.wrapS = disp.wrapT = THREE.RepeatWrapping;

  if (video) {
    var animate = function() {
      requestAnimationFrame(animate);

      renderer.render(scene, camera);
    };
    animate();

    var video = document.createElement("video");
    video.autoplay = true;
    video.loop = true;
    video.src = image1;
    video.load();

    var video2 = document.createElement("video");
    video2.autoplay = true;
    video2.loop = true;
    video2.src = image2;
    video2.load();

    var texture1 = new THREE.VideoTexture(video);
    var texture2 = new THREE.VideoTexture(video2);
    texture1.magFilter = texture2.magFilter = THREE.LinearFilter;
    texture1.minFilter = texture2.minFilter = THREE.LinearFilter;

    video2.addEventListener(
      "loadeddata",
      function() {
        video2.play();

        texture2 = new THREE.VideoTexture(video2);
        texture2.magFilter = THREE.LinearFilter;
        texture2.minFilter = THREE.LinearFilter;

        mat.uniforms.texture2.value = texture2;
      },
      false
    );

    video.addEventListener(
      "loadeddata",
      function() {
        video.play();

        texture1 = new THREE.VideoTexture(video);

        texture1.magFilter = THREE.LinearFilter;
        texture1.minFilter = THREE.LinearFilter;

        mat.uniforms.texture1.value = texture1;
      },
      false
    );
  } else {
    var texture1 = loader.load(image1, render);
    var texture2 = loader.load(image2, render);

    texture1.magFilter = texture2.magFilter = THREE.LinearFilter;
    texture1.minFilter = texture2.minFilter = THREE.LinearFilter;
  }

  var mat = new THREE.ShaderMaterial({
    uniforms: {
      intensity1: {
        type: "f",
        value: intensity1
      },
      intensity2: {
        type: "f",
        value: intensity2
      },
      dispFactor: {
        type: "f",
        value: 0.0
      },
      angle1: {
        type: "f",
        value: angle1
      },
      angle2: {
        type: "f",
        value: angle2
      },
      texture1: {
        type: "t",
        value: texture1
      },
      texture2: {
        type: "t",
        value: texture2
      },
      disp: {
        type: "t",
        value: disp
      }
    },

    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    opacity: 1.0
  });

  var geometry = new THREE.PlaneBufferGeometry(
    parent.offsetWidth,
    parent.offsetHeight,
    1
  );
  var object = new THREE.Mesh(geometry, mat);
  scene.add(object);

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

  window.addEventListener("resize", function(e) {
    renderer.setSize(parent.offsetWidth, parent.offsetHeight);
  });

  this.next = transitionIn;
  this.previous = transitionOut;
}

function createScene(parent) {
  const scene = new THREE.Scene();
  // camera
  const { offsetWidth: ow, offsetHeight: oh } = parent;
  const [l, r, t, b] = [ow / -2, ow / 2, oh / 2, oh / -2];
  const [near, far] = [1, 1000];
  const camera = new THREE.OrthographicCamera(l, r, t, b, near, far);
  camera.position.z = 1;
  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xffffff, 0.0);
  renderer.setSize(parent.offsetWidth, parent.offsetHeight);
  // return it all
  return [scene, camera, renderer];
}
