function Geojson2Three (scene, options) {
    if (!scene || !geojson) {
        throw new Error('scene and geojson are required!');
    }
    
    this.scene = scene || window.scene;
    
    // OPTIONS BINDING
    options = options || new Object();
    this.resolution = options.resolution || 1;
    this.zScale = options.zScale || function () { return 0 };
    
    this.materials = new Array();
    this.geoBuffers = new Array();
    this.objBuffers = new Array();
}

Geojson2Three.prototype.fitEnviron = function () {
    this.offset = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
    this.bbox = new BBox(this.geometries).get();
    this.projection = Projection(this.offset);
    this.scaleX = Scale([0, this.offset], this.projection([this.bbox.SW[0], this.bbox.NE[0]]));
    this.scaleY = Scale([0, this.offset], this.projection([this.bbox.SW[1], this.bbox.NE[1]]));
    return this;
}

Geojson2Three.prototype.data = function (geojson, id) {
    if (geojson) {
        id = id || function (d,i) { return i };
        this.geometries = this.createGeometryArray(geojson, id);
        this.data = geojson;
        return this;
    } else {
        return this.data;
    }
}

Geojson2Three.prototype.update = function (geojson) {
    var data, geom;
    if (this.data && this.data.length) {
        data = geojson.type == "FeatureCollection" ? 
            geojson.features : geojson.type == "GeometryCollection" ?
            geojson.geometries : geojson.type == "Feature" ? 
            [geojson] : null;
        if (data === null) throw new Error("GeoJSON not valid");
        for (var i=0; i<data.length; i++) {
            geom = this.geoBuffer[i];
            
        }
    }
}

Geojson2Three.prototype.draw = function (options) {
    var screen_coordinates, polygon, segment, coordinates, z_coordinate;
    if (!this.geometries) {
        throw new Error("You should bind data before draw");
    }
    for (var i=0; i<this.geometries.length; i++) {
        screen_coordinates = new Array();
        geom = this.geometries[i];
        feat = this.data[i];
        z_coordinate = this.zScale(this.data[i]);
        if (geom.type == 'Point') {
            screen_coordinates.push(this.projectToScreen(geom.coordinates, z_coordinate));
            this.drawPoint(screen_coordinates[0], options);
        } else if (geom.type == 'MultiPoint') {
            for (var i=0;i<geom.coordinates.length;i++) {
                screen_coordinates.push(this.projectToScreen(geom.coordinates[i], z_coordinate));
                this.drawPoint(screen_coordinates[0], options);
            }
        } else if (geom.type == 'LineString') {
            coordinates = this.createCoordinateArray(geom.coordinates);

            for (var j=0; j<coordinates.length;j++) {
                screen_coordinates.push(this.projectToScreen(coordinates[j], z_coordinate));
            }
            this.drawLine(screen_coordinates, options, feat);
        } else if (geom.type == 'Polygon') {
            for (var j=0; j<geom.coordinates.length; j++) {
                coordinates = this.createCoordinateArray(geom.coordinates[j]);

                for (var k=0; k<coordinates.length; k++) {
                    screen_coordinates.push(this.projectToScreen(coordinates[k, z_coordinate]));
                }
                this.drawLine(screen_coordinates, options);
            }
        } else if (geom.type == 'MultiLineString') {
            for (var j=0; j<geom.coordinates.length; j++) {
                coordinates = this.createCoordinateArray(geom.coordinates[j]);

                for (var k=0; k<coordinates.length; k++) {
                    screen_coordinates.push(this.projectToScreen(coordinates[k], z_coordinate));
                }
                drawLine(screen_coordinates, options);
            }
        } else if (geom.type == 'MultiPolygon') {
            for (var j=0; i<geom.coordinates.length; j++) {
                polygon = geom.coordinates[j];
                for (var k=0; k<polygon.length; k++) {
                    segment = polygon[k];
                    coordinates = this.createCoordinateArray(segment);

                    for (var m=0; m<coordinates.length;m++) {
                        screen_coordinates.push(this.projectToScreen(coordinates[m], z_coordinate));
                    }
                    this.drawLine(screen_coordinates, options);
                }
            }
        } else {
            throw new Error('The geoJSON is not valid.');
        }
    }
    return this;
}



