// VENDOR
import {
  Points,
  Line,
  LineSegments,
  Mesh,
  BufferGeometry,
  Vector3,
  Shape,
  ShapeGeometry,
  EdgesGeometry,
  MeshLambertMaterial,
  LineBasicMaterial,
  PointsMaterial,
  BufferAttribute,
} from "three";

// SOURCE
import Scale from "./components/Scale.js";
import Projection from "./components/Projection.js";
import BBox from "./components/BBox.js";
import Coordinates from "./components/Coordinates.js";
import { uid } from "../helpers.js";

function Geojson2Three(env) {
  if (!env) {
    throw new Error("env are required!");
  }

  this.env = env;
  this.scene = env.scene || window.scene;
  if (!this.scene) {
    throw new Error("env are required!");
  }
  this.objects = new Array();
}

Geojson2Three.prototype.fitEnviron = function (z_field, settings) {
  var self = this;
  if (!this.srcData) throw new Error("You must bind data before");
  // if (!z_field) return this;

  settings = settings || new Object();

  this.filter =
    settings.filter ||
    function () {
      return true;
    };
  this.dataset = this.srcData.filter(this.filter);
  this.resolutionFactor = settings.resolutionFactor || 1;

  this.offset =
    window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
  this.projection = Projection(this.offset);

  this.scales = settings.scales || new Object();
  // this.filter = settings.filter || function () { return true; }
  this.bbox = new BBox(this.dataset, z_field).get();
  if (this.scales.relative === true && this.scales.range) {
    this.scales.range = this.bbox.Z;
  }

  this.scaleX = Scale(
    [0, this.offset],
    this.projection([this.bbox.SW[0], this.bbox.NE[0]])
  );
  this.scaleY = Scale(
    [0, this.offset],
    this.projection([this.bbox.SW[1], this.bbox.NE[1]])
  );
  this.scaleZ =
    (typeof settings.scaleZ == "function" &&
      function (feat) {
        return settings.scaleZ(feat, {
          bbox: self.bbox,
          scales: settings.scales,
        });
      }) ||
    function () {
      return 0;
    };

  return this;
};

Geojson2Three.prototype.data = function (geojson, id) {
  if (geojson) {
    id =
      id ||
      function (d, i) {
        return i;
      };
    this.srcData = new Array();
    if (geojson.type == "Feature") {
      geojson._id = id(geojson, 0);
      this.srcData.push(geojson);
    } else if (geojson.type == "FeatureCollection") {
      for (var i = 0; i < geojson.features.length; i++) {
        geojson.features[i]._id = id(geojson.features[i], i);
        this.srcData.push(geojson.features[i]);
      }
    } else if (geojson.type == "GeometryCollection") {
      for (var i = 0; i < geojson.geometries.length; i++) {
        geojson.geometries[i]._id = id(geojson.geometries[i], i);
        geojson.geometries[i].geometry = geojson.geometries[i];
        this.srcData.push(geojson.geometries[i]);
      }
    } else {
      throw new Error("The GeoJSON is not valid.");
    }
    return this;
  } else {
    return this.srcData;
  }
};

