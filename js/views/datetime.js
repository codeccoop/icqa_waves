var CalendarView = require('./calendar.js');
var TimeLineView = require('./timeline.js');

module.exports = (function () {
    
    var interval;

    function onCalendarClick (date) {
        this.stop();
        var hour = this.timeLineView.model.hour;
        this.onChange(date.year, Number(date.month)+1, date.day, hour);
    }
    
    function onTimeLineClick (hour) {
        this.stop();
        var date = this.calendarView.model.date;
        this.onChange(date.year, Number(date.month)+1, date.day, hour);
    }

    function DateTime (onChange) {
        var self = this;
        this.onChange = function (year, month, day, hour) {
            Array.apply(null, self.calendarView.el.getElementsByClassName('day')).map(function (el) {
                if (el.getAttribute('data-year') == year && el.getAttribute('data-month') == month && el.getAttribute('data-day') == day) {
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
        this.calendarView = new CalendarView(onCalendarClick.bind(this));
        this.calendarView.render();
        this.timeLineView = new TimeLineView(onTimeLineClick.bind(this));
        this.timeLineView.render();
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

            self.onChange(date.year, Number(date.month)+1, date.day, hour);
        }, 1000);
    }

    DateTime.prototype.stop = function stop () {
        clearInterval(interval);
    }

    return DateTime;
})();