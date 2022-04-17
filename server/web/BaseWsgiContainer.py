# BUILT-INS
import os.path
from functools import lru_cache

# VENDOR
from werkzeug.wrappers import Request
from werkzeug.routing import Map, Rule
from werkzeug.exceptions import HTTPException, NotFound

# SOURCE
from server.web.tools import responses
from server.web.tools.http import HttpClient


class BaseWsgiContainer(object):
    def __init__(self, config):
        self.config = config
        self.url_map = self.get_urls()

        self.cli = HttpClient(credentials=config["soda"]["credentials"])

    def __call__(self, environ, start_response):
        return self.wsgi(environ, start_response)

    def wsgi(self, environ, start_response):
        req = Request(environ)
        res = self.dispatch_request(req)
        if res:
            return res(environ, start_response)

    def dispatch_request(self, request):
        adapter = self.url_map.bind_to_environ(request.environ)
        try:
            endpoint, values = adapter.match()
            return getattr(self, "on_" + endpoint)(request, **values)
        except HTTPException as e:
            print(e)
            if e.code is not None and e.code < 400:
                return e
            elif e.code is not None and e.code < 500:
                return self.error_400({"status": e.code, "description": e.description})
            else:
                return self.error_500({"status": e.code, "description": e.description})
        except Exception as e:
            print(e)
            return self.error_500(
                {
                    "code": 500,
                    "description": "Unhandled Error: {!s}".format(
                        e.args[0] if len(e.args) else e
                    ).encode("utf-8"),
                }
            )

    def get_urls(self):
        return Map([Rule("/", endpoint="index")])

    def error_400(self, error):
        res = responses.html(
            os.path.join(self.config["server"]["statics"], "errors/404.html"),
            context=error,
            status="404 Not Found",
        )

    def error_500(self, error):
        res = responses.html(
            os.path.join(self.config["server"]["statics"], "errors/500.html"),
            context=error,
            status="500 Not Found",
        )
