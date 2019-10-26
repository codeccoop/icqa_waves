function Environ () {
    window.__animate = this.animate.bind(this);
    window.__render = this.render.bind(this);
    
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.5,
        10000
    );
    this.camera.position.set(0, -2000, 3000);
    this.camera.lookAt(0, 0, 0);
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x1b1b33, 1);
    document.body.appendChild(this.renderer.domElement);
    
    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.controls.addEventListener('change', __render);

    window.addEventListener('resize', this.onResize.bind(this), false);
}

Environ.prototype.render = function () {
    this.renderer.render(this.scene, this.camera);
}

Environ.prototype.animate = function () {
    requestAnimationFrame(__animate);
    this.controls.update();
}

Environ.prototype.onResize = function () {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
}

module.exports = Environ;
