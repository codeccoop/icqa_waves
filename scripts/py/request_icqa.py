from typing import Optional
import requests as req
from urllib.parse import urlencode
from os.path import exists, isdir
from os import makedirs
import simplejson as json
from datetime import datetime, timedelta
import time
import base64

magnitudes = {
    # "SO2": 1,
    # "NO": 7,
    # "NO2": 8,
    # "NOx": 12,
    # "O3": 14,
    # "CO": 6,
    "PM10": 10
}

comarques = {
    "Barcelona": "13",
    "Vallès Oriental": "41",
    "Vallès Occidental": "40",
    "Maresme": "21"
}

def request(magnitude: int, date: datetime,
            credentials: bytes) -> Optional[dict]:  # comarca: int
    # "https://analisi.transparenciacatalunya.cat/resource/qg74-87s9.json"
    url_template = "https://analisi.transparenciacatalunya.cat/resource/tasf-thgu.geojson?"
    # url_template = "https://analisi.transparenciacatalunya.cat/resource/uy6k-2s8r.geojson?"
    query_params = {
        # "dia": day,
        # "mes": month,
        # "any": year,
        "magnitud": magnitude,
        "data": date.isoformat(),
        # "provincia": province,
        # "codi_comarca": comarca
    }

    try:
        url = url_template + urlencode(query_params)
        token = base64.b64encode(credentials[:-1]).decode()
        res = req.get(
            url,
            headers={
                "Host": "analisi.transparenciacatalunya.cat",
                "Accept": "application/json",
                "Authorization": "Basic " + token,
                # "X-App-Token": token
            })
        res = res.json()
        if len(res.get("features", [])) > 0:
            return res
        else:
            return None
    except Exception as e:
        print(e)
        time.sleep(30)
        return request(magnitude=magnitude,
                       # comarca=comarca,
                       date=date,
                       credentials=credentials)


def write(points: dict, magnitude: int, date: datetime) -> None:  # comarca: int
    file_name = 'data'
    if not exists(file_name):
        makedirs(file_name)

    file_name = file_name + '/vector'
    if not exists(file_name):
        makedirs(file_name)

    file_name = file_name + '/' + str(magnitude)
    if not exists(file_name):
        makedirs(file_name)

    # file_name = file_name + '/' + str(comarca)
    # if not exists(file_name):
    #     makedirs(file_name)

    file_name = f"{file_name}/{date.year}-{date.month}-{date.day}"
    with open(file_name + '.geojson', 'w') as file:
        print('writing file ' + file_name + '.geojson')
        json.dump(points, file)


def run():
    with open("token.txt", "rb") as conn:
        credentials = conn.read()

    for magnitude in magnitudes.values():
        today = datetime.today()
        today = today.replace(hour=0, minute=0, second=0, microsecond=0)
        date = today.replace(year=today.year - 1)
        while date != today:
            points = request(magnitude=magnitude,
                             date=date,
                             # comarca=comarca,
                             credentials=credentials)
            if points:
                write(points=points,
                      magnitude=magnitude,
                      # comarca=comarca,
                      date=date)

            date = date + timedelta(days=1)
            time.sleep(1)


if __name__ == '__main__':
    run()
