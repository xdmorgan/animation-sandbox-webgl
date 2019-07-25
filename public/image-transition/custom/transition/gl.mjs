const vertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragment = `
varying vec2 vUv;

uniform float dispFactor;
uniform sampler2D disp;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float angle1;
uniform float angle2;
uniform float intensity1;
uniform float intensity2;

mat2 getRotM(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec4 disp = texture2D(disp, vUv);
  vec2 dispVec = vec2(disp.r, disp.g);
  vec2 distortedPosition1 = vUv + getRotM(angle1) * dispVec * intensity1 * dispFactor;
  vec2 distortedPosition2 = vUv + getRotM(angle2) * dispVec * intensity2 * (1.0 - dispFactor);
  vec4 _texture1 = texture2D(texture1, distortedPosition1);
  vec4 _texture2 = texture2D(texture2, distortedPosition2);
  gl_FragColor = mix(_texture1, _texture2, dispFactor);
}
`;

export const createScene = ({ offsetWidth: ow, offsetHeight: oh }) => {
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
};

export const createSlide = (
  [texture1, texture2],
  geometry,
  intensity,
  angle,
  disp
) => {
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
};
