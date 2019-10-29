var CalendarModel = require('../models/calendar.js');

module.exports = (function () {
    
    function Calendar (onClick) {

        this.model = new CalendarModel();
        this.onClick = onClick;
        this.el = document.getElementById('calendar');
        this.el.innerHTML = '<div class="calendar-content"></div>';
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
        var calendarBody = this.el.children[0],
            weekRow,
            monthHeader;

        var monthHeader = document.createElement('div');
        monthHeader.classList.add('calendar__month-header');
        monthHeader.innerText = this.parseMonth(this.model.date.month);
        calendarBody.appendChild(monthHeader);

        var daysWrapper = document.createElement('div');
        daysWrapper.classList.add('calendar__days-wrapper');
        calendarBody.appendChild(daysWrapper);

        this.model.getMonth().map(function (day) {
            var dayEl = document.createElement('div');
            dayEl.classList.add('day');
            dayEl.innerText = day;
            dayEl.setAttribute('data-day', day);
            dayEl.setAttribute('data-month', self.model.date.month+1);
            dayEl.setAttribute('data-year', 2019);
            dayEl.addEventListener('click', function (ev) {
                var year = ev.currentTarget.getAttribute('data-year');
                var month = ev.currentTarget.getAttribute('data-month');
                var day = ev.currentTarget.getAttribute('data-day');    
                self.model.date = {
                    year: year,
                    month: month-1,
                    day: day
                };
                self.onClick(self.model.date);
            });
            daysWrapper.appendChild(dayEl);
        });

        // this.model.getCalendar().map((month, monthN) => {
        //     monthHeader = document.createElement('div');
        //     monthHeader.innerHTML = '<p>'+(monthN+1)+'</th>';
        //     calendarBody.appendChild(monthHeader);
        //     month.map((week, weekN) => {
        //         weekRow = document.createElement('tr');
        //         if (week.length != 7) {
        //             if (weekN == 0) {
        //                 week = Array.apply(null, Array(7 - week.length)).map(d => '').concat(week);
        //             } else {
        //                 week = week.concat(Array.apply(null, Array(7 - week.length)).map(d => ''));
        //             }
        //         }
        //         week.map(day => {
        //             var dayData = document.createElement('td');
        //             if (day !== '') {
        //                 dayData.setAttribute('data-day', day);
        //                 dayData.setAttribute('data-month', monthN+1);
        //                 dayData.setAttribute('data-year', 2019);
        //                 dayData.addEventListener('click', function (ev) {
        //                     var year = ev.currentTarget.getAttribute('data-year');
        //                     var month = ev.currentTarget.getAttribute('data-month');
        //                     var day = ev.currentTarget.getAttribute('data-day');    
        //                     self.model.date = {
        //                         year: year,
        //                         month: month-1,
        //                         day: day
        //                     };
        //                     self.onClick(self.model.date);
        //                 });
        //                 dayData.classList.add('day');
        //             }
        //             dayData.innerHTML = day;
        //             weekRow.appendChild(dayData);
        //         });
        //         calendarBody.appendChild(weekRow);
        //     });
        // });

        this.el.getElementsByClassName('day')[0].classList.add('active');
    }

    return Calendar;
})();