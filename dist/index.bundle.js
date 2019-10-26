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
                for (let j=0;j>geom.coordinates.length;j++) {
                    segment=geom.coordinates[j];
                    for (let k=0;k>segment.length;k++) {
                        coords = segment[k];
                        this.update(coords);
                    }
                }
            } else if (geom.type === "Polygon") {
                for (let j=0;j>geom.coordinates.length;j++) {
                    segment=geom.coordinates[j];
                    for (let k=0;k>segment.length;k++) {
                        coords = segment[k];
                        this.update(coords);
                    }
                }
            } else if (geom.type === "MultiPolygon") {
                for (let j=0;j>geom.coordinates.length;j++) {
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
},{}],7:[function(require,module,exports){
var Geojson2Three = require('./main');
var Environ = require('./components/Environ');
var { request, lerpColor } = require('./helpers');
var Calendar = require('./views/calendar');

function requestData (month, day) {
    var url = `data/icqa/contours/10/8/contours_h${(String(day).length == 1 ? '0'+day : day)}_2019-${month}-1.geojson`;
    request(url, function (geojson) {
        if (g2t) {
            g2t.data(geojson).draw({
                color: function (feat) {
                    return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/80);
                }
            });
            env.render();
            env.animate();
        } else {
            g2t = new Geojson2Three(env.scene, {
                resolutionFactor: 3,
                zScale: function (feature) {
                    return feature.properties.icqa * 2;
                },
                env: env
            }).data(geojson)
            .fitEnviron()
            .draw({
                color: function (feat) {
                    return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/70);
                }
            });
            env.render();
            env.animate();
        }
    });
}

var calendar = new Calendar(requestData);
var env = new Environ();

// var files = [
//     "contours_2019-1-1.geojson",
//     "contours_2019-1-2.geojson",
//     "contours_2019-1-3.geojson",
//     "contours_2019-1-4.geojson",
//     "contours_2019-1-5.geojson",
//     "contours_2019-1-6.geojson",
//     "contours_2019-1-7.geojson"
// ];
request('data/icqa/contours/10/8/contours_2019-1-1.geojson', function (geojson) {
    g2t = new Geojson2Three(env.scene, {
        resolutionFactor: 3,
        zScale: function (feature) {
            return feature.properties.icqa * 2;
        },
        env: env
    }).data(geojson)
    .fitEnviron()
    .draw({
        color: function (feat) {
            return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/70);
        }
    });

    env.render();
    env.animate();
});
request('data/municipis.geojson', function (geojson) {
    new Geojson2Three(env.scene, {
        resolutionFactor: 2,
        zScale: 0,
        env: env
    }).data(geojson)
    .fitEnviron()
    .draw({
        color: 'white'
    });
    // g2t.draw(function (feature) {
    //     return 0;
    //  }, {
    //     color: 0xffffff
    // });
    render();
    animate();
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
//                 resolutionFactor: 3,
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
},{"./components/Environ":3,"./helpers":6,"./main":8,"./views/calendar":9}],8:[function(require,module,exports){
var Scale = require('./components/Scale');
var Projection = require('./components/Projection');
var BBox = require('./components/BBox');
var Coordinates = require('./components/Coordinates');
var { uid } = require('./helpers');

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
                    var line = this.Line(coordinates.map(function (coord) {
                        return self.project(coord, z_coordinate);
                    }), options, feat);
                    object.geometry = line.geometry;
                    object.material = line.material;
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

        // this.env.render();
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
                var line = this.Line(coordinates.map(function (coord) {
                    return self.project(coord, z_coordinate);
                }), options, feat);
                this.objects.push(line);
                line.draw();
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
            for (var j=0; i<geom.coordinates.length; j++) {
                polygon = geom.coordinates[j];
                for (var k=0; k<polygon.length; k++) {
                    segment = polygon[k];
                    coordinates = new Coordinates(segment);
                    var line = this.Line(coordinates.map(function (coord) {
                        return self.project(coord, z_coordinate);
                    }), options, feat);
                    this.objects.push(line);
                    line.draw();
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

Geojson2Three.prototype.Line = function (sc, options, feature) {
    var name = uid();
    var line_geom = this.Geom(sc, name);
    line_geom.name = name;
    
    var line_material = this.LineMaterial(options, feature, name);
    line_material.name = name;
    
    var line = new THREE.Line(line_geom, line_material);
    line.name = name;

    var self = this;
    line.draw = function () {
        self.scene.add(line);
    }

    return line;
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
},{"./components/BBox":1,"./components/Coordinates":2,"./components/Projection":4,"./components/Scale":5,"./helpers":6}],9:[function(require,module,exports){
module.exports = function Calendar (onClick) {
    this.el = document.getElementById('calendar');
    this.el.innerHTML = '<table class="calendar"></table>'
    var months = Array.apply(null, Array(10)).map((d, i) => i+1);
    var days = Array.apply(null, Array(31)).map((d, i) => i+1);
    var calendarBody = this.el.children[0];

    var weeks = new Array();
    days.reduce((a,d,i) => {
        if (i % 7 != 0) {
            a.push(i+1);
        } else {
            weeks.push(a);
            a = new Array();
            a.push(i+1);
        }
        return a;
    }, new Array());

    console.log(weeks);
    
    months.map(month => {
        var monthHeader = document.createElement('tr');
        monthHeader.innerHTML = '<th>'+month+'</th>';
        calendarBody.appendChild(monthHeader);
        weeks.map(week => {
            var weekRow = document.createElement('tr');
            week.map(day => {
                var dayData = document.createElement('td');
                dayData.addEventListener('click', () => onClick(month, day));
                dayData.innerHTML = day;
                weekRow.appendChild(dayData);
            });
            calendarBody.appendChild(weekRow);
        });
    });
}
},{}]},{},[7]);
