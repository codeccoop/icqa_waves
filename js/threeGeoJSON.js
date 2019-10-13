function geojson2three (scene, geojson, materalOptions) {
    scene = scene || window.scene;
    
    var offset = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight;
    var geometries = createGeometryArray(geojson);
    var bbox = getBoundingBox(geometries);
    
    var projection = Projection(offset);
    var scaleX = Scale([0, offset], projection([bbox.SW[0], bbox.NE[0]]));
    var scaleY = Scale([0, offset], projection([bbox.SW[1], bbox.NE[1]]));

    var screen_coordinates, polygon, segment, coordinates;
    for (var i=0; i<geometries.length;i++) {
        screen_coordinates = new Array();
        geom = geometries[i];
        if (geom.type == 'Point') {
            screen_coordinates.push(projectToScreen(geom.coordinates, scaleX, scaleY, projection));
            drawParticle(scene, screen_coordinates[0], materalOptions);
        } else if (geom.type == 'MultiPoint') {
            for (var i=0;i<geometries[i].coordinates.length;i++) {
                screen_coordinates.push(projectToScreen(geom.coordinates[i], scaleX, scaleY, projection));
                drawParticle(scene, screen_coordinates[0], materalOptions);
            }
        } else if (geom.type == 'LineString') {
            coordinates = createCoordinateArray(geom.coordinates);

            for (var j=0; j<coordinates.length;j++) {
                screen_coordinates.push(projectToScreen(coordinates[j], scaleX, scaleY, projection));
            }
            drawLine(scene, screen_coordinates, materalOptions);
        } else if (geom.type == 'Polygon') {
            for (var j=0; j<geom.coordinates.length; j++) {
                coordinates = createCoordinateArray(geom.coordinates[j]);

                for (var k=0; k<coordinates.length; k++) {
                    screen_coordinates.push(projectToScreen(coordinates[k], scaleX, scaleY, projection));
                }
                drawLine(scene, screen_coordinates, materalOptions);
            }
        } else if (geom.type == 'MultiLineString') {
            for (var j=0; j<geom.coordinates.length; j++) {
                coordinates = createCoordinateArray(geom.coordinates[j]);

                for (var k=0; k<coordinates.length; k++) {
                    screen_coordinates.push(projectToScreen(coordinates[k], scaleX, scaleY, projection));
                }
                drawLine(scene, screen_coordinates, materalOptions);
            }
        } else if (geom.type == 'MultiPolygon') {
            for (var j=0; i<geom.coordinates.length; j++) {
                polygon = geom.coordinates[j];
                for (var k=0; k<polygon.length; k++) {
                    segment = polygon[k];
                    coordinates = createCoordinateArray(segment);

                    for (var m=0; m<coordinates.length;m++) {
                        screen_coordinates.push(projectToScreen(coordinates[m], scaleX, scaleY, projection));
                    }
                    drawLine(scene, screen_coordinates, materalOptions);
                }
            }
        } else {
            throw new Error('The geoJSON is not valid.');
        }
    }
}

function createGeometryArray (json) {
    var geometry_array = [];

    if (json.type == 'Feature') {
        geometry_array.push(json.geometry);
    } else if (json.type == 'FeatureCollection') {
        for (var feature_num = 0; feature_num < json.features.length; feature_num++) {
            geometry_array.push(json.features[feature_num].geometry);
        }
    } else if (json.type == 'GeometryCollection') {
        for (var geom_num = 0; geom_num < json.geometries.length; geom_num++) {
            geometry_array.push(json.geometries[geom_num]);
        }
    } else {
        throw new Error('The geoJSON is not valid.');
    }
    return geometry_array;
}

