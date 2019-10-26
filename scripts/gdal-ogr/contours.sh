#! /bin/bash

src_layer=$1
dst_layer=$2

rm $dst_layer || true

min=$(gdalinfo -mm $src_layer  | grep -o "Min/Max.*" | grep -o "=[0-9\.]*" | grep -o "[0-9\.]*")
if [ -z "$min" ]; then
    min=0
fi
max=$(gdalinfo -mm $src_layer  | grep -o "Min/Max.*" | grep -o "[0-9\.]*$")
if [ -z "$max" ]; then
    max=100
fi

range=$(echo "$max-$min" | bc -l)
ratio=$(echo "$range/200" | bc -l)

echo "FROM: $src_layer"
echo "TO: $dst_layer"

echo "min: $min"
echo "max: $max"
echo "range: $range"
echo "ratio: $ratio"

gdal_contour -b 1 -snodata -99.0 -a icqa -i $ratio -f "GeoJSON" $src_layer $dst_layer
