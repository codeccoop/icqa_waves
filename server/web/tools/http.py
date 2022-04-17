# BUILT-INS
from typing import Optional
from base64 import b64encode
import json
import sys
import traceback
import urllib.parse
from datetime import datetime as dt

# VENDOR
import requests


class HttpClient:

    schema = "https"
    domain = "analisi.transparenciacatalunya.cat"
    endpoint = "resource/tasf-thgu"
    dformat = "geojson"

    magnitudes = {
        "SO2": 1,
        "NO": 7,
        "NO2": 8,
        "NOx": 12,
        "O3": 14,
        "CO": 6,
        "PM10": 10,
    }

    comarques = {
        "Barcelona": "13",
        "Vallès Oriental": "41",
        "Vallès Occidental": "40",
        "Maresme": "21",
    }

    def __init__(self, credentials: str) -> None:
        self._credentials = credentials

    @property
    def contours_endpoint(self) -> str:
        return f"{self.schema}://{self.domain}/{self.endpoint}.{self.dformat}"

    @property
    def token(self) -> str:
        return b64encode(self._credentials.encode()).decode()

    def encode_query(self, params: dict) -> str:
        return urllib.parse.urlencode(
            {
                "magnitud": self.magnitudes.get(params["magnitude"], 10),
                "data": dt.strptime(
                    f"{params['year']}-{params['month']}-{params['day']}", "%Y-%m-%d"
                ).isoformat(),
            }
        )

    def get_measure(self, params: dict) -> Optional[requests.Response]:
        res = None
        try:
            res = requests.get(
                self.contours_endpoint + "?" + self.encode_query(params),
                headers={
                    "Host": self.domain,
                    "Accept": "application/json",
                    "Autorization": "Basic " + self.token,
                },
            )

            return res

        except requests.HTTPError:
            print("-" * 60)
            traceback.print_exc(file=sys.stdout)
            print("-" * 60)
            print("HttpErrot in user code:")

        except requests.RequestException:
            print("-" * 60)
            traceback.print_exc(file=sys.stdout)
            print("-" * 60)
            print("RequestException in user code:")

        except Exception:
            print("-" * 60)
            traceback.print_exc(file=sys.stdout)
            print("-" * 60)
            print("Exception in user code:")
