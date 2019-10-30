# SYS
from sys import argv
from os.path import join, dirname, realpath

# MODULES
from server import WSGI


server_rc = realpath(join(dirname(__file__), 'server/server.rc'))
statics_dir = realpath(join(dirname(__file__), 'server/statics'))
host = '127.0.0.1'

if "--dev" in argv:
    port = 8000
    environment = 'development'
    mongodb_uri = "mongodb://localhost:27017/icwa_waves"
    debug = True
else:
    port = 8000
    environment = 'production'
    mongodb_uri = "mongodb://localhost:27017/icwa_waves"
    debug = False


class App (object):

  def __init__ (self):
     self.app = WSGI({
        "mongodb_uri": mongodb_uri,
        "statics_dir": statics_dir,
        "server_rc": server_rc,
        "port": port,
        "debug": debug,
     })

  def __call__ (self, *args, **kwargs):
    return self.app(*args, **kwargs)


app = App()

if __name__ == '__main__':
    from werkzeug.serving import run_simple
    run_simple(host, port, app, use_debugger=debug, use_reloader=debug)
