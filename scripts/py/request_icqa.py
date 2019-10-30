import requests as req
from urllib.parse import urlencode
from os.path import exists, isdir
from os import makedirs
import simplejson as json
from time import sleep


magnitudes = {
    # "SO2": 1,
    # "NO": 7,
    # "NO2": 8,
    # "NOx": 12,
    # "O3": 14,
    # "CO": 6,
    "PM10": 10
}

provinces = {
    "Barcelona": 8
}
    

def request (magnitude, province, year, month, day):
    url_template = "https://analisi.transparenciacatalunya.cat/resource/uy6k-2s8r.geojson?"
    query_params = {
        "dia": day,
        "mes": month,
        "any": year,
        "magnitud": magnitude,
        "provincia": province
    }
    
    try:
        res = req.get(url_template+urlencode(query_params))
        return res.json()
    except Exception as e:
        print(e)
        sleep(30)
        request(magnitude, province, year, month, day)
    
    
def write (magnitude, province, year, month, day, points):
    file_name = 'data'
    if not exists(file_name):
        makedirs(file_name)

    file_name = file_name + '/vector'
    if not exists(file_name):
        makedirs(file_name)
    
    file_name = file_name + '/' + str(magnitude)
    if not exists(file_name):
        makedirs(file_name)
    
    file_name = file_name + '/' + str(province)
    if not exists(file_name):
        makedirs(file_name)
        
    file_name = file_name + '/' + str(year) + '-' + str(month) + '-' + str(day)
    with open(file_name + '.geojson', 'w') as file:
        print('writing file ' + file_name + '.geojson')
        json.dump(points, file)
        
    
def run ():
    year = 2018
    months = [i+1 for i in range(12)]
    days = [i+1 for i in range(31)]
    
    for  province in provinces.values():
        for magnitude in magnitudes.values():
            for month in months:
                for day in days:
                    points = request(magnitude, province, year, month, day)
                    write(magnitude, province, year, month, day, points)
    
       
if __name__ == '__main__':
    run()

