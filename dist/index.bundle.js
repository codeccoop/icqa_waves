(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function BBox (features) {

    this._bbox = {
        SW: [180, 90],
        NE: [-180, -90]
    };

    function __init (features) {
        var geom, coords, segment, polygon;
        for (var i=0;i<features.length;i++) {
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
    
    __init.call(this, features);
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
    window.__animate = this.animate.bind(this);
    window.__render = this.render.bind(this);
    
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.5,
        50000
    );
    this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0, -6000, 2000);
    
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio*options.resolutionFactor);
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
        return (((value-domain[0])/_domain)*_range)-_range/2;
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

function Geojson2Three (scene, options) {
    if (!scene) {
        throw new Error('scene are required!');
    }
    
    this.scene = scene || window.scene;
    
    // OPTIONS BINDING
    options = options || new Object();
    this.resolutionFactor = options.resolutionFactor || 1;
    this.zScale = options.zScale || function () { return 0 };
    this.env = options.env;
    
    this.objects = new Array();
}

Geojson2Three.prototype.fitEnviron = function () {
    if (!this.srcData) throw new Error("You must bind data before");
    this.offset = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
    this.bbox = new BBox(this.srcData).get();
    console.log(this.bbox);
    this.projection = Projection(this.offset);
    this.scaleX = Scale([0, this.offset], this.projection([this.bbox.SW[0], this.bbox.NE[0]]));
    this.scaleY = Scale([0, this.offset], this.projection([this.bbox.SW[1], this.bbox.NE[1]]));
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
            z_coordinate = this.zScale(feat);
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
    var screen_coordinates, polygon, segment, coordinates, z_coordinate;
    if (!this.srcData) {
        throw new Error("You should bind data before draw");
    } else {
        this.clear();
    }

    for (var i=0; i<this.srcData.length; i++) {
        screen_coordinates = new Array();
        geom = this.srcData[i].geometry;
        feat = this.srcData[i];
        z_coordinate = this.zScale(this.srcData[i]);
        if (geom.type == 'Point') {
            var point = this.Point(this.project(geom.coordinates, z_coordinate), options);
            this.objects.push(point);
            point.draw();
        } else if (geom.type == 'MultiPoint') {
            for (var i=0;i<geom.coordinates.length;i++) {
                var point = this.Point(this.project(geom.coordinates[i], z_coordinate), options);
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
            throw new Error('The geoJSON is not valid.');
        }
    }
    return this;
}

Geojson2Three.prototype.project = function (coords, z_coordinate) {
    var projected = this.projection(coords);
    return [this.scaleX(projected[0])*this.resolutionFactor, this.scaleY(projected[1])*this.resolutionFactor, z_coordinate * this.resolutionFactor || 0];
}

Geojson2Three.prototype.Point = function (sc, options) {
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
    options = Object.keys(options).reduce(function (a, k) {
        a[k] = typeof options[k] === "function" ? options[k](feature) : options[k];
        return a;
    }, new Object());
    
    var material = new THREE.PointsMaterial(options);
    material.name = name || uid();
    return material;
}

Geojson2Three.prototype.LineMaterial = function (options, feature, name) {
    options = Object.keys(options).reduce(function (a, k) {
        a[k] = typeof options[k] === "function" ? options[k](feature) : options[k];
        return a;
    }, new Object());
    
    var material = new THREE.LineBasicMaterial(options);
    material.name = name || uid();
    return material;
}

Geojson2Three.prototype.BasicMaterial = function (options, feature, name) {
    options = Object.keys(options).reduce(function (a, k) {
        a[k] = typeof options[k] === "function" ? options[k](feature) : options[k];
        return a;
    }, new Object());

    var material = new THREE.MeshBasicMaterial(options);
    material.name = name || uid();
    return material;
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

Geojson2Three.prototype.Polygon = function (sc, options, feature) {
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
exports.request = function request (URL, callback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", URL, true);
    ajax.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                callback(JSON.parse(this.response));
                } else {
                console.log('error while fetchign json data');
                }
        }
    }
    ajax.send();    
}

exports.lerpColor = function lerpColor (a, b, amount) { 
    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

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


var g2t;
function requestData (year, month, day, hour) {
    var url = `data/contours/10/8/contours_${year}-${month}-${day}_${hour}.geojson`;
    return request(url, function (geojson) {
        if (g2t) {
            g2t.data(geojson).draw({
                color: function (feat) {
                    return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/200);
                },
                linewidth: 1,
                linecap: 'round',
                linejoin:  'round'
            });
            env.render();
            env.animate();
        } else {
            g2t = new Geojson2Three(env.scene, {
                resolutionFactor: 5,
                zScale: function (feature) {
                    return feature.properties.icqa * 2;
                },
                env: env
            }).data(geojson)
            .fitEnviron()
            .draw({
                color: function (feat) {
                    return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/200);
                },
                linewidth: 1,
                linecap: 'round',
                linejoin:  'round'
            });
            env.render();
            env.animate();
        }
    });
}

var dateTime = new DateTime(requestData);
var env = new Environ({resolutionFactor: 5});

