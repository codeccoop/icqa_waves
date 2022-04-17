# BUILT-IN
import math
import os
import json

# VENDOR
import numpy as np
from osgeo import ogr, gdal, osr


class Geoprocessing:
    def __init__(self, tmp):
        self.tmp = tmp

    def interpolate(self, ds_path: str, z_field: str):
        grid_path = os.path.join(self.tmp, "grid.tif")
        if os.path.isfile(grid_path):
            os.unlink(grid_path)
        ds = gdal.Grid(
            grid_path,
            ds_path,
            algorithm="invdist:power=2.0:smoothing=0.1:radius1=0.0:radius2=0.0:angle=0.0:max_points=0:min_points=0:nodata=-99.0",
            zfield=z_field,
            format="GTiff",
        )
        ds.FlushCache()
        return ds

    def contours(self, rds, n: int) -> dict:
        proj = osr.SpatialReference(wkt=rds.GetProjection())
        rband = rds.GetRasterBand(1)
        rgrid = rband.ReadAsArray()
        #       rgt = rds.GetGeoTransform()

        #        ipath = os.path.join(self.tmp, "in_grid.tiff")
        #        if os.path.isfile(ipath):
        #            os.unlink(ipath)
        #
        #        gtiff = gdal.GetDriverByName('GTiff')
        #        ids = gtiff.Create(
        #            ipath,
        #            rds.RasterXSize,
        #            rds.RasterYSize,
        #            1, gdal.GFT_Real)
        #        # ids.SetGeoTransform((rgt[0], rgt[1], rgt[2], rgt[3], rgt[4], rgt[5]))
        #        ids.SetGeoTransform(rgt)
        #        ids.SetProjection(proj.ExportToWkt())
        #        iband = ids.GetRasterBand(1)
        #        iband.WriteArray(rgrid.max() - rgrid)
        #        ids.FlushCache()
        #        igrid = iband.ReadAsArray()

        vpath = os.path.join(self.tmp, "contours.geojson")
        if os.path.isfile(vpath):
            os.unlink(vpath)
        vds = ogr.GetDriverByName("GeoJSON").CreateDataSource(vpath)

        vlayer = vds.CreateLayer("contours", proj)

        id_field = ogr.FieldDefn("id", ogr.OFTInteger)
        vlayer.CreateField(id_field)
        icqa_field = ogr.FieldDefn("icqa", ogr.OFTReal)
        vlayer.CreateField(icqa_field)

        step = (rgrid.max() - rgrid.min()) / n
        steps = [
            int(d) * 1e-3
            for d in range(
                math.floor(rgrid.min() * 1e3),
                math.ceil(rgrid.max() * 1e3),
                math.floor(step * 1e3),
            )
        ]

        gdal.ContourGenerate(rband, 0, 0, steps, 1, -99.0, vlayer, 0, 1)

        vds.Destroy()

        with open(vpath, "r") as conn:
            return json.loads(conn.read())
