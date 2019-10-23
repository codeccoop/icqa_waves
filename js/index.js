var Geojson2Three = require('./main');
var Environ = require('./components/Environ');
var { request, lerpColor } = require('./helpers');

var env = new Environ();

var files = [
    "contours_2019-1-1.geojson",
    "contours_2019-1-2.geojson",
    "contours_2019-1-3.geojson",
    "contours_2019-1-4.geojson",
    "contours_2019-1-5.geojson",
    "contours_2019-1-6.geojson",
    "contours_2019-1-7.geojson"
];

// request('data/municipis.geojson', function (geojson) {
//     g2t = new Geojson2Three(scene, geojson);
//     g2t.draw(function (feature) {
//         return 0;
//      }, {
//         color: 0xffffff
//     });
//     render();
//     animate();
// });

var i = 0, url, g2t;
var interval = setInterval(function () {
    url = 'data/'+files[i%files.length];
    request(url, function (geojson) {
        if (g2t) {
            g2t.update(geojson, {
                color: function (feat) {
                    return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/70);
                }
            });
        } else {
            g2t = new Geojson2Three(env.scene, {
                resolutionFactor: 3,
                zScale: function (feature) {
                    return feature.properties.icqa * 3;
                },
                env: env
            }).data(geojson)
            .fitEnviron()
            .draw({
                color: function (feat) {
                    return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/70);
                }
            });

            env.render();
            env.animate();
        }
    });
    i++;
}, 2000);

function stopInterval () {
    clearInterval(interval);
}