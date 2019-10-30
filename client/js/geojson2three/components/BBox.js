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