var CalendarView = require('./calendar.js');
var TimeLineView = require('./timeline.js');

module.exports = (function () {

    function onAnimationChange (run, el) {
        var animate = el || document.getElementById('animate');
        if (run) {
            this.start();
            animate.classList.add('active');
        } else {
            this.stop();
            animate.classList.remove('active');
        }
        this.animation = run;
    }

    function onInteractiveChange () {
        onAnimationChange.call(this, false);
    }

    function DateTime (onChange, config) {
        var self = this;
        this.config = config || new Object();
        this.throttleResolver;
        this.onChange = function (year, month, day, hour) {
            if (!self.config.background) {
                Array.apply(null, self.calendarView.el.getElementsByClassName('day')).map(function (el) {
                    if (el.getAttribute('data-year') == year && el.getAttribute('data-month') == month-1 && el.getAttribute('data-day') == day-1) {
                        el.classList.add('active');
                    } else {
                        el.classList.remove('active');
                    }
                });
                Array.apply(null, self.timeLineView.el.getElementsByClassName('hour')).map(function (el) {
                    if (el.getAttribute('data-hour') == hour.replace(/h0?/, '')) {
                        el.classList.add('active');
                    } else {
                        el.classList.remove('active');
                    }
                });
                
                return onChange.apply(null, arguments).then(function (geojson) {
                    document.body.classList.remove('waiting');
                    return geojson;
                }).catch(function (geojson) {
                    document.body.classList.remove('waiting');
                    return geojson;
                });
            } else {
                return onChange.apply(null, arguments);
            }
        };
        
        this.calendarView = new CalendarView(onInteractiveChange.bind(this), this.config);
        this.timeLineView = new TimeLineView(onInteractiveChange.bind(this), this.config);

        if (!this.config.background) {
            this.calendarView.render();
            this.timeLineView.render();

            this.calendarView.el.addEventListener("change", function (ev) {
                self.onChange(
                    self.calendarView.model.date.year, 
                    self.calendarView.model.date.month+1, 
                    self.calendarView.model.date.day+1,
                    self.timeLineView.model.hour
                );
            });
        }

        this.animation = false;
        document.getElementById("animate").addEventListener("click", function (ev) {
            onAnimationChange.call(self, !self.animation, ev.currentTarget);
        });

        this.timeLineView.el.addEventListener("change", function (ev) {
            if (ev.detail.type == "day") {
                if (ev.detail.direction == "forward") {
                    var newDay = self.calendarView.model.date.day;
                    newDay += 1;
                    self.calendarView.model.date = {day: newDay};
                } else {
                    var newDay = self.calendarView.model.date.day;
                    newDay -= 1;
                    self.calendarView.model.date = {day: newDay};
                }
            } else {
                self.onChange(
                    self.calendarView.model.date.year, 
                    self.calendarView.model.date.month+1, 
                    self.calendarView.model.date.day+1,
                    self.timeLineView.model.hour
                );
            }
        });
    }

    DateTime.prototype.start = function start () {
        var self = this;
        var hour, date, init, delta;

        function next () {
            init = new Date();
            new Promise(function (res, rej) {
                if (self.throttleResolver) {
                    self.throttleResolver = false;
                    res();
                    return;
                }
                hour = self.timeLineView.model.next();
                if (hour == 'h01') {
                    date = self.calendarView.model.next();
                } else {
                    date = self.calendarView.model.date;
                }

                self.onChange(date.year, Number(date.month)+1, date.day+1, hour).then(function () {
                    if (self.config.background) {
                        next();
                    } else {
                        delta = new Date() - init;
                        if (delta < 500) {
                            setTimeout(next, 500 - delta);
                        }
                    }
                });
            });
        }

        next();

        if (this.config.background) return;

        document.getElementById('canvas').classList.add('blocked');
    }

    DateTime.prototype.stop = function stop () {
        document.getElementById('canvas').classList.remove('blocked');
        this.throttleResolver = true;
    }

    return DateTime;
})();