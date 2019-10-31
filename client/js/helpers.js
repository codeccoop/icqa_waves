exports.request = function request (URL, callback, fallback, dryRun) {
    dryRun = dryRun || false;
    if (window.caches) {
        URL = location.protocol+'//'+location.host + URL;
        window.caches.open(window.CACHE_NAME).then(function (cache) {
            cache.match(URL).then(function (req) {
                if (req) {
                    // RETURN CACHED
                    if (!dryRun) {
                        req.json().then(function (json) {
                            console.log('[CACHE:Get]: ', URL);
                            callback(json);
                        });
                    } else {
                        console.log('[CACHE:Get]: ', URL);
                        callback();
                    }
                } else {
                    fetch(URL).then(function (res) {
                        window.caches.open(window.CACHE_NAME).then(function (cache) {
                            cache.put(URL, res);
                            console.log('[CACHE:Cached]: ', URL);
                            cache.match(URL).then(function (req) {
                                if (req && !dryRun) {
                                    // RETURN CACHED
                                    req.json().then(function (json) {
                                        callback(json);
                                    });
                                } else if (!dryRun) {
                                    // WHEN NO CACHED AND NO DRY RUN
                                    fetch(URL).then(function (res) {
                                        res.json().then(function (json) {
                                            callback(json);
                                        }).catch(function () {
                                            callback({"type": "FeatureCollection", "features": []});
                                        });
                                    }).catch(function () {
                                        callback({"type": "FeatureCollection", "features": []});
                                    });
                                } else {
                                    // DRAY RUN MODE
                                    callback();
                                }
                            });
                        });
                    }).catch(function () {
                        callback({"type": "FeatureCollection", "features": []});
                    });
                }
            }).catch(function () {
                console.log('[CACHE:Error]:', url);
                fetch(URL).then(function (res) {
                    window.caches.open(window.CACHE_NAME).then(function (cache) {
                        cache.put(URL, res);
                        cache.match(URL).then(function (req) {
                            if (req) {
                                !dryRun && req.json().then(function (json) {
                                    callback(json);
                                }) || callback();
                            } else {
                                callback({"type": "FeatureCollection", "features": []});
                            }
                        });
                    });
                });
            });
        });   
    } else {
        fetch(URL).then(function (res) {
            res.json().then(function (json) {
                callback({"type": "FeatureCollection", "features": []});
            });
        });
    }
}

exports.lerpColor = function lerpColor (colorScale, amount) {
    var buckets = colorScale.map((d,i) => {
        return (i+1)*(1/colorScale.length)
    });

    var a,b,rr,rg,rb;
    var i=0;
    while (!rr || !rg || !rb) {
        if (amount <= buckets[i]) {
            a = colorScale[Math.max(0, i-1)], b = colorScale[i];
            var ah = parseInt(a.replace(/#/g, ''), 16),
                ar = ah >> 16,
                ag = ah >> 8 & 0xff,
                ab = ah & 0xff;
            
            var bh = parseInt(b.replace(/#/g, ''), 16),
                br = bh >> 16,
                bg = bh >> 8 & 0xff,
                bb = bh & 0xff;
            
                rr = ar + amount * (br - ar),
            rg = ag + amount * (bg - ag),
            rb = ab + amount * (bb - ab);
        }

        if (!buckets[i]) {
            break;
        }

        i++;
    }

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

exports.uid = function uid () {
    var chars = ["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz[]-_*+|/^'!¡?¿"],
        charsLen = chars.length;
    return Array.apply(null, Array(10)).map(function (a) {
        return a + chars[Math.ceil(Math.random() * charsLen)]
    }, new String());
    
}