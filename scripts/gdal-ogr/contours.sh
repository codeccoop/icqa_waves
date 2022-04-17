#! /bin/bash

src_layer=$1
dst_layer=$2

if [ -f "$dst_layer" ]; then
    rm $dst_layer
fi

regex="Min/Max=([0-9\.]+)"
if [[ "$(gdalinfo -mm $src_layer)" =~ $regex ]]; then
	min="${BASH_REMATCH[1]}"
else
	min=0
fi
# min=$(gdalinfo -mm $src_layer  | grep -o "Min/Max.*" | grep -o "=[0-9\.]*" | grep -o "[0-9\.]*")
# if [ -z "$min" ]; then
#     min=0
# fi

regex="Min/Max=[0-9\.]\,([0-9\.]+)"
if [[ "$(gdalinfo -mm $src_layer)" =~ $regex ]]; then
	max="${BASH_REMATCH[1]}"
else
	max=150
fi
# max=$(gdalinfo -mm $src_layer  | grep -o "Min/Max.*" | grep -o "[0-9\.]*$")
# if [ -z "$max" ]; then
#     max=100
# fi

range=$(echo "$max-$min" | bc -l)
ratio=$(echo "$range/100" | bc -l)

echo "FROM: $src_layer"
echo "TO: $dst_layer"

echo "min: $min"
echo "max: $max"
echo "range: $range"
echo "ratio: $ratio"

gdal_contour -b 1 -snodata -999.0 -a icqa -i $ratio -f "GeoJSON" $src_layer $dst_layer
