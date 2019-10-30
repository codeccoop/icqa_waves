from server.web.tools.responses import html, json_file


class Fallbacks:

    def error_404 (self, context={}):
        response = html(self.config["STATICS_DIR"] + "/errors/404.html", context=context, status="404 Not Found")
        response.status_code = 404
        return response

    def error_400 (self, context={}):
        response = json_file(self.config["STATICS_DIR"] + "/errors/400.json", context={"description": context.get("description", None) or "Bad Request"}, status="400 Bad Request")
        response.status_code = 400
        return response

    def error_500 (self, context={}):
        response = json_file(self.config["STATICS_DIR"] + "/errors/500.json", context={"description": context.get("description", None) or "Internal Server Error"}, status="500 Internal Server Error")
        response.status_code = 500
        return response
