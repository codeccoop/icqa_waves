#! /bin/bash

root="$( cd "$(dirname $0)"; cd ../..; pwd -P )"

src_layer=$1
dst_layer=$2
z_field=$3
clipped_layer="$(dirname "$dst_layer")/cliped_$(basename "$dst_layer")"
contours_layer="$(dirname "$src_layer")/contours_"$z_field"_$(basename "$src_layer")"

run () {

	echo
	echo "run interpolate.sh"
	sh scripts/gdal-ogr/interpolate.sh "$src_layer" "$dst_layer" "$z_field"

	echo
	echo "run clip.sh"
	sh scripts/gdal-ogr/clip.sh "$dst_layer" "$clipped_layer" "data/shp/epsg4326/municipis_amb.shp"

	echo
	echo "run invert.sh"
	echo $clipped_layer
	sh scripts/gdal-ogr/invert.sh "$clipped_layer" "$dst_layer"

	echo
	echo "run countours.sh"
	sh scripts/gdal-ogr/contours.sh "$dst_layer" "$contours_layer"

	echo
	echo "removing temp files"
	rm "$clipped_layer" || true

	echo "Source layer:"
	echo "  $src_layer"
	echo "Output layers:"
	echo "  $dst_layer"
  	echo "  $contours_layer"

}

if [ -z "$src_layer" ] || [ -z "$dst_layer" ] || [ -z "$z_field" ]; then
  echo "setup_icqa.sh <src_file> <dst_file> <z_field>" 
  echo "**all parameters where required"
  echo "Creates two files: dst_file and contours_<src_file>"
else
  run
fi
