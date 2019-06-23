import { getCanvasDimensions } from "./get-canvas-dimensions.mjs";
import { randColor, randCoord } from "./random.mjs";

const { THREE } = window;
const BOXES = 10000;

export class Scene {
  constructor({ canvas }) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    // create camera
    const [fov, aspect, near, far] = [35, 2, 0.1, 100];
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 10;
    // create root scene
    this.scene = new THREE.Scene(); // a container
    this.scene.background = new THREE.Color();
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, 0, -10);
    this.scene.add(light);
    for (let i = 0; i < BOXES; i++) {
      const range = [-10, 10];
      const coords = randCoord(range, range, range);
      const color = randColor();
      const cube = new Cube(coords, color);
      this.scene.add(cube.mesh);
    }
    // let's get it
    requestAnimationFrame(this.draw);
  }

  draw = () => {
    const [resize, view] = getCanvasDimensions(this.renderer.domElement);
    if (resize) {
      this.renderer.setSize(view.width, view.height, false);
      this.camera.aspect = view.aspect;
      this.camera.updateProjectionMatrix();
    }
    // this.nodes.map(node => node.update())
    // this.scene.add(new Cube(randCoord()).mesh);
    // console.log(randCoord());
    // console.log(randColor());
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.draw);
  };
}

class Cube {
  constructor(position = { x: 0, y: 0, z: 0 }, color = "red", size = 0.2) {
    const geometry = new THREE.BoxBufferGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    this.mesh = mesh;
  }

  update() {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;
  }
}

export default Scene;
