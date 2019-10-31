module.exports = (function () {

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
        this.state = 0;
        this.hours = (function () {
            return (function* () {
                while (true) {
                    yield (self.state + 1)%24;
                }
            })();
        })();
        Object.defineProperty(this, 'hour', {
            get: function () {
                return format(self.state+1);
            },
            set: function (val) {
                var _old = self.state;
                self.state = val-1 < 0 ? 23 : val-1 > 23 ? 0 : val-1;

                _old == 23 && self.state == 0 ?
                    dispatch.call(self, 'forward') : 
                    _old == 0 && self.state == 23 ?
                        dispatch.call(self, 'backward') : 
                        _old < self.state ?
                         dispatch.call(self, 'forward', 'hour') :
                         dispatch.call(self, 'backward', 'hour');
            }
        });
    }

    TimeLine.prototype.next = function next () {
        this.state = this.hours.next().value;
        return format(this.state+1);
    }

    TimeLine.prototype.getHours = function getHours () {
        return Array.apply(null, Array(24)).map(function (d,i) {
            return i+1;
        });
    }

    return TimeLine
})();