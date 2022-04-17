# VENDOR
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.middleware.shared_data import SharedDataMiddleware
from pymongo import MongoClient

# SOURCE
from server.web.app import init as App
from server.web.api import init as Api
from server.web.tools.http import HttpClient


class WSGI(object):
    def __init__(self, config):
        app = App(config)
        api = Api(config)

        self.wsgi = SharedDataMiddleware(
            self.wsgi,
            {"/statics": config["server"]["statics"]},
            cache=not config["server"]["debug"],
            cache_timeout=(0 if config["server"]["debug"] else 60 * 60 * 12),
        )

        self.wsgi = DispatcherMiddleware(self.wsgi, {"/rest": api, "/app": app})

        self.cli = HttpClient(config["soda"])

    def __call__(self, environ, start_response):
        return self.wsgi(environ, start_response)

    def wsgi(self, environ, start_response):
        if environ["REQUEST_METHOD"] == "GET" and environ["PATH_INFO"] == "/":
            start_response(
                "308 Permanent Redirect",
                [
                    ("Content-Type", "text/plain"),
                    ("Location", "app/"),
                    ("Cache-Control", "no-cache, no-store, must-revalidate"),
                    ("Pragma", "no-cahce"),
                    ("Expires", "0"),
                ],
            )
            return [b"308 Permanent Redirect"]

        start_response("404 Not Found", [("Content-Type", "text/plain")])
        return [b"404 Not Found"]
