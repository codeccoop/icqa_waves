var CalendarModel = require('../models/calendar.js');

module.exports = (function () {
    
    function Calendar (onClick) {
        var self = this;
        this.onClick = onClick;
        this.model = new CalendarModel(this);
        this.el = document.getElementById('calendar');
        this.el.innerHTML = '<div class="calendar__header"></div><div class="calendar__content"></div>';

        var timelineBody = this.el.children[1];
        timelineBody.innerHTML = '<div class="calendar__nav backward" scale="month"><abbr title="navegació per mesos">&lsaquo;</abbr></div>' +
            '<div class="calendar__nav backward" scale="day"><abbr title="navegació per dies">&laquo;</abbr></div>' +
                '<div class="calendar__days-wrapper"></div>' +
            '<div class="calendar__nav forward" scale="day"><abbr title="navegació per dies">&raquo;</abbr></div>' +
            '<div class="calendar__nav forward" scale="month"><abbr title="navegació per mesos">&rsaquo;</abbr></div>';

        this.el.addEventListener("change", function (ev) {
            if (ev.detail.type == "month") {
                self.render();
            }
        }, true);

        Array.apply(null, this.el.getElementsByClassName('calendar__nav')).map(function (el) {
            el.addEventListener('click', function () {
                if (el.getAttribute('class').indexOf('forward') > 0) {
                    if (el.getAttribute('scale') == 'month') {
                        self.model.date = {month: self.model.date.month + 1};
                    } else {
                        self.model.date = {day: self.model.date.day + 1};
                    }
                } else {
                    if (el.getAttribute('scale') == 'month') {
                        self.model.date = {month: self.model.date.month - 1};
                    } else {
                        self.model.date = {day: self.model.date.day - 1};
                    }
                }
                self.onClick();
            });
        });
    }

    var months = {
        0: "Gener",
        1: "Febrer",
        2: "Març",
        3: "Abril",
        4: "Maig",
        5: "Juny",
        6: "Juliol",
        7: "Agost",
        8: "Setembre",
        9: "Octubre",
        10: "Novembre",
        11: "Desembre"
    }

    Calendar.prototype.parseMonth = function (index) {
        return months[index];
    }

    Calendar.prototype.render = function () {
        var self = this;
        var daysWrapper = this.el.getElementsByClassName('calendar__days-wrapper')[0],
            monthHeader = this.el.children[0],
            monthHeader;

        monthHeader.innerText = this.parseMonth(this.model.date.month);
        daysWrapper.innerHTML = "";

        var row;
        this.model.getMonth().map(function (day, i, days) {
            if (!row || i == Math.ceil(days.length/2)) {
                row = document.createElement('div');
                row.setAttribute('class', 'calendar__days-row');
                daysWrapper.appendChild(row);
            }

            var dayEl = document.createElement('div');
            dayEl.classList.add('day');
            dayEl.innerText = day;
            dayEl.setAttribute('data-day', i);
            dayEl.setAttribute('data-month', self.model.date.month);
            dayEl.setAttribute('data-year', 2018);
            dayEl.addEventListener('click', function (ev) {
                var year = ev.currentTarget.getAttribute('data-year');
                var month = ev.currentTarget.getAttribute('data-month');
                var day = ev.currentTarget.getAttribute('data-day');    
                self.model.date = {
                    year: Number(year),
                    month: Number(month),
                    day: Number(day)
                };
                self.onClick();
            });
            row.appendChild(dayEl);
        });

        this.el.getElementsByClassName('day')[0].classList.add('active');
    }

    return Calendar;
})();