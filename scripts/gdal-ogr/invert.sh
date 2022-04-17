#! /bin/bash

src_layer=$1
dst_layer=$2

regex="Min/Max=[0-9\.]+\,([0-9\.]+)"
if [[ "$(gdalinfo -mm $src_layer)" =~ $regex ]]; then
	max="${BASH_REMATCH[1]}"
else
	max=100
fi
# max=$(gdalinfo -mm $src_layer  | grep -o "Min/Max.*" | grep -o "[0-9\.]*$")
# if [ -z "$max" ]; then
#     max=100
# fi
# max=100

echo "FROM: $src_layer"
echo "TO: $dst_layer"
echo "MAX: $max"

gdal_calc.py --overwrite --NoDataValue=-999.0 -A $src_layer --A_band=1 --outfile=$dst_layer --calc="$max-A"
