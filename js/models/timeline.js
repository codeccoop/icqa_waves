module.exports = (function () {

    var _hour = 0;
    var hours = (function () {
        return (function* () {
            while (true) {
                yield (_hour + 1)%24;
            }
        })();
    })();

    function format (hour) {
        return 'h' + (String(hour).length == 1 ? '0'+hour : hour);
    }

    function TimeLine () {
        Object.defineProperty(this, 'hour', {
            get: function () {
                return format(_hour+1);
            },
            set: function (val) {
                _hour = val-1;
            }
        });
    }

    TimeLine.prototype.next = function next () {
        _hour = hours.next().value;
        return format(_hour+1);
    }

    TimeLine.prototype.getHours = function getHours () {
        return Array.apply(null, Array(24)).map(function (d,i) {
            return i+1;
        });
    } 

    return TimeLine
})();