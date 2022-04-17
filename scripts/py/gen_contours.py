import os
import json
import warnings
from subprocess import PIPE, Popen
from datetime import datetime, timedelta

magnitudes = {
    # "SO2": "1",
    # "NO": "7",
    # "NO2": "8",
    # "NOx": "12",
    # "O3": "14",
    # "CO": "6",
    "PM10": 10
}

comarques = {
    "Maresme": "21",
    "Baix Llobregat": "11",
    "Valles Oriental": "41",
    "Vallès Occidental": "40",
    "Barcelona": "8"
}


def read(magnitude: int, file_name: str, hour: str) -> None:
    v_base_path = "data/vector"
    r_base_path = "data/raster"
    c_base_path = "data/contours"

    if not os.path.exists(r_base_path):
        os.makedirs(r_base_path)

    if not os.path.exists(c_base_path):
        os.makedirs(c_base_path)

    file_path = os.path.join(v_base_path, str(magnitude))
    if not os.path.exists(file_path.replace(v_base_path, r_base_path)):
        os.makedirs(file_path.replace(v_base_path, r_base_path))

    if not os.path.exists(file_path.replace(v_base_path, c_base_path)):
        os.makedirs(file_path.replace(v_base_path, c_base_path))

    file_path = os.path.join(file_path, file_name)
    if not os.path.exists(file_path):
        warnings.warn(file_path + " doesn't exists")
        return

    path = os.path.splitext(file_path)[0]
    vector = path + ".geojson"
    raster = path.replace(v_base_path, r_base_path) + ".tif"

    process = Popen(["./scripts/gdal-ogr/setup_icqa.sh", vector, raster, hour],
                    stderr=PIPE)

    stderr = process.communicate()

    if len(stderr):
        print('[ERR]: ' + str(stderr))


def run():
    hours = [
        "0" + h if len(h) == 1 else h for h in [str(i + 1) for i in range(24)]
    ]

    for magnitude in magnitudes.values():
        for file_name in os.listdir(f"data/vector/{magnitude}"):
            for hour in hours:
                hour = "h" + str(hour)
                read(magnitude=magnitude, file_name=file_name, hour=hour)


if __name__ == '__main__':
    run()
