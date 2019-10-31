def cache_control (fn):
    def _fn (*args, **kwargs):
        res = fn(*args, **kwargs)
        # res.headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate")
        res.headers.set("Cache-Control", "public, max-age="+str(31536000))
        #res.headers.set("Pragma", "no-cache")
        # res.headers.set("Expires", "0")
        res.headers.set("Expires", str(31536000))
        return res

    return _fn


def access_control (fn):
    def _fn (*args, **kwargs):
        res = fn(*args, **kwargs)
        res.headers.set("Access-Control-Allow-Origin", "*")
        res.headers.set("Access-Control-Allow-Methods", "HEAD, GET, POST, PUT, DELETE, OPTIONS")
        res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Access-Control-Allow-Origin, Accept")
        res.headers.set("Access-Control-Max-Age", "0")
        return res
        # return cache_control(res)

    return _fn
