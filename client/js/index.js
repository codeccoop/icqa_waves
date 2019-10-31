var Geojson2Three = require('./geojson2three/main.js');
var Environ = require('./geojson2three/components/Environ.js');
var { request, lerpColor } = require('./helpers.js');
var DateTime = require('./views/datetime.js');


window.CACHE_NAME = 'icqawaves';

if (location.protocol !== 'https:' && (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1')) {
    location = 'https://' + location.host;
}

(function background () {
    var dt;
    function controller (year, month, day, hour) {
        var url = "/rest/contours/10/8/"+year+"/1/"+day+"/"+hour;
        var promise = new Promise(function (res, rej) {
            request(url, function (geojson) {
                res(geojson)
            }, function (err) {
                rej(err);
            });
        });
        if (year == 2018 && month == 1 && day == 31 && hour == 'h24') {
            dt.stop();
        }
        return promise;
    }

    dt = new DateTime(controller, {
        background: true
    });

    dt.start();
})();

document.addEventListener("DOMContentLoaded", function (ev) {
    var resolution = 1;
    var relative = true;
    var g2t;
    var _data;
    
    var dateTime = new DateTime(requestData);
    var env = new Environ({
        el: 'canvas',
        resolutionFactor: resolution
    });

    function jsonToScene (geojson) {
        _data = geojson;
        if (!g2t) g2t = new Geojson2Three(env);

        g2t.data(geojson)
            .fitEnviron('icqa', {
                resolutionFactor: resolution,
                scaleZ: function (feature, ctxt) {
                    if (ctxt.scales.relative === true) {
                        // get the relative value to the left range
                        return (feature.properties['icqa']-ctxt.scales.range[0]) / 
                            // divide by the range extent to get the proportion
                            (ctxt.scales.range[1] - ctxt.scales.range[0]) * 
                            // map to the dimain extent
                            (ctxt.scales.domain[1]-ctxt.scales.domain[0]) +
                            // starts from the left domain
                            ctxt.scales.domain[0];
                    }
                    return feature.properties.icqa;
                },
                scales: {
                    relative: relative,
                    range: [0, 200],
                    domain: [50, 170]
                }
            }).draw({
                color: function (feature, ctxt) {
                    if (ctxt.scales.relative == true) {
                        var proportion = (feature.properties['icqa']-ctxt.scales.range[0]) / 
                            // divide by the range extent to get the proportion
                            (ctxt.scales.range[1] - ctxt.scales.range[0]);
                        return lerpColor(['#77d2b7', '#4affc3', '#d2769e', '#ff4891'] , proportion);
                    }
                    
                    return lerpColor(['#77d2b7', '#4affc3', '#d2769e', '#ff4891'], feature.properties.icqa/200);
                },
                linewidth: 1,
                linecap: 'round',
                linejoin:  'round',
                transparent: true,
                opacity: .7
            });

        env.render();
        env.animate();
    }

    function requestData (year, month, day, hour) {
        return new Promise(function (res, rej) {
            // var url = "/rest/contours/10/8/"+year+"/"+month+"/"+day+"/"+hour;
            var url = "/rest/contours/10/8/"+year+"/1/"+day+"/"+hour;
            request(url, function (geojson) {
                jsonToScene(geojson);
                res(geojson);
            }, function (err) {
                rej(err);
            });
        });
    }
    
    var ready = [false, false];
    requestData(2018, 1, 1, 'h01').then(function () {
        ready[0] = true;
        if (ready.reduce(function (a,d) { return a && d}, true)) {
            document.body.classList.add('ready');
        }
    });
    
    request('/rest/municipalities', function (geojson) {
        new Geojson2Three(env)
        .data(geojson)
        .fitEnviron(null, {
            resolutionFactor: resolution,
            scaleZ: 0,
            env: env
        }).draw({
            color: '#dbf4fa',
            transparent: true,
            opacity: 0.2
        });
        env.render();
        env.animate();
        ready[1] = true;
        if (ready.reduce(function (a,d) { return a && d}, true)) {
            document.body.classList.add('ready');
        }
    });

    Array.apply(null, document.getElementById('scales').getElementsByClassName('scale')).map(function (el, i, els) {
        el.addEventListener('click', function (ev) {
            els.map(function (el) {
                el.classList.remove('active');
            });
            el.classList.add('active');
            relative = el.getAttribute('data-value') == 'relative';
            jsonToScene(_data);
        });
    });

    document.body.addEventListener('click', function (ev) {
        if (document.body.classList.contains('waiting')) {
            ev.stopImmediatePropagation();
            ev.stopPropagation();
            ev.preventDefault();
        }
    }, true);

    document.getElementById('canvas').addEventListener('mousedown', function (ev) {
        if (ev.currentTarget.classList.contains('blocked')) {
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            ev.preventDefault();
        }
    }, true);

    document.getElementById('canvas').addEventListener('mousemove', function (ev) {
        if (ev.currentTarget.classList.contains('blocked')) {
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            ev.preventDefault();
        }
    }, true);
});