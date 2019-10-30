#VENDOR
from werkzeug.routing import Map, Rule
from pymongo import MongoClient

# MODULES
from server.web.BaseWsgiContainer import BaseWsgiContainer
from server.web.api.modules.Routes import Routes
from server.web.api.modules.Fallbacks import Fallbacks



class Api (BaseWsgiContainer, Routes, Fallbacks):

    def __init__ (self, **kwargs):
        BaseWsgiContainer.__init__(self, **kwargs)

        # MODULES INHERITANCE
        Routes.__init__(self)
        Fallbacks.__init__(self)

        self.db = MongoClient(self.config["MONGODB_URI"]).icqa_waves

    def get_urls (self):
        return Map([
            # API ENDPOINTS
            Rule("/contours/<mesure>/<region>/<year>/<month>/<day>/<hour>", endpoint="contours"),
            Rule("/municipalities", endpoint="municipalities")
        ])


def init (settings):
    return Api(**settings)
