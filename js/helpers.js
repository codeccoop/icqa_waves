exports.request = function request (URL, callback) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", URL, true);
    ajax.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                callback(JSON.parse(this.response));
                } else {
                console.log('error while fetchign json data');
                }
        }
    }
    ajax.send();    
}

exports.lerpColor = function lerpColor (a, b, amount) { 
    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

exports.uid = function uid () {
    var chars = ["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz[]-_*+|/^'!¡?¿"],
        charsLen = chars.length;
    return Array.apply(null, Array(10)).map(function (a) {
        return a + chars[Math.ceil(Math.random() * charsLen)]
    }, new String());
    
}