#! /bin/bash

root="$( cd "$(dirname $0)"; cd ../..; pwd -P )"

src_layer=$1
dst_layer=$2
z_field=$3
clipped_layer="$(dirname "$dst_layer")/cliped_$(basename "$dst_layer")"
src_name="$(basename "$src_layer")"
src_extension="${src_name##*.}"
src_name="${src_name%.*}"
contours_path="$(dirname "$src_layer")"
contours_path="${contours_path/vector/contours}"
contours_layer="$contours_path/contours_$(echo "$src_name")_$(echo "$z_field").$(echo "$src_extension")"

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
	if [ -f "$clipped_layer" ]; then
		rm "$clipped_layer" || true
	fi

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
