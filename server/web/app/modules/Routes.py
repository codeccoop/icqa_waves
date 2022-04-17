# BUILT-INS
import os.path

# VENDOR
from werkzeug.wrappers import Response
from werkzeug.exceptions import MethodNotAllowed, NotFound
from server.web.tools import responses


class Routes:

    config = dict()

    def on_index(self, request):
        if request.method == "GET":
            try:
                return responses.html(
                    os.path.join(self.config["server"]["statics"],
                                 'index.html'))
            except:
                raise NotFound
        else:
            raise MethodNotAllowed

    def on_sw(self, request):
        if request.method == "GET":
            try:
                return responses.js(
                    os.path.join(self.config["server"]["statics"], "sw.js"))
            except:
                raise NotFound
        else:
            raise MethodNotAllowed
