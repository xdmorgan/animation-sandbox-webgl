import { getCanvasDimensions } from "./get-canvas-dimensions.mjs";
import { randColor, randCoord } from "./random.mjs";
import { randRotation } from "./random.mjs";
import { toRadian } from "./convert.mjs";

const { THREE } = window;
const BOXES = 1000;
const CAMERA_RADIUS = 60;
let theta = 0;

export class Scene {
  constructor({ canvas }) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    // create camera
    const [fov, aspect, near, far] = [75, 2, 1, 1000];
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // this.controls = new THREE.OrbitControls(
    //   this.camera,
    //   this.renderer.domElement
    // );
    // create root scene
    this.scene = new THREE.Scene(); // a container
    this.scene.background = new THREE.Color();
    // add some lighting
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.scene.add(this.light);
    // create field of cubes
    for (let i = 0; i < BOXES; i++) this.scene.add(Cube.Create().mesh);
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

    theta += 0.1;

    this.camera.position.x = CAMERA_RADIUS * Math.sin(toRadian(theta));
    this.camera.position.y = CAMERA_RADIUS * Math.sin(toRadian(theta));
    this.camera.position.z = CAMERA_RADIUS * Math.cos(toRadian(theta));
    this.camera.lookAt(this.scene.position);
    this.light.position.x = CAMERA_RADIUS * Math.sin(toRadian(theta));
    this.light.position.y = CAMERA_RADIUS * Math.sin(toRadian(theta));
    this.light.position.z = CAMERA_RADIUS * Math.cos(toRadian(theta));
    this.light.lookAt(this.scene.position);

    // // raycasting
    // this.camera.updateMatrixWorld();
    // this.raycaster.setFromCamera(this.mouse, this.camera);
    // const intersects = this.raycaster.intersectObjects(this.scene.children);
    // console.log("intersects", intersects);
    // intersects.map(child => child.object.material.color.set(0xff0000));

    // update and redraw
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.draw);
  };
}

class Cube {
  static Create(field = [-50, 50]) {
    const position = randCoord(field, field, field);
    const color = randColor();
    const rotation = randRotation();
    return new Cube({ position, rotation, color });
  }

  constructor({
    position = { x: 0, y: 0, z: 0 },
    rotation = { x: 0, y: 0, z: 0 },
    color = "red",
    size = 1
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
