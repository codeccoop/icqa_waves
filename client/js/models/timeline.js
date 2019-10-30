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

    function dispatch (direction, type) {
        this.view.el.dispatchEvent(new CustomEvent("change", {
            detail: {
                type: type || "day",
                direction: direction || "forward",
                src: this
            }
        }));
    }

    function TimeLine (view) {
        var self = this;
        this.view = view;
        Object.defineProperty(this, 'hour', {
            get: function () {
                return format(_hour+1);
            },
            set: function (val) {
                var _old = _hour;
                _hour = val-1 < 0 ? 23 : val-1 > 23 ? 0 : val-1;

                _old == 23 && _hour == 0 ?
                    dispatch.call(self, 'forward') : 
                    _old == 0 && _hour == 23 ?
                        dispatch.call(self, 'backward') : 
                        _old < _hour ?
                         dispatch.call(self, 'forward', 'hour') :
                         dispatch.call(self, 'backward', 'hour');
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