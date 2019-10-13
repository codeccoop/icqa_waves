var scene, renderer, camera, controls;

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);
camera.position.set(0, 0, 1000);
camera.lookAt(0, 0, 0);

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1b1b33, 1);
document.body.appendChild(renderer.domElement);

control = new THREE.TrackballControls(camera, renderer.domElement);
control.addEventListener('change', render);

function render () {
    renderer.render(scene, camera);
}

function animate () {
    requestAnimationFrame(animate);
    control.update();
}
