var CalendarView = require('./calendar.js');
var TimeLineView = require('./timeline.js');

module.exports = (function () {
    
    var interval;

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

    function DateTime (onChange) {
        var self = this;
        this.onChange = function (year, month, day, hour) {
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
            onChange.apply(null, arguments);
        };
        this.calendarView = new CalendarView(onInteractiveChange.bind(this));
        this.calendarView.render();
        this.calendarView.el.addEventListener("change", function (ev) {
            self.onChange(
                self.calendarView.model.date.year, 
                self.calendarView.model.date.month+1, 
                self.calendarView.model.date.day+1,
                self.timeLineView.model.hour
            );
        });
        this.timeLineView = new TimeLineView(onInteractiveChange.bind(this));
        this.timeLineView.render();
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

        this.animation = false;
        document.getElementById("animate").addEventListener("click", function (ev) {
            onAnimationChange.call(self, !self.animation, ev.currentTarget);
        });
    }

    DateTime.prototype.start = function start () {
        var self = this;
        var hour, date;
        interval = setInterval(function () {
            hour = self.timeLineView.model.next();
            if (hour == 'h01') {
                date = self.calendarView.model.next();
            } else {
                date = self.calendarView.model.date;
            }

            self.onChange(date.year, Number(date.month)+1, date.day+1, hour);
        }, 1000);
        document.getElementById('canvas').classList.add('blocked');
    }

    DateTime.prototype.stop = function stop () {
        document.getElementById('canvas').classList.remove('blocked');
        clearInterval(interval);
    }

    return DateTime;
})();