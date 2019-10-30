from os.path import exists, isdir
from os import makedirs
import simplejson as json
import warnings
from subprocess import PIPE, Popen


magnitudes = {
    # "SO2": "1",
    # "NO": "7",
    # "NO2": "8",
    # "NOx": "12",
    # "O3": "14",
    # "CO": "6",
    "PM10": "10"
}

provinces = {
    "Barcelona": "8"
}


def read (magnitude, province, year, month, day, hour):
    v_base_path = "./data/vector"
    r_base_path = "./data/raster"
    c_base_path = "./data/contours"

    if not exists(r_base_path):
        makedirs(r_base_path)

    if not exists(c_base_path):
        makedirs(c_base_path)

    file_name = v_base_path + '/' + magnitude
    if not exists(file_name):
        warnings.warn(file_name + " doesn't exists")
        return

    if not exists(file_name.replace(v_base_path, r_base_path)):
        makedirs(file_name.replace(v_base_path, r_base_path))

    if not exists(file_name.replace(v_base_path, c_base_path)):
        makedirs(file_name.replace(v_base_path, c_base_path))
    
    
    file_name = file_name + '/' + province
    if not exists(file_name):
        warnings.warn(file_name + " doesn't exists")
        return

    if not exists(file_name.replace(v_base_path, r_base_path)):
        makedirs(file_name.replace(v_base_path, r_base_path))

    if not exists(file_name.replace(v_base_path, c_base_path)):
        makedirs(file_name.replace(v_base_path, c_base_path))
        
    file_name = file_name + '/' + year + '-' + month + '-' + day
    if not exists(file_name + '.geojson'):
        warnings.warn(file_name + " doesn't exists")
        return

    vector = file_name + ".geojson"
    raster = file_name.replace(v_base_path, r_base_path) + ".tif"

    process = Popen([
        "./scripts/gdal-ogr/setup_icqa.sh",
        vector,
        raster,
        hour
    ], stderr=PIPE)

    stderr = process.communicate()

    if len(stderr):
        print('[ERR]: ' + str(stderr))


def run ():
    year = "2018"
    months = [str(i+1) for i in range(12)]
    days = [str(i+1) for i in range(31)]
    hours = ["0"+ h if len(h) == 1 else h for h in [str(i+1) for i in range(24)]]
    
    for  province in provinces.values():
        for magnitude in magnitudes.values():
            for month in months:
                for day in days:
                    for hour in hours:
                        hour = 'h' + str(hour)
                        read(magnitude, province, year, month, day, hour)
    
       
if __name__ == '__main__':
    run()