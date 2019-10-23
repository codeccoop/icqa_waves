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