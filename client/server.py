#!/usr/bin/env python
from http.server import HTTPServer, SimpleHTTPRequestHandler

class MyHTTPRequestHandler(SimpleHTTPRequestHandler):

    # def __init__(self, *args, **kwargs):
      # BaseHTTPRequestHandler.__init__(self, *args, **kwargs)

    def end_headers(self):
        self.send_my_headers()
        SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")


if __name__ == '__main__':
    print('running server on localhost:8000')
    httpd = HTTPServer(('', 8000), MyHTTPRequestHandler)
    httpd.serve_forever()