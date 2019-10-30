function Environ (options) {
    var self = this;
    window.__animate = this.animate.bind(this);
    window.__render = this.render.bind(this);
    
    this.options = options;
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.5,
        50000
    );
    // this.camera.lookAt(0, 0, 0);
    // this.camera.position.set(0, 0, 0);
    this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0, -1200, 350);
    // this.camera.rotation.set(1.0912611464767945, 0.8532622644955974, 0.05805808892611628);
    
    this.renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById(options.el),
        alpha: true,
        antialias: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio*options.resolutionFactor);
    this.renderer.domElement.setAttribute("width", window.innerWidth);
    this.renderer.domElement.setAttribute("height", window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x1b1b33, 1);
    document.body.appendChild(this.renderer.domElement);
    
    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.controls.enableKeys = false;
    this.controls.addEventListener('change', __render);

    // var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    // this.scene.add( light );

    lambda = (90 - 220) * Math.PI / 180;
    phi = 45 * Math.PI / 180;

    x = Math.cos(phi) * Math.cos(lambda);
    y = Math.cos(phi) * Math.sin(lambda);
    z = Math.sin(phi);

    light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(x, y, z);

    // custom functions
    // var offset = new THREE.Vector3();
    // var spherical = new THREE.Spherical();

    // this.controls.moveForward = function (delta) {
    //   offset.copy(this.controls.object.position).sub(this.controls.target);
    //   var targetDistance = offset.length() * Math.tan((this.controls.object.fov / 2) * Math.PI / 180.0);
    //   offset.y = 0;
    //   offset.normalize();
    //   offset.multiplyScalar(-2 * delta * targetDistance / app.renderer.domElement.clientHeight);

    //   this.controls.object.position.add(offset);
    //   this.controls.target.add(offset);
    // };
    // this.controls.cameraRotate = function (thetaDelta, phiDelta) {
    //   offset.copy(this.controls.target).sub(this.controls.object.position);
    //   spherical.setFromVector3(offset);

    //   spherical.theta += thetaDelta;
    //   spherical.phi -= phiDelta;

    //   // restrict theta/phi to be between desired limits
    //   spherical.theta = Math.max(this.controls.minAzimuthAngle, Math.min(this.controls.maxAzimuthAngle, spherical.theta));
    //   spherical.phi = Math.max(this.controls.minPolarAngle, Math.min(this.controls.maxPolarAngle, spherical.phi));
    //   spherical.makeSafe();

    //   offset.setFromSpherical(spherical);
    //   this.controls.target.copy(this.controls.object.position).add(offset);
    //   this.controls.object.lookAt(this.controls.target);
    // };

    // var helper = new THREE.CameraHelper(this.camera);
    // this.scene.add(helper);

    window.addEventListener('resize', this.onResize.bind(this), false);
}

Environ.prototype.render = function () {
    this.renderer.render(this.scene, this.camera);
}

Environ.prototype.animate = function () {
    requestAnimationFrame(__animate);
    this.controls.update();
    // console.log("position");
    // console.log(this.camera.position);
    // console.log("rotation");
    // console.log(this.camera.rotation);
}

Environ.prototype.onResize = function () {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.domElement.setAttribute("width", window.innerWidth);
    this.renderer.domElement.setAttribute("height", window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.render();
}

module.exports = Environ;
