var CACHE_NAME = 'icqawaves';

var urlsToCache = [
    '/rest/municipalities',
];

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function (cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache).then(function () {
                return self.skipWaiting();
            });
        })
    );
});

self.addEventListener('activate', function (event) {
    console.log('Activated cache');
    console.log('start request');
    request(contours);
    event.waitUntil(self.clients.claim());
});
  

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
        .then(function (response) {
            // Cache hit - return response
            if (response) {
                return response;
            }

            return fetch(event.request).then(
                function (response) {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(function (cache) {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            );
        })
    );
});

// CAHCE ALL CONTOURS
var urlTemplate = `/rest/contours/10/8/2018/1/day/hour`, day, hour;
var contours = new Array();
Array.apply(null, Array(31)).map(function (d, i) {
    day = (i+1);
    Array.apply(null, Array(24)).map(function (d, i) {
        hour = 'h' + (String(i+1).length == 1 && '0' + (i+1) || (i+1));
        contours.push(urlTemplate.replace(/day/, day).replace(/hour/, hour));
    });
});
var contoursLen = contours.length;

function request (urls) {
    var url = urls.shift();
    console.log('urls: ', urls.length);
    console.log('contours: ', contours.length);
    if ((contoursLen - 48) >= urls.length) {
        console.log('comunicating with client', self.WindowClient);
        self.clients.matchAll({}).then(clients => {
            var client;
            for (let i=0,len=clients.length; i<len; i++) {
                client = clients[i];
                if (client.type == "window" && client.focused) {
                    client.postMessage({
                        "msg": "enogh cache to start animation",
                        "code": 200
                    });
                }

            }
        });
    }
    url = location.protocol+'//'+location.host + url;
    caches.open(CACHE_NAME).then(function (cache) {
        cache.match(url).then(function (res) {
            if (!res) {
                fetch(url).then(function (res) {
                    cache.put(event.request, res);
                    request(urls);
                }).catch(function (err) {
                    request(urls);
                }); 
            } else {
                request(urls);
            }
        });
    });
}