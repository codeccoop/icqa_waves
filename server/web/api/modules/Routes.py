# VENDOR
from werkzeug.exceptions import HTTPException, NotFound

# MODULES
from server.web.tools.responses import json as json_res, options as res_options

class Routes:

    def on_contours (self, request, mesure, region, year, month, day, hour):
        if request.method == "OPTIONS":
            return res_options()
        elif request.method == "GET":
            # res = self.db.contours.find({
            res = self.db.contours.find_one({
                "mesure": str(mesure),
                "region": str(region),
                "year": str(year),
                "month": str(month),
                "day": str(day),
                "hour": str(hour)
            }, {"_id": False})

            # return json_res({"type": "FeatureCollection", "features": [doc["feature"] for doc in res]})
            return json_res(res["collection"] if res else {"type": "FeatureCollection", "features": []})
        else:
            return HTTPException("405 Method Not Allowed")

    def on_municipalities (self, request):
        if request.method == "OPTIONS":
            return res_options()
        elif request.method == "GET":
            res = self.db.municipalities.find_one({}, {"_id": False})
            return json_res(res)