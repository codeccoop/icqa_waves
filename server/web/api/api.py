# VENDOR
from werkzeug.routing import Map, Rule

# MODULES
from server.web.BaseWsgiContainer import BaseWsgiContainer
from server.web.api.modules.Routes import Routes
from server.web.api.modules.Fallbacks import Fallbacks
from server.geo import Geoprocessing


class Api(BaseWsgiContainer, Routes, Fallbacks):
    def __init__(self, config):
        BaseWsgiContainer.__init__(self, config)

        # MODULES INHERITANCE
        Routes.__init__(self)
        Fallbacks.__init__(self)

        self.geo = Geoprocessing(self.config["server"]["tmp"])

    def get_urls(self):
        return Map(
            [
                # API ENDPOINTS
                Rule("/contours/<magnitude>/<year>/<month>/<day>", endpoint="contours"),
                Rule("/municipalities", endpoint="municipalities"),
            ]
        )


def init(config):
    return Api(config)
