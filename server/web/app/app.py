#VENDOR
from werkzeug.routing import Map, Rule

# MODULES
from server.web.BaseWsgiContainer import BaseWsgiContainer
from server.web.app.modules.Routes import Routes
from server.web.app.modules.Fallbacks import Fallbacks


class App (BaseWsgiContainer, Routes, Fallbacks):

    def __init__ (self, **kwargs):
        BaseWsgiContainer.__init__(self, **kwargs)

        # MODULES INHERITANCE
        Routes.__init__(self)
        Fallbacks.__init__(self)

    def get_urls (self):
        return Map([
            # SERVER ENDPOINTS
            Rule('/', endpoint='index'),
        ])


def init (settings):
    return App(**settings)
