import { PerspectiveCamera, Scene, WebGLRenderer, DirectionalLight } from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

function Environ(options) {
  window.__animate = this.animate.bind(this);
  window.__render = this.render.bind(this);

  this.options = options;
  this.scene = new Scene();

  this.camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.5,
    50000
  );
  this.camera.lookAt(0, 0, 0);
  this.camera.position.set(0, -2000, 750);

  this.renderer = new WebGLRenderer({
    canvas: document.getElementById(options.el),
    alpha: true,
    antialias: true,
  });
  this.renderer.setPixelRatio(window.devicePixelRatio * options.resolutionFactor);
  this.renderer.domElement.setAttribute("width", window.innerWidth);
  this.renderer.domElement.setAttribute("height", window.innerHeight);
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.setClearColor(0x1b1b33, 1);
  document.body.appendChild(this.renderer.domElement);

  this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  this.controls.enablePan = true;
  this.controls.enableKeys = false;
  this.controls.maxPolarAngle = Math.PI;
  this.controls.minPolarAnge = Math.PI / 2;
  this.controls.maxAzimuthAngle = Math.PI / 2;
  this.controls.minAzimuthAngle = -Math.PI / 2;
  this.controls.addEventListener("change", __render);

  const lambda = ((90 - 220) * Math.PI) / 180;
  const phi = (45 * Math.PI) / 180;

  const x = Math.cos(phi) * Math.cos(lambda);
  const y = Math.cos(phi) * Math.sin(lambda);
  const z = Math.sin(phi);

  const light = new DirectionalLight(0xffffff, 0.7);
  light.position.set(x, y, z);

  window.addEventListener("resize", this.onResize.bind(this), false);
}

Environ.prototype.render = function () {
  this.renderer.render(this.scene, this.camera);
};

Environ.prototype.animate = function () {
  requestAnimationFrame(__animate);
  this.controls.update();
};

Environ.prototype.onResize = function () {
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.domElement.setAttribute("width", window.innerWidth);
  this.renderer.domElement.setAttribute("height", window.innerHeight);
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.render();
};

export default Environ;
