# SYS
from sys import argv
import os.path
from os import getenv
import yaml

# MODULES
from server import WSGI

if "--dev" in argv:
    with open(os.path.join(os.path.dirname(__file__), "config","dev.yml"), "r") as conn:
        config = yaml.safe_load(conn)
else:
    with open(os.path.join(os.path.dirname(__file__), "config", "pro.yml"), "r") as conn:
        config = yaml.safe_load(conn)

class App(object):
    def __init__(self):
        self.app = WSGI(config)

    def __call__(self, *args, **kwargs):
        return self.app(*args, **kwargs)


app = App()

if __name__ == '__main__':
    from werkzeug.serving import run_simple
    run_simple(config["http"]["host"],
               config["http"]["port"],
               app,
               use_debugger=config["server"]["debug"],
               use_reloader=config["server"]["debug"])