Geojson2Three.prototype.update = function (geojson, options) {
  if (this.srcData && this.srcData.length) {
    const data =
      geojson.type == "FeatureCollection"
        ? geojson.features
        : geojson.type == "GeometryCollection"
        ? geojson.geometries
        : geojson.type == "Feature"
        ? [geojson]
        : null;

    if (data === null) throw new Error("GeoJSON not valid");

    var oldSrcData = this.srcData;
    this.data(geojson, function (d, i) {
      return (oldSrcData[i] && oldSrcData[i]._id) || i;
    });

    for (let i = 0, feat, geom, z_coordinate, object; i < data.length; i++) {
      feat = this.dataset[i];
      geom = feat.geometry;
      z_coordinate = this.scaleZ(feat);
      object = this.objects[i];
      if (!object) return;
      object.geometry.dispose();

      if (geom.type == "Point") {
        const point = this.Point(this.project(geom.coordinates, z_coordinate), options);
        object.geometry = point.geometry;
        object.material = point.material;
      } else if (geom.type == "MultiPoint") {
        for (let i = 0, point; i < geom.coordinates.length; i++) {
          point = this.Point(this.project(geom.coordinates[i], z_coordinate), options);
          object.geometry = point.geometry;
          object.material = point.material;
        }
      } else if (geom.type == "LineString") {
        const coordinates = new Coordinates(geom.coordinates);
        const line = this.Line(
          coordinates.map(coord => {
            return this.project(coord, z_coordinate);
          }),
          options,
          feat
        );
        for (
          let from,
            to,
            i = 0,
            len = Math.max(
              line.geometry.vertices.length,
              object.geometry.vertices.length
            );
          i < len;
          i++
        ) {
          from = object.geometry.vertices[i];
          to = line.geometry.vertices[i];
          if (from && to) {
            from.setX(to.x);
            from.setY(to.y);
            from.setZ(to.z);
          } else if (to) {
            object.geometry.vertices.push(to);
          } else {
            object.geometry.vertices.slice(i, 1);
          }
        }
        object.geometry.verticesNeedUpdate = true;
        // object.material = line.material;
      } else if (geom.type == "Polygon") {
        for (let j = 0, polygon, coordinates; j < geom.coordinates.length; j++) {
          coordinates = new Coordinates(geom.coordinates[j]);
          polygon = this.Polygon(
            coordinates.map(coord => {
              return this.project(coord, z_coordinate);
            }),
            options,
            feat
          );
          object.geometry = polygon.geometry;
          object.material = polygon.material;
        }
      } else if (geom.type == "MultiLineString") {
        for (let j = 0, line, coordinates; j < geom.coordinates.length; j++) {
          coordinates = new Coordinates(geom.coordinates[j]);
          line = this.Line(
            coordinates.map(coord => {
              return this.project(coord, z_coordinate);
            }),
            options,
            feat
          );
          object.geometry = line.geometry;
          object.material = line.material;
        }
      } else if (geom.type == "MultiPolygon") {
        for (let j = 0, polygon, segment, coordinates; i < geom.coordinates.length; j++) {
          polygon = geom.coordinates[j];
          for (var k = 0; k < polygon.length; k++) {
            segment = polygon[k];
            coordinates = new Coordinates(segment);
            const line = this.Line(
              coordinates.map(coord => {
                return this.project(coord, z_coordinate);
              }),
              options,
              feat
            );
            object.geometry = line.geometry;
            object.material = line.material;
          }
        }
      } else {
        throw new Error("The geoJSON is not valid.");
      }
    }
  }
};

Geojson2Three.prototype.draw = function (options) {
  if (!this.dataset) {
    throw new Error("You should bind data before draw");
  } else {
    this.clear();
  }

  for (
    let i = 0, screen_coordinates, geom, feat, z_coordinate;
    i < this.dataset.length;
    i++
  ) {
    screen_coordinates = new Array();
    geom = this.dataset[i].geometry;
    feat = this.dataset[i];
    z_coordinate = this.scaleZ(this.dataset[i]);

    if (geom.type == "Point") {
      const point = this.Point(
        this.project(geom.coordinates, z_coordinate),
        options,
        feat
      );
      this.objects.push(point);
      point.draw();
    } else if (geom.type == "MultiPoint") {
      for (let j = 0, point; j < geom.coordinates.length; i++) {
        point = this.Point(
          this.project(geom.coordinates[j], z_coordinate),
          options,
          feat
        );
        this.objects.push(point);
        point.draw();
      }
    } else if (geom.type == "LineString") {
      const coordinates = new Coordinates(geom.coordinates);
      const line = this.Line(
        coordinates.map(coord => {
          return this.project(coord, z_coordinate);
        }),
        options,
        feat
      );
      this.objects.push(line);
      line.draw();
    } else if (geom.type == "Polygon") {
      for (let j = 0, polygon, coordinates; j < geom.coordinates.length; j++) {
        coordinates = new Coordinates(geom.coordinates[j]);
        polygon = this.Polygon(
          coordinates.map(coord => {
            return this.project(coord, z_coordinate);
          }),
          options,
          feat
        );
        this.objects.push(polygon);
        polygon.draw();
      }
    } else if (geom.type == "MultiLineString") {
      for (let j = 0, line, coordinates; j < geom.coordinates.length; j++) {
        coordinates = new Coordinates(geom.coordinates[j]);
        line = this.Line(
          coordinates.map(coord => {
            return this.project(coord, z_coordinate);
          }),
          options,
          feat
        );
        this.objects.push(line);
        line.draw();
      }
    } else if (geom.type == "MultiPolygon") {
      for (var j = 0, polygon, segment, coordinates; j < geom.coordinates.length; j++) {
        polygon = geom.coordinates[j];
        for (var k = 0; k < polygon.length; k++) {
          segment = polygon[k];
          coordinates = new Coordinates(segment);
          polygon = this.Polygon(
            coordinates.map(coord => {
              return this.project(coord, z_coordinate);
            }),
            options,
            feat
          );
          this.objects.push(polygon);
          polygon.draw();
        }
      }
    } else {
      throw new Error("The GeoJSON is not valid.");
    }
  }
  return this;
};

