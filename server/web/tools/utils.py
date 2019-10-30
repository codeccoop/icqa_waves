from werkzeug.urls import url_parse
from collections import namedtuple


def render_context (context):
    return namedtuple("RenderContext", context.keys())(*context.values())


def get_hostname (url):
    return url_parse(url).netloc


def is_valid_url (url):
    parts = url_parse(url)
    return parts.scheme in ("http", "https")