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
                object.geometry = line.geometry;
                object.geometry.verticesNeedUpdate = true;
                object.material = line.material;
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
    return [this.scaleX(projected[0])*this.resolutionFactor, this.scaleY(projected[1])*this.resolutionFactor, z_coordinate || 0];
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
    this.objects.map(function (obj) {
        obj = this.scene.getObjectByName(obj.name);
        obj.geometry.dispose();
        obj.material.dispose();
        this.scene.remove(obj);
    });
    return this;
};

module.exports = Geojson2Three;