Geojson2Three.prototype.project = function (coords, z_coordinate) {
  const projected = this.projection(coords);
  return [
    this.scaleX(projected[0]) * this.resolutionFactor,
    this.scaleY(projected[1]) * this.resolutionFactor,
    z_coordinate * this.resolutionFactor || 0,
  ];
};

Geojson2Three.prototype.Point = function (sc, options, feature) {
  const name = uid();

  const point_geom = this.Geom(sc);
  point_geom.name = name;

  const point_material = this.PointMaterial(options, feature, name);
  point_material.name = name;

  const point = new Points(point_geom, this.material);
  point.name = name;

  point.draw = () => this.scene.add(point);

  return point;
};

Geojson2Three.prototype.Line = function (sc, options, feature) {
  const name = uid();
  const line_geom = this.Geom(sc, name);

  const line_material = this.LineMaterial(options, feature, name);

  const line = new Line(line_geom, line_material);
  line.name = name;

  line.draw = () => this.scene.add(line);

  return line;
};

Geojson2Three.prototype.Polygon = function (sc, options, feature, scales) {
  const name = uid();
  const polygon_geom = this.Shape(sc, name);
  const edges_geom = this.Edges(sc, name);

  const polygon_material = this.BasicMaterial(options, feature, name);
  const edges_material = this.LineMaterial(
    { color: 0xcccccc, linewidth: 1, linecap: "round", linejoin: "round" },
    feature,
    name
  );
  const polygon = new Mesh(polygon_geom, polygon_material);
  const edges = new LineSegments(edges_geom, edges_material);

  polygon.draw = () => {
    this.scene.add(polygon);
    this.scene.add(edges);
  };

  return polygon;
};

Geojson2Three.prototype.Geom = function (sc, name) {
  const geom = new BufferGeometry();
  const vertices = new Float32Array(
    sc.reduce((vertices, coord) => {
      for (let val of coord) {
        vertices.push(val);
      }
      return vertices;
    }, [])
  );
  geom.setAttribute("position", new BufferAttribute(vertices, 3));
  geom.computeBoundingSphere();
  geom.name = name || uid();
  return geom;
};

Geojson2Three.prototype.Shape = function (sc, name) {
  const shape = new Shape();
  sc.forEach(function (coord, i) {
    if (i == 0) {
      shape.moveTo(coord[0], coord[1]);
    } else {
      shape.lineTo(coord[0], coord[1]);
    }
  });

  const geometry = new ShapeGeometry(shape);
  geometry.name = name || uid();
  return geometry;
};

Geojson2Three.prototype.Edges = function (sc, name) {
  const shape = new Shape();
  sc.map(function (coord, i) {
    if (i == 0) {
      shape.moveTo(coord[0], coord[1]);
    } else {
      shape.lineTo(coord[0], coord[1]);
    }
  });

  const geometry = new EdgesGeometry(new ShapeGeometry(shape));
  geometry.name = name || uid();
  return geometry;
};

Geojson2Three.prototype.PointMaterial = function (options, feature, name) {
  options = Object.keys(options).reduce((a, k) => {
    a[k] =
      typeof options[k] === "function"
        ? options[k](feature, {
            scales: this.scales,
            bbox: this.bbox,
          })
        : options[k];
    return a;
  }, {});

  const material = new PointsMaterial(options);
  material.name = name || uid();
  return material;
};

Geojson2Three.prototype.LineMaterial = function (options, feature, name) {
  options = Object.keys(options).reduce((a, k) => {
    a[k] =
      typeof options[k] === "function"
        ? options[k](feature, {
            scales: this.scales,
            bbox: this.bbox,
          })
        : options[k];
    return a;
  }, {});

  const material = new LineBasicMaterial(options);
  material.name = name || uid();
  return material;
};

Geojson2Three.prototype.BasicMaterial = function (options, feature, name) {
  options = Object.keys(options).reduce((a, k) => {
    a[k] =
      typeof options[k] === "function"
        ? options[k](feature, {
            scales: this.scales,
            bbox: this.bbox,
          })
        : options[k];
    return a;
  }, new Object());

  const material = new MeshLambertMaterial(options);
  material.name = name || uid();
  return material;
};

Geojson2Three.prototype.clear = function () {
  this.objects.map(obj => {
    obj = this.scene.getObjectByName(obj.name);
    obj.geometry.dispose();
    obj.material.dispose();
    this.scene.remove(obj);
  });
  this.objects = new Array();
  return this;
};

export default Geojson2Three;
