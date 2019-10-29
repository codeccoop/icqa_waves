var Geojson2Three = require('./geojson2three/main.js');
var Environ = require('./geojson2three/components/Environ.js');
var { request, lerpColor } = require('./helpers.js');
var DateTime = require('./views/datetime.js');


var g2t;
function requestData (year, month, day, hour) {
    var url = `data/contours/10/8/contours_${year}-${month}-${day}_${hour}.geojson`;
    return request(url, function (geojson) {
        if (g2t) {
            g2t.data(geojson).draw({
                color: function (feat) {
                    return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/200);
                },
                linewidth: 1,
                linecap: 'round',
                linejoin:  'round'
            });
            env.render();
            env.animate();
        } else {
            g2t = new Geojson2Three(env.scene, {
                resolutionFactor: 5,
                zScale: function (feature) {
                    return feature.properties.icqa * 2;
                },
                env: env
            }).data(geojson)
            .fitEnviron()
            .draw({
                color: function (feat) {
                    return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/200);
                },
                linewidth: 1,
                linecap: 'round',
                linejoin:  'round'
            });
            env.render();
            env.animate();
        }
    });
}

var dateTime = new DateTime(requestData);
var env = new Environ({resolutionFactor: 5});

requestData(2019, 1, 1, 'h01');
request('data/municipis.geojson', function (geojson) {
    new Geojson2Three(env.scene, {
        resolutionFactor: 5,
        zScale: 0,
        env: env
    }).data(geojson)
    .fitEnviron()
    .draw({
        color: 0xffffff,
        transparent: true,
        opacity: .0
    });
    // g2t.draw(function (feature) {
    //     return 0;
    //  }, {
    //     color: 0xffffff
    // });
    env.render();
    env.animate();
    // dateTime.start();
});

// var i = 0, url, g2t;
// var interval = setInterval(function () {
//     url = 'data/icqa/contours/10/8/'+files[i%files.length];
//     request(url, function (geojson) {
//         if (g2t) {
//             // g2t.update(geojson, {
//             //     color: function (feat) {
//             //         return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/70);
//             //     }
//             // });
//             g2t.data(geojson).draw({
//                 color: function (feat) {
//                     return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/80);
//                 }
//             });
//             env.render();
//             env.animate();
//         } else {
//             g2t = new Geojson2Three(env.scene, {
//                 resolutionFactor: 5,
//                 zScale: function (feature) {
//                     return feature.properties.icqa * 2;
//                 },
//                 env: env
//             }).data(geojson)
//             .fitEnviron()
//             .draw({
//                 color: function (feat) {
//                     return lerpColor('#4affc3', '#ff4891', feat.properties.icqa/70);
//                 }
//             });

//             env.render();
//             env.animate();
//         }
//     });
    // i++;
// }, 1000);

// function stopInterval () {
//     clearInterval(interval);
// }