from werkzeug.wrappers import Response
from werkzeug.exceptions import HTTPException
from server.web.tools.responses import html


class Routes:

    def on_index (self, request):
        if request.method == "GET":
            return html(self.config["STATICS_DIR"] + '/index.html')
        else:
            error = request.method + " method isn't allowed"
            raise HTTPException(error, 405)