requestData(2019, 1, 1, 'h01');
request('data/municipis.geojson', function (geojson) {
    new Geojson2Three(env.scene, {
        resolutionFactor: 5,
        zScale: 0,
        env: env
    }).data(geojson)
    .fitEnviron()
    .draw({
        color: 0xffffff,
        transparent: true,
        opacity: .0
    });
    // g2t.draw(function (feature) {
    //     return 0;
    //  }, {
    //     color: 0xffffff
    // });
    env.render();
    env.animate();
    // dateTime.start();
});

// var i = 0, url, g2t;
// var interval = setInterval(function () {
//     url = 'data/icqa/contours/10/8/'+files[i%files.length];
//     request(url, function (geojson) {
//         if (g2t) {
//             // g2t.update(geojson, {
//             //     color: function (feat) {
//             //         return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/70);
//             //     }
//             // });
//             g2t.data(geojson).draw({
//                 color: function (feat) {
//                     return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/80);
//                 }
//             });
//             env.render();
//             env.animate();
//         } else {
//             g2t = new Geojson2Three(env.scene, {
//                 resolutionFactor: 5,
//                 zScale: function (feature) {
//                     return feature.properties.icqa * 2;
//                 },
//                 env: env
//             }).data(geojson)
//             .fitEnviron()
//             .draw({
//                 color: function (feat) {
//                     return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/70);
//                 }
//             });

//             env.render();
//             env.animate();
//         }
//     });
    // i++;
// }, 1000);

