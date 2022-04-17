# BUILT-IN
import sys, traceback
import os.path

# VENDOR
from werkzeug.exceptions import MethodNotAllowed, NotFound

# MODULES
from server.web.tools import responses


class Routes(object):
    config = dict()
    municipalities = None

    def on_contours(self, request, magnitude, year, month, day):
        if request.method == "OPTIONS":
            return responses.options()

        elif request.method == "GET":
            res = self.cli.get_measure(
                {
                    "magnitude": magnitude,
                    "year": year,
                    "month": month,
                    "day": day,
                }
            )

            # import pdb; pdb.set_trace()
            data_path = os.path.join(
                self.config["server"]["tmp"], "measurements.geojson"
            )
            with open(data_path, "w") as conn:
                conn.write(res.text)

            collection = {"type": "FeatureCollection", "features": []}
            for i in range(24):
                if i + 1 < 10:
                    h = "h0" + str(i + 1)
                else:
                    h = "h" + str(i + 1)

                try:
                    ds = self.geo.interpolate(data_path, h)
                    contours = self.geo.contours(ds, 30)
                    for feat in contours["features"]:
                        feat["properties"]["hour"] = i + 1
                        collection["features"].append(feat)
                except Exception:
                    print("-" * 60)
                    traceback.print_exc(file=sys.stdout)
                    print("-" * 60)
                    print("Exception in user code")

            return responses.json(collection)
        else:
            return MethodNotAllowed

    def on_municipalities(self, request):
        if request.method == "OPTIONS":
            return responses.options()
        elif request.method == "GET":
            try:
                if self.municipalities is None:
                    fconn = open(
                        os.path.join(
                            self.config["server"]["statics"],
                            "municipalities.geojson",
                        ),
                        "r",
                    )
                    self.municipalities = fconn.read()
                return responses.json(self.municipalities)
            except:
                raise NotFound
        else:
            raise MethodNotAllowed
