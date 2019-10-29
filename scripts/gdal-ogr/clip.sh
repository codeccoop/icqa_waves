#! /bin/bash

src_layer=$1
dst_layer=$2
cut_layer=$3

echo "FROM: $src_layer"
echo "TO: $dst_layer"
echo "THROW: $cut_layer"

gdalwarp -of "GTiff" -cutline "$cut_layer" -crop_to_cutline -srcnodata -999.0 -dstnodata -999.0 "$src_layer" "$dst_layer"
