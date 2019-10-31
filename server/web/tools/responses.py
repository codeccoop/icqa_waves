# SYS
import os.path as path

# VENDOR
from werkzeug.wrappers import Response
from werkzeug.exceptions import NotFound
from .utils import render_context
from simplejson import dumps as jsons

# MODULES
from .headers import access_control, cache_control


# @cache_control
@access_control
def html (file_path, status="200 OK", context={}):
    if path.exists(file_path):
        context = render_context(context)
    else:
        raise NotFound('Could not find ' + file_path)

    with open(file_path) as file:
        return Response([file.read().format(context=context)], status=status, mimetype="text/html")


# @cache_control
@access_control
def js (file_path, status="200 OK", context={}):
    if path.exists(file_path):
        context = render_context(context)
    else:
        raise NotFound('Could not find ' + file_path)

    with open(file_path) as file:
        return Response([file.read()], status=status, mimetype="text/javascript")


# @cache_control
@access_control
def json_file (file_path, status="200 OK", context={}):
    if not path.exists(file_path):
        raise NotFound('Could not find ' + file_path)

    with open(file_path) as file:
        return Response([(file.read() % tuple(context.values())).encode("utf-8")], status=status, mimetype="application/json")


@cache_control
@access_control
def json (data, status="200 OK"):
    json = (type(data) == str and data or jsons(data))
    return Response([json], status=status, mimetype="application/json")


# @cache_control
@access_control
def csv (data, status="200 OK", file_name="file.csv"):
    return Response([data.encode("utf-8")], status=status, mimetype="text/plain", headers=[("Content-Disposition", "attachment; filename='{!s}'".format(path.basename(str(file_name))))])


# @cache_control
@access_control
def options ():
    return Response([], status="200 Ok", mimetype="text/plain")

# def set_control_access (res):
#     ORIGIN = request.environ.get("HTTP_ORIGIN", request.environ.get("HTTP_REFERER", "http://moaianalytics.com"))
#     match = re.match(r"https?\:\/\/(www\.)?moaianalytics.com|http://localhost:[0-9]{4}", ORIGIN)
#     if match:
#         res.headers.set("Access-Control-Allow-Origin", match.group(0))


# @access_control
# def xlsx (book, filename="moai.xlsx"):
#     res = make_response(book.read())
#     res.headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
#     res.headers.set("Content-Disposition", "attachment; filename={!s}".format(basename(str(filename))))
#     return res
#
#
# @access_control
# def html (xml):
#     res = make_response(xml)
#     res.headers.set("Content-Type", "application/html")
#     return res
#
#
# @access_control
# def svg (svg, filename="moai.svg"):
#     return send_file(
#         svg,
#         mimetype="image/xml+svg",
#         as_attachment=True,
#         attachment_filename=filename
#     )
#     # res = make_response(svg.read())
#     # res.headers.set("Content-Type", "image/svg+xml")
#     # res.headers.set("Content-Disposition", "attachment; filename='{!s}'".format(basename(str(filename))))
#     # return res
#
#
# @access_control
# def pdf (pdf, filename="moai.pdf"):
#     return send_file(
#         pdf,
#         mimetype="application/pdf",
#         as_attachment=True,
#         attachment_filename=basename(str(filename))
#     )
#
#
# @access_control
# def file (file_path):
#
#     if not file_path:
#         return abort(404)
#
#     return  send_file(
#         file_path,
#         as_attachment=True,
#         attachment_filename=basename(file_path)
#     )
#
#
# @access_control
# def options():
#     return make_response()