Geojson2Three.prototype.createGeometryArray = function (geojson, id) {
    var geometry_array = [];
    this.data = new Array();
    
    if (geojson.type == 'Feature') {
        geojson._id = id(geojson);
        geometry_array.push(geojson.geometry);
        this.data.push(geojson);
    } else if (geojson.type == 'FeatureCollection') {
        for (var i=0; i<geojson.features.length; i++) {
            geojson.features[i]._id = id(geojson.features[i]);
            geometry_array.push(geojson.features[i].geometry);
            this.data.push(geojson.features[i]);
        }
    } else if (geojson.type == 'GeometryCollection') {
        for (var i=0; i<geojson.geometries.length; i++) {
            geojson.geometries[i]._id = id(geojson.geometries[i]);
            geometry_array.push(geojson.geometries[i]);
            this.data.push(geojson.geometries[i]);
        }
    } else {
        throw new Error('The geoJSON is not valid.');
    }
    return geometry_array;
}

Geojson2Three.prototype.createCoordinateArray = function (feature) {
    var temp_array = [];
    var interpolation_array = [];

    for (var point_num = 0; point_num < feature.length; point_num++) {
        var point1 = feature[point_num];
        var point2 = feature[point_num - 1];

        if (point_num > 0) {
            if (this.needsInterpolation(point2, point1)) {
                interpolation_array = [point2, point1];
                interpolation_array = interpolatePoints(interpolation_array);

                for (var inter_point_num = 0; inter_point_num < interpolation_array.length; inter_point_num++) {
                    temp_array.push(interpolation_array[inter_point_num]);
                }
            } else {
                temp_array.push(point1);
            }
        } else {
            temp_array.push(point1);
        }
    }
    return temp_array;
}

Geojson2Three.prototype.needsInterpolation = function (point2, point1) {
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

Geojson2Three.prototype.interpolatePoints = function (interpolation_array) {
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

Geojson2Three.prototype.getMidpoint = function (point1, point2) {
    var midpoint_lon = (point1[0] + point2[0]) / 2;
    var midpoint_lat = (point1[1] + point2[1]) / 2;
    var midpoint = [midpoint_lon, midpoint_lat];

    return midpoint;
}

Geojson2Three.prototype.projectToScreen = function (coords, z_coordinate) {
    var projected = this.projection(coords);
    return [this.scaleX(projected[0])*this.resolution, this.scaleY(projected[1])*this.resolution, z_coordinate || 0];
}

Geojson2Three.prototype.drawPoint = function (sc, options) {
    var point_geom = new THREE.Geometry();
    this.geoBuffers.push(point_geom);
    point_geom.vertices.push(new THREE.Vector3(sc[0], sc[1], sc[2]));

    if (this.material === null) {
        options = Object.keys(options).reduce(function (a, k) {
            a[k] = typeof options[k] === "function" ? options[k](feature) : options[k];
            return a;
        }, new Object());
        this.material = new THREE.PointsMaterial(options);
    }

    var point = new THREE.Points(point_geom, this.material);
    this.objBuffers.push(point);
    
    this.scene.add(point);
    return this;
}

Geojson2Three.prototype.drawLine = function (sc, options, feature) {
    var line_geom = new THREE.Geometry();
    for (var i = 0; i < sc.length; i++) {
        line_geom.vertices.push(new THREE.Vector3(sc[i][0], sc[i][1], sc[i][2]));
    }
    this.geoBuffers.push(line_geom);
    
    options = Object.keys(options).reduce(function (a, k) {
        a[k] = typeof options[k] === "function" ? options[k](feature) : options[k];
        return a;
    }, new Object());
    var line_material = new THREE.LineBasicMaterial(options);
    this.materials.push(line_material);
    
    var line = new THREE.Line(line_geom, line_material);
    line.name = 'line_'+Date.now();
    this.objBuffers.push(line);
    
    this.scene.add(line);
    return this;
}

Geojson2Three.prototype.clear = function () {
    this.objBuffers.map(function (obj) {
        obj = this.scene.getObjectByName(obj.name);
        this.scene.remove(obj);
    });
    this.materials.map(function (mat) {
        mat.dispose();
    });
    this.geoBuffers.map(function (geom) {
        geom.dispose();
    });
    return this;
};


function BBox (geometries) {

    this._bbox = {
        SW: [180, 90],
        NE: [-180, -90]
    };

    function __init (geometries) {
        var geom, coords, segment, polygon;
        for (var i=0;i<geometries.length;i++) {
            geom = geometries[i];
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
    
    __init.call(this, geometries);
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

function Projection (offset) {
    return function (coords) {
        return [(coords[0]/180)*offset, (coords[1]/180)*offset];
    }
}
