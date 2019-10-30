# VENDOR
from werkzeug.wrappers import Request
from werkzeug.routing import Map, Rule
from werkzeug.exceptions import HTTPException, NotFound


class BaseWsgiContainer (object):

    def __init__ (self, server_rc, port, mongodb_uri, statics_dir, debug):

        self.config = dict()
        self.config["SERVER_RC"] = server_rc
        self.config["PORT"] = port
        self.config["MONGODB_URI"] = mongodb_uri
        self.config["STATICS_DIR"] = statics_dir
        self.config["DEBUG"] = debug

        self.url_map = self.get_urls()

    def __call__ (self, environ, start_response):
        return self.wsgi(environ, start_response)

    def wsgi (self, environ, start_response):
        req = Request(environ)
        res = self.dispatch_request(req)
        return res(environ, start_response)

    def dispatch_request (self, request):
        adapter = self.url_map.bind_to_environ(request.environ)
        try:
            endpoint, values = adapter.match()
            return getattr(self, 'on_' + endpoint)(request, **values)
        except NotFound as e:
            return self.error_404({
                "code": e.code,
                "description": e.description
            })
        except HTTPException as e:
            if e.code < 400:
                return e
            return self.error_400({
                "code": e.code,
                "description": e.description
            })
        except RuntimeError as e:
            return self.error_500({
                "code": 500,
                "description": "Runtime Error: {!s}".format(e.args[0] if len(e.args) else e).encode('utf-8')
            })
        except Exception as e:
            print(e)
            return self.error_500({
                "code": 500,
                "description": "Unhandled Error: {!s}".format(e.args[0] if len(e.args) else e).encode('utf-8')
            })

    def get_urls (self):
        return Map([
            Rule('/', endpoint='index')
        ])