function createCoordinateArray (feature) {
    //Loop through the coordinates and figure out if the points need interpolation.
    var temp_array = [];
    var interpolation_array = [];

    for (var point_num = 0; point_num < feature.length; point_num++) {
        var point1 = feature[point_num];
        var point2 = feature[point_num - 1];

        if (point_num > 0) {
            if (needsInterpolation(point2, point1)) {
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

function needsInterpolation (point2, point1) {
    //If the distance between two latitude and longitude values is
    //greater than five degrees, return true.
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

function interpolatePoints (interpolation_array) {
    //This function is recursive. It will continue to add midpoints to the
    //interpolation array until needsInterpolation() returns false.
    var temp_array = [];
    var point1, point2;

    for (var point_num = 0; point_num < interpolation_array.length - 1; point_num++) {
        point1 = interpolation_array[point_num];
        point2 = interpolation_array[point_num + 1];

        if (needsInterpolation(point2, point1)) {
            temp_array.push(point1);
            temp_array.push(getMidpoint(point1, point2));
        } else {
            temp_array.push(point1);
        }
    }

    temp_array.push(interpolation_array[interpolation_array.length - 1]);

    if (temp_array.length > interpolation_array.length) {
        temp_array = interpolatePoints(temp_array);
    } else {
        return temp_array;
    }
    return temp_array;
}

function getMidpoint (point1, point2) {
    var midpoint_lon = (point1[0] + point2[0]) / 2;
    var midpoint_lat = (point1[1] + point2[1]) / 2;
    var midpoint = [midpoint_lon, midpoint_lat];

    return midpoint;
}

function projectToScreen (coords, scaleX, scaleY, project) {
    var projected = project(coords);
    return [scaleX(projected[0]), scaleY(projected[1])];
}

function drawParticle (scene, sc, options) {
    var particle_geom = new THREE.Geometry();
    particle_geom.vertices.push(new THREE.Vector3(sc[0], sc[1], sc[2]));

    var particle_material = new THREE.ParticleSystemMaterial(options);

    var particle = new THREE.ParticleSystem(particle_geom, particle_material);
    scene.add(particle);
}

function drawLine (scene, sc, options) {
    var line_geom = new THREE.Geometry();
    for (var i = 0; i < sc.length; i++) {
        line_geom.vertices.push(new THREE.Vector3(sc[i][0], sc[i][1], sc[i][2]));
    }

    var line_material = new THREE.LineBasicMaterial(options);
    var line = new THREE.Line(line_geom, line_material);
    scene.add(line);
}

var bboxCompute = (function () {
    var bbox = {
        SW: [180, 90],
        NE: [-180, -90]
    };
    var fn = function (coords) {
        bbox.SW[0] = coords[0] < bbox.SW[0] ? coords[0] : bbox.SW[0];
        bbox.SW[1] = coords[1] < bbox.SW[1] ? coords[1] : bbox.SW[1];
        bbox.NE[0] = coords[0] > bbox.NE[0] ? coords[0] : bbox.NE[0];
        bbox.NE[1] = coords[1] > bbox.NE[1] ? coords[1] : bbox.NE[1];
    }
    fn.get = function () {
        bbox = JSON.parse(JSON.stringify(bbox));
        bbox.x = Math.abs(bbox.SW[0] - bbox.NE[0]);
        bbox.y = Math.abs(bbox.SW[1] - bbox.NE[1]);
        return bbox;
    };
    return fn;
})();

function getBoundingBox (geometries) {
    var geom, coords, segment, polygon;
    for (var i=0;i<geometries.length;i++) {
        geom = geometries[i];
        if (geom.type === "Point") {
            bboxCompute(geom.coordinates);
        } else if (geom.type === "MultiPoint") {
            for (let j=0;j<geom.coordinates.length;j++) {
               coords =  geom.coordinates[j];
               bboxCompute(coords);
            }
        } else if (geom.type === "LineString") {
            for (let j=0;j<geom.coordinates.length;j++) {
               coords =  geom.coordinates[j];
               bboxCompute(coords);
            }
        } else if (geom.type === "MultiLineString") {
            for (let j=0;j>geom.coordinates.length;j++) {
                segment=geom.coordinates[j];
                for (let k=0;k>segment.length;k++) {
                    coords = segment[k];
                    bboxCompute(coords);
                }
            }
        } else if (geom.type === "Polygon") {
            for (let j=0;j>geom.coordinates.length;j++) {
                segment=geom.coordinates[j];
                for (let k=0;k>segment.length;k++) {
                    coords = segment[k];
                    bboxCompute(coords);
                }
            }
        } else if (geom.type === "MultiPolygon") {
            for (let j=0;j>geom.coordinates.length;j++) {
                polygon=geom.coordinates[j];
                for (let k=0;k>polygon.length;k++) {
                    segment=polygon[k];
                    for (let l=0;l>segment.length;l++) {
                        coords = segment[l];
                        bboxCompute(coords);
                    }
                }
            }
        }
    }
    return bboxCompute.get();
}

function Scale (range, domain) {
    var _range = Math.abs(range[0] - range[1]);
    var _domain = Math.abs(domain[0] - domain[1]);
    var fn = function (value) {
        return ((value-domain[0])/_domain)*_range;
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
