#! /bin/bash

src_layer=$1
dst_layer=$2
z_field=$3

echo "FROM: $src_layer"
echo "TO: $dst_layer"
echo "ZFIELD: $z_field"

gdal_grid -ot "Float32"  -of "GTiff" -zfield "$z_field" -outsize 1000 1000 -a "invdist:radius1=0.0:radius2=0.0:max_points=10:min_points=2:nodata=-99.0" "$src_layer" "$dst_layer"
