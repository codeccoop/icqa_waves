(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function BBox (features, z_field) {

    var self = this;
    this._bbox = {
        SW: [180, 90],
        NE: [-180, -90],
        Z: [null, null]
    };

    function __init (features, z_field) {
        var geom, coords, segment, polygon;
        for (var i=0;i<features.length;i++) {
            this.updateZ(features[i].properties, z_field);
            geom = features[i].geometry;
            if (geom.type === "Point") {
                this.update(geom.coordinates);
            } else if (geom.type === "MultiPoint") {
                for (let j=0;j<geom.coordinates.length;j++) {
                   coords =  geom.coordinates[j];
                   this.update(coords);
                }
            } else if (geom.type === "LineString") {
                for (let j=0;j<geom.coordinates.length;j++) {
                   coords =  geom.coordinates[j];
                   this.update(coords);
                }
            } else if (geom.type === "MultiLineString") {
                for (let j=0;j<geom.coordinates.length;j++) {
                    segment=geom.coordinates[j];
                    for (let k=0;k<segment.length;k++) {
                        coords = segment[k];
                        this.update(coords);
                    }
                }
            } else if (geom.type === "Polygon") {
                for (let j=0;j<geom.coordinates.length;j++) {
                    segment=geom.coordinates[j];
                    for (let k=0;k<segment.length;k++) {
                        coords = segment[k];
                        this.update(coords);
                    }
                }
            } else if (geom.type === "MultiPolygon") {
                for (let j=0; j<geom.coordinates.length; j++) {
                    polygon=geom.coordinates[j];
                    for (let k=0;k>polygon.length;k++) {
                        segment=polygon[k];
                        for (let l=0;l>segment.length;l++) {
                            coords = segment[l];
                            this.update(coords);
                        }
                    }
                }
            }
        }
    }
    
    __init.call(this, features, z_field);
    return this;
}

BBox.prototype.get = function () {
    var bbox = JSON.parse(JSON.stringify(this._bbox));
    bbox.x = Math.abs(bbox.SW[0] - bbox.NE[0]);
    bbox.y = Math.abs(bbox.SW[1] - bbox.NE[1]);
    return bbox;
}
    
BBox.prototype.update = function (coords) {
    this._bbox.SW[0] = coords[0] < this._bbox.SW[0] ? coords[0] : this._bbox.SW[0];
    this._bbox.SW[1] = coords[1] < this._bbox.SW[1] ? coords[1] : this._bbox.SW[1];
    this._bbox.NE[0] = coords[0] > this._bbox.NE[0] ? coords[0] : this._bbox.NE[0];
    this._bbox.NE[1] = coords[1] > this._bbox.NE[1] ? coords[1] : this._bbox.NE[1];
    return this;
}

BBox.prototype.updateZ = function (props, z_field) {
    if (!z_field) return;
    this._bbox.Z[0] = this._bbox.Z[0] == null ? props[z_field] : Number(this._bbox.Z[0]) < Number(props[z_field]) ? Number(this._bbox.Z[0]) : Number(props[z_field]);
    this._bbox.Z[1] = this._bbox.Z[1] == null ? props[z_field] : Number(this._bbox.Z[1]) > Number(props[z_field]) ? Number(this._bbox.Z[1]) : Number(props[z_field]);
}

module.exports = BBox;
},{}],2:[function(require,module,exports){
 function Coordinates (feature) {
    var interpolation_array = [];
    for (var point_num = 0; point_num < feature.length; point_num++) {
        var point1 = feature[point_num];
        var point2 = feature[point_num - 1];

        if (point_num > 0) {
            if (this.needsInterpolation(point2, point1)) {
                interpolation_array = [point2, point1];
                interpolation_array = this.interpolatePoints(interpolation_array);

                for (var inter_point_num = 0; inter_point_num < interpolation_array.length; inter_point_num++) {
                    this.push(interpolation_array[inter_point_num]);
                }
            } else {
                this.push(point1);
            }
        } else {
            this.push(point1);
        }
    }
}

Coordinates.prototype = new Array();

Coordinates.prototype.needsInterpolation = function (point2, point1) {
    var lon1 = point1[0];
    var lat1 = point1[1];
    var lon2 = point2[0];
    var lat2 = point2[1];
    var lon_distance = Math.abs(lon1 - lon2);
    var lat_distance = Math.abs(lat1 - lat2);

    if (lon_distance > 5 || lat_distance > 5) {
        return true;
    } else {
        return false;
    }
}

Coordinates.prototype.interpolatePoints = function (interpolation_array) {
    //This function is recursive. It will continue to add midpoints to the
    //interpolation array until needsInterpolation() returns false.
    var temp_array = [];
    var point1, point2;

    for (var point_num = 0; point_num < interpolation_array.length - 1; point_num++) {
        point1 = interpolation_array[point_num];
        point2 = interpolation_array[point_num + 1];

        if (this.needsInterpolation(point2, point1)) {
            temp_array.push(point1);
            temp_array.push(this.getMidpoint(point1, point2));
        } else {
            temp_array.push(point1);
        }
    }

    temp_array.push(interpolation_array[interpolation_array.length - 1]);

    if (temp_array.length > interpolation_array.length) {
        temp_array = this.interpolatePoints(temp_array);
    } else {
        return temp_array;
    }
    return temp_array;
}

Coordinates.prototype.getMidpoint = function (point1, point2) {
    var midpoint_lon = (point1[0] + point2[0]) / 2;
    var midpoint_lat = (point1[1] + point2[1]) / 2;
    var midpoint = [midpoint_lon, midpoint_lat];

    return midpoint;
}

module.exports = Coordinates;
},{}],3:[function(require,module,exports){
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
    this.camera.position.set(0, -2000, 750);
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

},{}],4:[function(require,module,exports){
function Projection (offset) {
    return function (coords) {
        return [(coords[0]/180)*offset, (coords[1]/180)*offset];
    }
}

module.exports = Projection;
},{}],5:[function(require,module,exports){
function Scale (range, domain) {
    var _range = Math.abs(range[0] - range[1]);
    var _domain = Math.abs(domain[0] - domain[1]);
    var fn = function (value) {
        return (((value-domain[0])/_domain)*_range) -_range/2;
    }
    
    fn.range = function () {
        return JSON.parse(JSON.stringify(range));
    }
    
    fn.domain = function () {
        return JSON.parse(JSON.stringify(domain));
    }
    
    return fn;
}

module.exports = Scale;
},{}],6:[function(require,module,exports){
var Scale = require('./components/Scale.js');
var Projection = require('./components/Projection.js');
var BBox = require('./components/BBox.js');
var Coordinates = require('./components/Coordinates.js');
var { uid } = require('../helpers.js');

function Geojson2Three (env) {
    if (!env) {
        throw new Error('env are required!');
    }
    
    this.env = env;
    this.scene = env.scene || window.scene;
    if (!this.scene) {
        throw new Error('env are required!');
    }
    this.objects = new Array();
}

Geojson2Three.prototype.fitEnviron = function (z_field, settings) {
    var self = this;
    if (!this.srcData) throw new Error("You must bind data before");
    // if (!z_field) return this;
    
    settings = settings || new Object();
    
    this.resolutionFactor = settings.resolutionFactor || 1;

    this.offset = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
    this.projection = Projection(this.offset);

    this.scales = settings.scales || new Object();
    this.bbox = new BBox(this.srcData, z_field).get();
    if (this.scales.relative === true && this.scales.range) {
        this.scales.range = this.bbox.Z;
    }

    this.scaleX = Scale([0, this.offset], this.projection([this.bbox.SW[0], this.bbox.NE[0]]));
    this.scaleY = Scale([0, this.offset], this.projection([this.bbox.SW[1], this.bbox.NE[1]]));
    this.scaleZ = typeof settings.scaleZ == "function" && function (feat) {
        return settings.scaleZ(feat, {
            bbox: self.bbox,
            scales: settings.scales
        });
    } || function () {return 0};

    // var pSW = this.projection(this.bbox.SW),
    //     pNE = this.projection(this.bbox.NE);

    // var pBBox = {
    //     x1: this.scaleX(pSW[0]),
    //     y1: this.scaleY(pSW[1]),
    //     x2: this.scaleX(pNE[0]),
    //     y2: this.scaleY(pNE[1])
    // }
    // debugger;
    // this.env.camera.position.set(pBBox.x2 - pBBox.x1, pBBox.y2 - pBBox.y1, 900);
    // this.env.camera.lookAt(0,0,0);
    // this.env.camera.updateProjectionMatrix();
    // this.env.controls.target.set(pBBox.x2 - pBBox.x1, pBBox.y2 - pBBox.y1, 0);
    return this;
}

Geojson2Three.prototype.data = function (geojson, id) {
    if (geojson) {
        id = id || function (d,i) { return i };
        this.srcData = new Array();
        if (geojson.type == 'Feature') {
            geojson._id = id(geojson, 0);
            this.srcData.push(geojson);
        } else if (geojson.type == 'FeatureCollection') {
            for (var i=0; i<geojson.features.length; i++) {
                geojson.features[i]._id = id(geojson.features[i], i);
                this.srcData.push(geojson.features[i]);
            }
        } else if (geojson.type == 'GeometryCollection') {
            for (var i=0; i<geojson.geometries.length; i++) {
                geojson.geometries[i]._id = id(geojson.geometries[i], i);
                geojson.geometries[i].geometry = geojson.geometries[i];
                this.srcData.push(geojson.geometries[i]);
            }
        } else {
            throw new Error('The GeoJSON is not valid.');
        }
        return this;
    } else {
        return this.srcData;
    }
}

Geojson2Three.prototype.update = function (geojson, options) {
    var self = this;
    var data, geom, z_coordinate, feat;
    if (this.srcData && this.srcData.length) {
        data = geojson.type == "FeatureCollection" ? 
            geojson.features : geojson.type == "GeometryCollection" ?
            geojson.geometries : geojson.type == "Feature" ? 
            [geojson] : null;

        if (data === null) throw new Error("GeoJSON not valid");
        
        var oldSrcData = this.srcData;
        this.data(geojson, function (d,i) {
            return oldSrcData[i]  && oldSrcData[i]._id || i;
        });
        
        for (var i=0; i<data.length; i++) {
            feat = this.srcData[i];
            geom = feat.geometry;
            z_coordinate = this.scaleZ(feat);
            object = this.objects[i];
            if (!object) return;
            object.geometry.dispose();

            if (geom.type == 'Point') {
                var point = this.Point(this.project(geom.coordinates, z_coordinate), options);
                object.geometry = point.geometry;
                object.material = point.material;
            } else if (geom.type == 'MultiPoint') {
                for (var i=0;i<geom.coordinates.length;i++) {
                    var point = this.Point(this.project(geom.coordinates[i], z_coordinate), options);
                    object.geometry = point.geometry;
                    object.material = point.material;
                }
            } else if (geom.type == 'LineString') {
                coordinates = new Coordinates(geom.coordinates);
                var line = this.Line(coordinates.map(function (coord) {
                    return self.project(coord, z_coordinate);
                }), options, feat);
                // object.geometry = line.geometry;
                for (let from, to, i=0, len=Math.max(line.geometry.vertices.length, object.geometry.vertices.length);i<len; i++) {
                    from = object.geometry.vertices[i];
                    to = line.geometry.vertices[i];
                    if (from && to) {
                        from.setX(to.x);
                        from.setY(to.y);
                        from.setZ(to.z);
                    } else if (to) {
                        object.geometry.vertices.push(to);
                    } else {
                        object.geometry.vertices.slice(i,1);
                    }
                }
                object.geometry.verticesNeedUpdate = true;
                // object.material = line.material;
            } else if (geom.type == 'Polygon') {
                for (var j=0; j<geom.coordinates.length; j++) {
                    coordinates = new Coordinates(geom.coordinates[j]);
                    var polygon = this.Polygon(coordinates.map(function (coord) {
                        return self.project(coord, z_coordinate);
                    }), options, feat);
                    object.geometry = polygon.geometry;
                    object.material = polygon.material;
                }
            } else if (geom.type == 'MultiLineString') {
                for (var j=0; j<geom.coordinates.length; j++) {
                    coordinates = new Coordinates(geom.coordinates[j]);
                    var line = this.Line(coordinates.map(function (coord) {
                        return self.project(coord, z_coordinate);
                    }), options, feat);
                    object.geometry = line.geometry;
                    object.material = line.material;
                }
            } else if (geom.type == 'MultiPolygon') {
                for (var j=0; i<geom.coordinates.length; j++) {
                    polygon = geom.coordinates[j];
                    for (var k=0; k<polygon.length; k++) {
                        segment = polygon[k];
                        coordinates = new Coordinates(segment);
                        var line = this.Line(coordinates.map(function (coord) {
                            return self.project(coord, z_coordinate);
                        }), options, feat);
                        object.geometry = line.geometry;
                        object.material = line.material;
                    }
                }
            } else {
                throw new Error('The geoJSON is not valid.');
            }
        }
    }
}

Geojson2Three.prototype.draw = function (options) {
    var self = this;
    var polygon, segment, coordinates, z_coordinate;
    if (!this.srcData) {
        throw new Error("You should bind data before draw");
    } else {
        this.clear();
    }

    for (var i=0; i<this.srcData.length; i++) {
        screen_coordinates = new Array();
        geom = this.srcData[i].geometry;
        feat = this.srcData[i];
        z_coordinate = this.scaleZ(this.srcData[i]);
        if (geom.type == 'Point') {
            var point = this.Point(this.project(geom.coordinates, z_coordinate), options, feat);
            this.objects.push(point);
            point.draw();
        } else if (geom.type == 'MultiPoint') {
            for (var i=0;i<geom.coordinates.length;i++) {
                var point = this.Point(this.project(geom.coordinates[i], z_coordinate), options, feat);
                this.objects.push(point);
                point.draw();
            }
        } else if (geom.type == 'LineString') {
            coordinates = new Coordinates(geom.coordinates);
            var line = this.Line(coordinates.map(function (coord) {
                return self.project(coord, z_coordinate);
            }), options, feat);
            this.objects.push(line);
            line.draw();
        } else if (geom.type == 'Polygon') {
            for (var j=0; j<geom.coordinates.length; j++) {
                coordinates = new Coordinates(geom.coordinates[j]);
                var polygon = this.Polygon(coordinates.map(function (coord) {
                    return self.project(coord, z_coordinate);
                }), options, feat);
                this.objects.push(polygon);
                polygon.draw();
            }
        } else if (geom.type == 'MultiLineString') {
            for (var j=0; j<geom.coordinates.length; j++) {
                coordinates = new Coordinates(geom.coordinates[j]);
                var line = this.Line(coordinates.map(function (coord) {
                    return self.project(coord, z_coordinate);
                }), options, feat);
                this.objects.push(line);
                line.draw();
            }
        } else if (geom.type == 'MultiPolygon') {
            for (var j=0; j<geom.coordinates.length; j++) {
                polygon = geom.coordinates[j];
                for (var k=0; k<polygon.length; k++) {
                    segment = polygon[k];
                    coordinates = new Coordinates(segment);
                    var polygon = this.Polygon(coordinates.map(function (coord) {
                        return self.project(coord, z_coordinate);
                    }), options, feat);
                    this.objects.push(polygon);
                    polygon.draw();
                }
            }
        } else {
            throw new Error('The GeoJSON is not valid.');
        }
    }
    return this;
}

Geojson2Three.prototype.project = function (coords, z_coordinate) {
    var projected = this.projection(coords);
    return [this.scaleX(projected[0])*this.resolutionFactor, this.scaleY(projected[1])*this.resolutionFactor, z_coordinate * this.resolutionFactor || 0];
}

Geojson2Three.prototype.Point = function (sc, options, feature) {
    var name = uid();
    
    var point_geom = this.Geom(sc);
    point_geom.name = name;

    var point_material = this.PointMaterial(options, feature, name);
    point_material.name = name;

    var point = new THREE.Points(point_geom, this.material);
    point.name = name;

    var self = this;
    point.draw = function () {
        self.scene.add(point);
    }

    return point;
}

Geojson2Three.prototype.Line = function (sc, options, feature) {
    var name = uid();
    var line_geom = this.Geom(sc, name);
    
    var line_material = this.LineMaterial(options, feature, name);
    
    var line = new THREE.Line(line_geom, line_material);
    line.name = name;

    var self = this;
    line.draw = function () {
        self.scene.add(line);
    }

    return line;
}

Geojson2Three.prototype.Polygon = function (sc, options, feature, scales) {
    var name = uid();
    var polygon_geom = this.Shape(sc, name);
    var edges_geom = this.Edges(sc, name);

    var polygon_material = this.BasicMaterial(options, feature, name);
    var edges_material = this.LineMaterial({color: 0xcccccc, linewidth: 1, linecap: 'round', linejoin:  'round'}, feature, name);
    var polygon = new THREE.Mesh(polygon_geom, polygon_material);
    var edges = new THREE.LineSegments(edges_geom, edges_material);

    var self = this;
    polygon.draw = function () {
        self.scene.add(polygon);
        self.scene.add(edges);
    }

    return polygon;
}

Geojson2Three.prototype.Geom = function (sc, name) {
    // var geom = new THREE.BufferGeometry();
    // var positions = sc.reduce(function (acum, coords) {
    //     acum.push(...coords);
    //     return acum;
    // }, new Array());
    // geom.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    // geom.computeBoundingSphere();
    // geom.name = name || uid();
    // return geom;
    var geom = new THREE.Geometry();
    sc.map(function (coord) {
        geom.vertices.push(new THREE.Vector3(coord[0], coord[1], coord[2]));
    });
    geom.name = name || uid();
    return geom;
}

Geojson2Three.prototype.Shape = function (sc, name) {
    var shape = new THREE.Shape();
    sc.map(function (coord, i) {
        if (i == 0) {
            shape.moveTo(coord[0], coord[1]);
        } else {
            shape.lineTo(coord[0], coord[1]);
        }
    });

    var geometry = new THREE.ShapeGeometry(shape);
    geometry.name = name || uid();
    return geometry;
}

Geojson2Three.prototype.Edges = function (sc, name) {
    var shape = new THREE.Shape();
    sc.map(function (coord, i) {
        if (i == 0) {
            shape.moveTo(coord[0], coord[1]);
        } else {
            shape.lineTo(coord[0], coord[1]);
        }
    });

    var geometry = new THREE.EdgesGeometry(new THREE.ShapeGeometry(shape));
    geometry.name = name || uid();
    return geometry;
}

Geojson2Three.prototype.PointMaterial = function (options, feature, name) {
    var self = this;
    options = Object.keys(options).reduce(function (a, k) {
        a[k] = typeof options[k] === "function" ? options[k](feature, {
            scales: self.scales,
            bbox: self.bbox
        }) : options[k];
        return a;
    }, new Object());
    
    var material = new THREE.PointsMaterial(options);
    material.name = name || uid();
    return material;
}

Geojson2Three.prototype.LineMaterial = function (options, feature, name) {
    var self = this;
    options = Object.keys(options).reduce(function (a, k) {
        a[k] = typeof options[k] === "function" ? options[k](feature, {
            scales: self.scales,
            bbox: self.bbox
        }) : options[k];
        return a;
    }, new Object());
    
    var material = new THREE.LineBasicMaterial(options);
    material.name = name || uid();
    return material;
}

Geojson2Three.prototype.BasicMaterial = function (options, feature, name) {
    var self = this;
    options = Object.keys(options).reduce(function (a, k) {
        a[k] = typeof options[k] === "function" ? options[k](feature, {
            scales: self.scales,
            bbox: self.bbox
        }) : options[k];
        return a;
    }, new Object());

    var material = new THREE.MeshLambertMaterial(options);
    material.name = name || uid();
    return material;
}

Geojson2Three.prototype.clear = function () {
    const self = this;
    this.objects.map(function (obj) {
        obj = self.scene.getObjectByName(obj.name);
        obj.geometry.dispose();
        obj.material.dispose();
        self.scene.remove(obj);
    });
    this.objects = new Array();
    return this;
};

module.exports = Geojson2Three;
},{"../helpers.js":7,"./components/BBox.js":1,"./components/Coordinates.js":2,"./components/Projection.js":4,"./components/Scale.js":5}],7:[function(require,module,exports){
exports.request = function request (URL, callback, fallback) {
    // var ajax = new XMLHttpRequest();
    if (window.caches) {
        URL = location.protocol+'//'+location.host + URL;
        window.caches.open(window.CACHE_NAME).then(function (cache) {
            cache.match(URL).then(function (req) {
                if (req) {
                    req.json().then(function (json) {
                        // console.log('[CACHE:Get]: ', URL);
                        callback(json);
                    });
                } else {
                    fetch(URL).then(function (res) {
                        window.caches.open(window.CACHE_NAME).then(function (cache) {
                            cache.put(URL, res);
                            console.log('[CACHE:Cached]: ', URL);
                            cache.match(URL).then(function (req) {
                                if (req) {
                                    req.json().then(function (json) {
                                        callback(json);
                                    });
                                } else {
                                    fetch(URL).then(function (res) {
                                        window.caches.open(window.CACHE_NAME).then(function (cache) {
                                            cache.put(URL, res);
                                            cache.match(URL).then(function (req) {
                                                if (req) {
                                                    req.json().then(function (json) {
                                                        callback(json);
                                                    });
                                                } else {
                                                    callback({"type": "FeatureCollection", "features": []});
                                                }
                                            });
                                        });
                                    });
                                }
                            });
                        });
                    });
                }
            }).catch(function () {
                console.log('[CACHE:Error]:', url);
                fetch(URL).then(function (res) {
                    window.caches.open(window.CACHE_NAME).then(function (cache) {
                        cache.put(URL, res);
                        cache.match(URL).then(function (req) {
                            if (req) {
                                req.json().then(function (json) {
                                    callback(json);
                                });
                            } else {
                                callback({"type": "FeatureCollection", "features": []});
                            }
                        });
                    });
                });
            });
        });   
    } else {
        fetch(URL).then(function (res) {
            res.json().then(function (json) {
                callback({"type": "FeatureCollection", "features": []});
            });
        });
    }
}

exports.lerpColor = function lerpColor (colorScale, amount) {
    var buckets = colorScale.map((d,i) => {
        return (i+1)*(1/colorScale.length)
    });

    var a,b,rr,rg,rb;
    var i=0;
    while (!rr || !rg || !rb) {
        if (amount <= buckets[i]) {
            a = colorScale[Math.max(0, i-1)], b = colorScale[i];
            var ah = parseInt(a.replace(/#/g, ''), 16),
                ar = ah >> 16,
                ag = ah >> 8 & 0xff,
                ab = ah & 0xff;
            
            var bh = parseInt(b.replace(/#/g, ''), 16),
                br = bh >> 16,
                bg = bh >> 8 & 0xff,
                bb = bh & 0xff;
            
                rr = ar + amount * (br - ar),
            rg = ag + amount * (bg - ag),
            rb = ab + amount * (bb - ab);
        }

        if (!buckets[i]) {
            break;
        }

        i++;
    }

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

exports.uid = function uid () {
    var chars = ["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz[]-_*+|/^'!¡?¿"],
        charsLen = chars.length;
    return Array.apply(null, Array(10)).map(function (a) {
        return a + chars[Math.ceil(Math.random() * charsLen)]
    }, new String());
    
}
},{}],8:[function(require,module,exports){
var Geojson2Three = require('./geojson2three/main.js');
var Environ = require('./geojson2three/components/Environ.js');
var { request, lerpColor } = require('./helpers.js');
var DateTime = require('./views/datetime.js');


window.CACHE_NAME = 'icqawaves';

debugger;
if (location.protocol !== 'https:' && (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')) {
    location = 'https://' + location.host;
}

document.addEventListener("DOMContentLoaded", function (ev) {
    var resolution = 1;
    var relative = true;
    var g2t;
    var _data;
    
    var dateTime = new DateTime(requestData);
    var env = new Environ({
        el: 'canvas',
        resolutionFactor: resolution
    });

    function jsonToScene (geojson) {
        _data = geojson;
        if (!g2t) g2t = new Geojson2Three(env);

        g2t.data(geojson)
            .fitEnviron('icqa', {
                resolutionFactor: resolution,
                scaleZ: function (feature, ctxt) {
                    if (ctxt.scales.relative === true) {
                        // get the relative value to the left range
                        return (feature.properties['icqa']-ctxt.scales.range[0]) / 
                            // divide by the range extent to get the proportion
                            (ctxt.scales.range[1] - ctxt.scales.range[0]) * 
                            // map to the dimain extent
                            (ctxt.scales.domain[1]-ctxt.scales.domain[0]) +
                            // starts from the left domain
                            ctxt.scales.domain[0];
                    }
                    return feature.properties.icqa;
                },
                scales: {
                    relative: relative,
                    range: [0, 200],
                    domain: [50, 170]
                }
            }).draw({
                color: function (feature, ctxt) {
                    if (ctxt.scales.relative == true) {
                        var proportion = (feature.properties['icqa']-ctxt.scales.range[0]) / 
                            // divide by the range extent to get the proportion
                            (ctxt.scales.range[1] - ctxt.scales.range[0]);
                        return lerpColor(['#77d2b7', '#4affc3', '#d2769e', '#ff4891'] , proportion);
                    }
                    
                    return lerpColor(['#77d2b7', '#4affc3', '#d2769e', '#ff4891'], feature.properties.icqa/200);
                },
                linewidth: 1,
                linecap: 'round',
                linejoin:  'round',
                transparent: true,
                opacity: .7
            });

        env.render();
        env.animate();
    }

    function requestData (year, month, day, hour) {
        return new Promise(function (res, rej) {
            // var url = "/rest/contours/10/8/"+year+"/"+month+"/"+day+"/"+hour;
            var url = "/rest/contours/10/8/"+year+"/1/"+day+"/"+hour;
            request(url, function (geojson) {
                jsonToScene(geojson);
                res(geojson);
            }, function (err) {
                rej(err);
            });
        });
    }
    
    var ready = [false, false];
    requestData(2018, 1, 1, 'h01').then(function () {
        ready[0] = true;
        if (ready.reduce(function (a,d) { return a && d}, true)) {
            document.body.classList.add('ready');
        }
    });
    
    request('/rest/municipalities', function (geojson) {
        new Geojson2Three(env)
        .data(geojson)
        .fitEnviron(null, {
            resolutionFactor: resolution,
            scaleZ: 0,
            env: env
        }).draw({
            color: '#dbf4fa',
            transparent: true,
            opacity: 0.2
        });
        env.render();
        env.animate();
        ready[1] = true;
        if (ready.reduce(function (a,d) { return a && d}, true)) {
            document.body.classList.add('ready');
        }
    });

    Array.apply(null, document.getElementById('scales').getElementsByClassName('scale')).map(function (el, i, els) {
        el.addEventListener('click', function (ev) {
            els.map(function (el) {
                el.classList.remove('active');
            });
            el.classList.add('active');
            relative = el.getAttribute('data-value') == 'relative';
            jsonToScene(_data);
        });
    });

    (function background () {
        var dt;
        function controller (year, month, day, hour) {
            var url = "/rest/contours/10/8/"+year+"/1/"+day+"/"+hour;
            var promise = new Promise(function (res, rej) {
                request(url, function (geojson) {
                    res(geojson)
                }, function (err) {
                    rej(err);
                });
            });
            if (year == 2018 && month == 1 && day == 31 && hour == 'h24') {
                dt.stop();
            }
            return promise;
        }

        dt = new DateTime(controller, {
            background: true
        });

        dt.start();
    })();

    document.body.addEventListener('click', function (ev) {
        if (document.body.classList.contains('waiting')) {
            ev.stopImmediatePropagation();
            ev.stopPropagation();
            ev.preventDefault();
        }
    }, true);

    document.getElementById('canvas').addEventListener('mousedown', function (ev) {
        if (ev.currentTarget.classList.contains('blocked')) {
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            ev.preventDefault();
        }
    }, true);

    document.getElementById('canvas').addEventListener('mousemove', function (ev) {
        if (ev.currentTarget.classList.contains('blocked')) {
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            ev.preventDefault();
        }
    }, true);
});
},{"./geojson2three/components/Environ.js":3,"./geojson2three/main.js":6,"./helpers.js":7,"./views/datetime.js":12}],9:[function(require,module,exports){
module.exports = (function () {
    
    var _calendar,
        _year;
        
    var month,
        date,
        day,
        weekArray = new Array(),
        monthArray = new Array();

    _calendar = Array.apply(null, Array(365)).reduce(function (acum, d, i) {
        date = new Date("2018");
        date.setDate(i+1);
        if ((month || 0) != date.getMonth()) {
            monthArray.push(weekArray);
            weekArray = new Array();
            acum.push(monthArray);
            monthArray = new Array();
        }
        day = date.getDay();
        weekArray.push(date.getDate());
        if (day == 0) {
            monthArray.push(weekArray);
            weekArray = new Array();
        }
        month = date.getMonth();
        return acum;
    }, new Array());
    monthArray.push(weekArray);
    _calendar.push(monthArray);
    Object.freeze(_calendar);

    _year = _calendar.reduce(function (acum, month) {
        acum.push(month.reduce(function (acum, week) {
            week.map(function (day) {
                acum.push(day);
            });
            return acum;
        }, new Array()));
        return acum;
    }, new Array());
    Object.freeze(_year);

    function dispatch (direction, type) {
        this.view.el.dispatchEvent(new CustomEvent("change", {
            detail: {
                type: type || "month",
                direction: direction || "forward",
                src: this
            }
        }));
    }

    function Calendar (view) {
        var self = this;
        this.view = view;
        this.state = {year: 2018, month: 0, day: 0};
        Object.freeze(this.state);
        this.dates = (function () {
            var day, month, year;
            return (function* () {
                while (true) {
                    day = self.state.day + 1;
                    month = self.state.month;
                    year = self.state.year;
                    
                    if (day == _year[month].length) {
                        day = 0;
                        month++;
                    }
    
                    if (month == 12) {
                        month = 0;
                        year++;
                    }
    
                    date = {
                        year: year,
                        month: month,
                        day: day
                    }
    
                    yield date;
                }
            })();
        })();
        Object.defineProperty(this, 'date', {
            set: function (val) {
                var _old = self.state;
                self.state = ["day", "month", "year"].reduce(function (acum, key) {
                    if (val[key] == undefined) {
                        acum[key] = self.state[key];
                    } else {
                        if (key == 'year') {
                            acum[key] = 2018; // val[key];
                        } else if (key == 'month') {
                            if (val[key] < 0) {
                                acum[key] = 12+val[key]%12;
                                val["year"] = val["year"] != undefined ? val["year"] - 1 : self.state["year"] - 1;
                            } else if (val[key] >= 12) {
                                acum[key] = val[key]%12;    
                                val["year"] = val["year"] != undefined ? val["year"] + 1 : self.state["year"] + 1;
                            } else {
                                acum[key] = val[key];
                            }

                            if (_year[acum[key]].length <= acum.day) {
                                acum.day = _year[acum[key]].length - 1;
                            }
                        } else {
                            if (val[key] < 0) {
                                acum[key] = self.getMonth(-1).length + val[key];
                                val["month"] = val["month"] != undefined ? val["month"] - 1 : self.state["month"] - 1;
                            } else if (val[key] >= self.getMonth().length) {
                                acum[key] = val[key] - self.getMonth().length;
                                val["month"] = val["month"] != undefined ? val["month"] + 1 : self.state["month"] + 1;
                            } else {
                                acum[key] = val[key];
                            }
                        }
                    }
                    return acum;
                }, new Object());
                Object.freeze(self.state);

                _old.month > self.state.month ?
                    dispatch.call(self, 'backward') :
                    _old.month < self.state.month ?
                        dispatch.call(self, 'forward') :
                        null;

                _old.day > self.state.day ?
                    dispatch.call(self, 'backward', 'day') :
                    _old.day < self.state.day ?
                        dispatch.call(self, 'forward', 'day') :
                        null;
            },
            get: function () {
                return self.state;
            }
        })
    }

    Calendar.prototype.getYear = function getMatrix () {
        return _year;
    }
    
    Calendar.prototype.getCalendar = function getWeeked () {
        return _calendar;
    }

    Calendar.prototype.getMonth = function getMonth (correction) {
        var index = this.date.month+(correction || 0);
        index = index < 0 ? (_year.length + index) % _year.length : index % _year.length;
        return _year[index];
    }

    Calendar.prototype.next = function next () {
        this.state = this.dates.next().value;
        Object.freeze(this.state);
        return this.state;
    }

    return Calendar;
})();
},{}],10:[function(require,module,exports){
module.exports = (function () {

    function format (hour) {
        return 'h' + (String(hour).length == 1 ? '0'+hour : hour);
    }

    function dispatch (direction, type) {
        this.view.el.dispatchEvent(new CustomEvent("change", {
            detail: {
                type: type || "day",
                direction: direction || "forward",
                src: this
            }
        }));
    }

    function TimeLine (view) {
        var self = this;
        this.view = view;
        this.state = 0;
        this.hours = (function () {
            return (function* () {
                while (true) {
                    yield (self.state + 1)%24;
                }
            })();
        })();
        Object.defineProperty(this, 'hour', {
            get: function () {
                return format(self.state+1);
            },
            set: function (val) {
                var _old = self.state;
                self.state = val-1 < 0 ? 23 : val-1 > 23 ? 0 : val-1;

                _old == 23 && self.state == 0 ?
                    dispatch.call(self, 'forward') : 
                    _old == 0 && self.state == 23 ?
                        dispatch.call(self, 'backward') : 
                        _old < self.state ?
                         dispatch.call(self, 'forward', 'hour') :
                         dispatch.call(self, 'backward', 'hour');
            }
        });
    }

    TimeLine.prototype.next = function next () {
        this.state = this.hours.next().value;
        return format(this.state+1);
    }

    TimeLine.prototype.getHours = function getHours () {
        return Array.apply(null, Array(24)).map(function (d,i) {
            return i+1;
        });
    }

    return TimeLine
})();
},{}],11:[function(require,module,exports){
var CalendarModel = require('../models/calendar.js');

module.exports = (function () {
    
    function Calendar (onClick, config) {
        var self = this;
        this.onClick = onClick;
        this.model = new CalendarModel(this);
        this.el = document.getElementById('calendar');

        if (config.background) return this;

        this.el.innerHTML = '<div class="calendar__header"></div><div class="calendar__content"></div>';

        var timelineBody = this.el.children[1];
        timelineBody.innerHTML = '<div class="calendar__nav backward" scale="month" disabled><abbr title="navegació per mesos">&lsaquo;</abbr></div>' +
            '<div class="calendar__nav backward" scale="day"><abbr title="navegació per dies">&laquo;</abbr></div>' +
                '<div class="calendar__days-wrapper"></div>' +
            '<div class="calendar__nav forward" scale="day"><abbr title="navegació per dies">&raquo;</abbr></div>' +
            '<div class="calendar__nav forward" scale="month" disabled><abbr title="navegació per mesos">&rsaquo;</abbr></div>';

        this.el.addEventListener("change", function (ev) {
            if (ev.detail.type == "month") {
                self.render();
            }
        }, true);

        Array.apply(null, this.el.getElementsByClassName('calendar__nav')).map(function (el) {
            el.addEventListener('click', function () {
                if (el.getAttribute('class').indexOf('forward') > 0) {
                    if (el.getAttribute('scale') == 'month') {
                        self.model.date = {month: self.model.date.month + 1};
                    } else {
                        self.model.date = {day: self.model.date.day + 1};
                    }
                } else {
                    if (el.getAttribute('scale') == 'month') {
                        self.model.date = {month: self.model.date.month - 1};
                    } else {
                        self.model.date = {day: self.model.date.day - 1};
                    }
                }
                self.onClick();
            });
        });
    }

    var months = {
        0: "Gener",
        1: "Febrer",
        2: "Març",
        3: "Abril",
        4: "Maig",
        5: "Juny",
        6: "Juliol",
        7: "Agost",
        8: "Setembre",
        9: "Octubre",
        10: "Novembre",
        11: "Desembre"
    }

    Calendar.prototype.parseMonth = function (index) {
        return months[index];
    }

    Calendar.prototype.render = function () {
        var self = this;
        var daysWrapper = this.el.getElementsByClassName('calendar__days-wrapper')[0],
            monthHeader = this.el.children[0],
            monthHeader;

        monthHeader.innerText = this.parseMonth(this.model.date.month);
        daysWrapper.innerHTML = "";

        var row;
        this.model.getMonth().map(function (day, i, days) {
            if (!row || i == Math.ceil(days.length/2)) {
                row = document.createElement('div');
                row.setAttribute('class', 'calendar__days-row');
                daysWrapper.appendChild(row);
            }

            var dayEl = document.createElement('div');
            dayEl.classList.add('day');
            dayEl.innerText = day;
            dayEl.setAttribute('data-day', i);
            dayEl.setAttribute('data-month', self.model.date.month);
            dayEl.setAttribute('data-year', 2018);
            dayEl.addEventListener('click', function (ev) {
                var year = ev.currentTarget.getAttribute('data-year');
                var month = ev.currentTarget.getAttribute('data-month');
                var day = ev.currentTarget.getAttribute('data-day');    
                self.model.date = {
                    year: Number(year),
                    month: Number(month),
                    day: Number(day)
                };
                self.onClick();
            });
            row.appendChild(dayEl);
        });

        this.el.getElementsByClassName('day')[0].classList.add('active');
    }

    return Calendar;
})();
},{"../models/calendar.js":9}],12:[function(require,module,exports){
var CalendarView = require('./calendar.js');
var TimeLineView = require('./timeline.js');

module.exports = (function () {

    function onAnimationChange (run, el) {
        var animate = el || document.getElementById('animate');
        if (run) {
            this.start();
            animate.classList.add('active');
        } else {
            this.stop();
            animate.classList.remove('active');
        }
        this.animation = run;
    }

    function onInteractiveChange () {
        onAnimationChange.call(this, false);
    }

    function DateTime (onChange, config) {
        var self = this;
        this.config = config || new Object();
        this.throttleResolver;
        this.onChange = function (year, month, day, hour) {
            if (!self.config.background) {
                Array.apply(null, self.calendarView.el.getElementsByClassName('day')).map(function (el) {
                    if (el.getAttribute('data-year') == year && el.getAttribute('data-month') == month-1 && el.getAttribute('data-day') == day-1) {
                        el.classList.add('active');
                    } else {
                        el.classList.remove('active');
                    }
                });
                Array.apply(null, self.timeLineView.el.getElementsByClassName('hour')).map(function (el) {
                    if (el.getAttribute('data-hour') == hour.replace(/h0?/, '')) {
                        el.classList.add('active');
                    } else {
                        el.classList.remove('active');
                    }
                });
            }

            return onChange.apply(null, arguments).then(function (geojson) {
                document.body.classList.remove('waiting');
                return geojson;
            }).catch(function (err) {
                document.body.classList.remove('waiting');
                return geojson;
            });
        };
        
        this.calendarView = new CalendarView(onInteractiveChange.bind(this), this.config);
        this.timeLineView = new TimeLineView(onInteractiveChange.bind(this), this.config);

        if (!this.config.background) {
            this.calendarView.render();
            this.timeLineView.render();

            this.calendarView.el.addEventListener("change", function (ev) {
                self.onChange(
                    self.calendarView.model.date.year, 
                    self.calendarView.model.date.month+1, 
                    self.calendarView.model.date.day+1,
                    self.timeLineView.model.hour
                );
            });
        }

        this.animation = false;
        document.getElementById("animate").addEventListener("click", function (ev) {
            onAnimationChange.call(self, !self.animation, ev.currentTarget);
        });

        this.timeLineView.el.addEventListener("change", function (ev) {
            if (ev.detail.type == "day") {
                if (ev.detail.direction == "forward") {
                    var newDay = self.calendarView.model.date.day;
                    newDay += 1;
                    self.calendarView.model.date = {day: newDay};
                } else {
                    var newDay = self.calendarView.model.date.day;
                    newDay -= 1;
                    self.calendarView.model.date = {day: newDay};
                }
            } else {
                self.onChange(
                    self.calendarView.model.date.year, 
                    self.calendarView.model.date.month+1, 
                    self.calendarView.model.date.day+1,
                    self.timeLineView.model.hour
                );
            }
        });
    }

    DateTime.prototype.start = function start () {
        var self = this;
        var hour, date, init, delta;

        function next () {
            init = new Date();
            new Promise(function (res, rej) {
                if (self.throttleResolver) {
                    self.throttleResolver = false;
                    res();
                    return;
                }
                hour = self.timeLineView.model.next();
                if (hour == 'h01') {
                    date = self.calendarView.model.next();
                } else {
                    date = self.calendarView.model.date;
                }

                self.onChange(date.year, Number(date.month)+1, date.day+1, hour).then(function () {
                    if (self.config.background) {
                        next();
                    } else {
                        delta = new Date() - init;
                        if (delta < 500) {
                            setTimeout(next, 500 - delta);
                        }
                    }
                });
            });
        }

        next();

        if (this.config.background) return;

        document.getElementById('canvas').classList.add('blocked');
    }

    DateTime.prototype.stop = function stop () {
        document.getElementById('canvas').classList.remove('blocked');
        this.throttleResolver = true;
    }

    return DateTime;
})();
},{"./calendar.js":11,"./timeline.js":13}],13:[function(require,module,exports){
var TimeLineModel = require('../models/timeline.js');

module.exports = (function () {
    
    function TimeLine (onClick, config) {
        var self = this;
        this.onClick = onClick;
        this.model = new TimeLineModel(this);
        this.el = document.getElementById('timeline');

        if (config.background) return this;

        this.el.innerHTML = '<div class="timeline__content"></div>';

        var timelineBody = this.el.children[0];
        timelineBody.innerHTML = '<div class="timeline__nav backward">' +
            '<abbr title="navegació per hores">&laquo;</abbr>' +
        '</div>' +
        '<div class="timeline__hours-wrapper"></div>' +
        '<div class="timeline__nav forward">' +
            '<abbr title="navegació per hores">&raquo;</abbr>' +
        '</div>';

        this.el.addEventListener("change", function (ev) {
            if (self.randomNav) {
                ev.detail.type = "hour";
                self.randomNav = false;
            }
        }, true);

        Array.apply(null, this.el.getElementsByClassName('timeline__nav')).map(function (el) {
            el.addEventListener('click', function () {
                if (el.getAttribute('class').indexOf('forward') > 0) {
                    self.model.hour = 1*self.model.hour.replace(/h0?/, '') + 1;
                } else {
                    self.model.hour = 1*self.model.hour.replace(/h0?/, '') - 1;
                }
                self.onClick();
            });
        });
    }

    TimeLine.prototype.parseDay = function (index) {
        return (String(index).length == 1 ? '0'+index : index) + ':00';
    }

    TimeLine.prototype.render = function render () {
        var self = this;

        var hoursWrapper = this.el.getElementsByClassName('timeline__hours-wrapper')[0];
        hoursWrapper.innerHTML = "";

        var hourEl, row;
        this.model.getHours().map(function (hour, i, hours) {
            if (!row || i == Math.ceil(hours.length/2)) {
                row = document.createElement('div');
                row.setAttribute('class', 'timeline__hours-row');
                hoursWrapper.appendChild(row);
            }
            hourEl = document.createElement('div');
            hourEl.classList.add('hour');
            hourEl.innerText = self.parseDay(hour);
            hourEl.setAttribute('data-hour', hour);
            hourEl.addEventListener('click', function (ev) {
                var hour = ev.currentTarget.getAttribute('data-hour');
                if (hour != parseInt(self.model.hour.replace(/h0?/, ''))) {
                    self.randomNav = true;
                    self.model.hour = hour;
                };
                self.onClick();
            });
            row.appendChild(hourEl);
        });

        this.el.getElementsByClassName('hour')[0].classList.add('active');
    }

    return TimeLine;
})();
},{"../models/timeline.js":10}]},{},[8]);
