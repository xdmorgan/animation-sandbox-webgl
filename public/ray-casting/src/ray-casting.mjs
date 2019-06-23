import { getCanvasDimensions } from "./get-canvas-dimensions.mjs";
import { randColor, randCoord } from "./random.mjs";
import { randRotation } from "./random.mjs";

const { THREE } = window;
const BOXES = 5000;

export class Scene {
  constructor({ canvas }) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    // create camera
    const [fov, aspect, near, far] = [35, 2, 0.1, 100];
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.z = 20;
    // this.controls = new THREE.OrbitControls(
    //   this.camera,
    //   this.renderer.domElement
    // );
    // create root scene
    this.scene = new THREE.Scene(); // a container
    this.scene.background = new THREE.Color();
    // add some lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    ambient.position.set(0, 0, 50);
    this.scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.5);
    directional.position.set(0, 0, 50);
    this.scene.add(directional);
    // create field of cubes
    this.objects = [];
    for (let i = 0; i < BOXES; i++) {
      const range = [-10, 10];
      const position = randCoord(range, range, range);
      const color = randColor();
      const rotation = randRotation();
      const cube = new Cube({ position, rotation, color });
      this.objects.push(cube);
      this.scene.add(cube.mesh);
    }
    // raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    document.addEventListener("mousemove", this.onMouseMove);
    // let's get it
    requestAnimationFrame(this.draw);
  }

  onMouseMove = e =>
    ([this.mouse.x, this.mouse.y] = [
      (e.clientX / window.innerWidth) * 2 - 1,
      (e.clientY / window.innerHeight) * 2 + 1
    ]);

  draw = () => {
    // handle responsive changes
    const [resize, view] = getCanvasDimensions(this.renderer.domElement);
    if (resize) {
      this.renderer.setSize(view.width, view.height, false);
      this.camera.aspect = view.aspect;
      this.camera.updateProjectionMatrix();
      // this.controls.update();
    }

    // raycasting
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    intersects.map(child => child.object.material.color.set(0xff0000));

    // update and redraw
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.draw);
  };
}

class Cube {
  constructor({
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    color = "red",
    size = 0.2
  }) {
    const geometry = new THREE.BoxBufferGeometry(size, size, size);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    mesh.rotation.x = rotation.x;
    mesh.rotation.y = rotation.y;
    mesh.rotation.z = rotation.z;
    this.mesh = mesh;
  }

  update() {
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.02;
  }
}

export default Scene;