// function stopInterval () {
//     clearInterval(interval);
// }
},{"./geojson2three/components/Environ.js":3,"./geojson2three/main.js":6,"./helpers.js":7,"./views/datetime.js":12}],9:[function(require,module,exports){
module.exports = (function () {
    
    var _calendar,
        _year,
        _state = {year: 2019, month: 0, day: 1};

    Object.freeze(_state);

        
    var month,
        date,
        day,
        weekArray = new Array(),
        monthArray = new Array();

    _calendar = Array.apply(null, Array(365)).reduce(function (acum, d, i) {
        date = new Date("2019");
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

    var dates = (function () {
        var day, month, year;
        return (function* () {
            while (true) {
                day = _state.day + 1;
                month = _state.month;
                year = _state.year;
                
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

    function Calendar () {
        Object.defineProperty(this, 'date', {
            set: function (val) {
                _state = Object.keys(val).reduce(function (acum, key) {
                    acum[key] = val[key] || _state[key];
                    return acum;
                }, new Object());
                Object.freeze(_state);
            },
            get: function () {
                return _state;
            }
        })
    }

    Calendar.prototype.getYear = function getMatrix () {
        return _year;
    }
    
    Calendar.prototype.getCalendar = function getWeeked () {
        return _calendar;
    }

    Calendar.prototype.getMonth = function getMonth () {
        return _year[this.date.month];
    }

    Calendar.prototype.next = function next () {
        _state = dates.next().value;
        Object.freeze(_state);
        return _state;
    }

    return Calendar;
})();
},{}],10:[function(require,module,exports){
module.exports = (function () {

    var _hour = 0;
    var hours = (function () {
        return (function* () {
            while (true) {
                yield (_hour + 1)%24;
            }
        })();
    })();

    function format (hour) {
        return 'h' + (String(hour).length == 1 ? '0'+hour : hour);
    }

    function TimeLine () {
        Object.defineProperty(this, 'hour', {
            get: function () {
                return format(_hour+1);
            },
            set: function (val) {
                _hour = val-1;
            }
        });
    }

    TimeLine.prototype.next = function next () {
        _hour = hours.next().value;
        return format(_hour+1);
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
    
    function Calendar (onClick) {

        this.model = new CalendarModel();
        this.onClick = onClick;
        this.el = document.getElementById('calendar');
        this.el.innerHTML = '<div class="calendar-content"></div>';
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
        var calendarBody = this.el.children[0],
            weekRow,
            monthHeader;

        var monthHeader = document.createElement('div');
        monthHeader.classList.add('calendar__month-header');
        monthHeader.innerText = this.parseMonth(this.model.date.month);
        calendarBody.appendChild(monthHeader);

        var daysWrapper = document.createElement('div');
        daysWrapper.classList.add('calendar__days-wrapper');
        calendarBody.appendChild(daysWrapper);

        this.model.getMonth().map(function (day) {
            var dayEl = document.createElement('div');
            dayEl.classList.add('day');
            dayEl.innerText = day;
            dayEl.setAttribute('data-day', day);
            dayEl.setAttribute('data-month', self.model.date.month+1);
            dayEl.setAttribute('data-year', 2019);
            dayEl.addEventListener('click', function (ev) {
                var year = ev.currentTarget.getAttribute('data-year');
                var month = ev.currentTarget.getAttribute('data-month');
                var day = ev.currentTarget.getAttribute('data-day');    
                self.model.date = {
                    year: year,
                    month: month-1,
                    day: day
                };
                self.onClick(self.model.date);
            });
            daysWrapper.appendChild(dayEl);
        });

        // this.model.getCalendar().map((month, monthN) => {
        //     monthHeader = document.createElement('div');
        //     monthHeader.innerHTML = '<p>'+(monthN+1)+'</th>';
        //     calendarBody.appendChild(monthHeader);
        //     month.map((week, weekN) => {
        //         weekRow = document.createElement('tr');
        //         if (week.length != 7) {
        //             if (weekN == 0) {
        //                 week = Array.apply(null, Array(7 - week.length)).map(d => '').concat(week);
        //             } else {
        //                 week = week.concat(Array.apply(null, Array(7 - week.length)).map(d => ''));
        //             }
        //         }
        //         week.map(day => {
        //             var dayData = document.createElement('td');
        //             if (day !== '') {
        //                 dayData.setAttribute('data-day', day);
        //                 dayData.setAttribute('data-month', monthN+1);
        //                 dayData.setAttribute('data-year', 2019);
        //                 dayData.addEventListener('click', function (ev) {
        //                     var year = ev.currentTarget.getAttribute('data-year');
        //                     var month = ev.currentTarget.getAttribute('data-month');
        //                     var day = ev.currentTarget.getAttribute('data-day');    
        //                     self.model.date = {
        //                         year: year,
        //                         month: month-1,
        //                         day: day
        //                     };
        //                     self.onClick(self.model.date);
        //                 });
        //                 dayData.classList.add('day');
        //             }
        //             dayData.innerHTML = day;
        //             weekRow.appendChild(dayData);
        //         });
        //         calendarBody.appendChild(weekRow);
        //     });
        // });

        this.el.getElementsByClassName('day')[0].classList.add('active');
    }

    return Calendar;
})();
},{"../models/calendar.js":9}],12:[function(require,module,exports){
var CalendarView = require('./calendar.js');
var TimeLineView = require('./timeline.js');

module.exports = (function () {
    
    var interval;

    function onCalendarClick (date) {
        this.stop();
        var hour = this.timeLineView.model.hour;
        this.onChange(date.year, Number(date.month)+1, date.day, hour);
    }
    
    function onTimeLineClick (hour) {
        this.stop();
        var date = this.calendarView.model.date;
        this.onChange(date.year, Number(date.month)+1, date.day, hour);
    }

    function DateTime (onChange) {
        var self = this;
        this.onChange = function (year, month, day, hour) {
            Array.apply(null, self.calendarView.el.getElementsByClassName('day')).map(function (el) {
                if (el.getAttribute('data-year') == year && el.getAttribute('data-month') == month && el.getAttribute('data-day') == day) {
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
            onChange.apply(null, arguments);
        };
        this.calendarView = new CalendarView(onCalendarClick.bind(this));
        this.calendarView.render();
        this.timeLineView = new TimeLineView(onTimeLineClick.bind(this));
        this.timeLineView.render();
    }

    DateTime.prototype.start = function start () {
        var self = this;
        var hour, date;
        interval = setInterval(function () {
            hour = self.timeLineView.model.next();
            if (hour == 'h01') {
                date = self.calendarView.model.next();
            } else {
                date = self.calendarView.model.date;
            }

            self.onChange(date.year, Number(date.month)+1, date.day, hour);
        }, 1000);
    }

    DateTime.prototype.stop = function stop () {
        clearInterval(interval);
    }

    return DateTime;
})();
},{"./calendar.js":11,"./timeline.js":13}],13:[function(require,module,exports){
var TimeLineModel = require('../models/timeline.js');

module.exports = (function () {
    
    function TimeLine (onClick) {
    
        this.model = new TimeLineModel();
        this.onClick = onClick;
        this.el = document.getElementById('timeline');
        this.el.innerHTML = '<div class="timeline-content"></div>';

        var timelineBody = this.el.children[0];
        timelineBody.innerHTML = '<div class="timeline__nav backward">&laquo;</div><div class="timeline__hours-wrapper"></div><div class="timeline__nav forward">&raquo;</div>';
    }

    TimeLine.prototype.parseDay = function (index) {
        return (String(index).length == 1 ? '0'+index : index) + ':00';
    }

    TimeLine.prototype.render = function render () {
        var self = this;

        var hoursWrapper = this.el.getElementsByClassName('timeline__hours-wrapper')[0];

        var hourEl;
        this.model.getHours().map(function (hour) {
            hourEl = document.createElement('div');
            hourEl.classList.add('hour');
            hourEl.innerText = self.parseDay(hour);
            hourEl.setAttribute('data-hour', hour);
            hourEl.addEventListener('click', function (ev) {
                var hour = ev.currentTarget.getAttribute('data-hour');
                self.model.hour = hour;
                self.onClick(self.model.hour);
            });
            hoursWrapper.appendChild(hourEl);
        });

        this.el.getElementsByClassName('hour')[0].classList.add('active');

        Array.apply(null, this.el.getElementsByClassName('timeline__nav')).map(function (el) {
            el.addEventListener('click', function () {
                debugger;
                el.getAttribute('class').indexOf('forward') > 0 ?
                    self.model.hour = self.model.hour + 1 :
                    self.model.hour = self.model.hour - 1;

                self.onClick(self.model.hour);
            });
        })
    }

    return TimeLine;
})();
},{"../models/timeline.js":10}]},{},[8]);
