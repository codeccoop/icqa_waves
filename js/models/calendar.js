module.exports = (function () {
    
    var _calendar,
        _year,
        _state = {year: 2019, month: 0, day: 1};

    Object.freeze(_state);

        
    var month,
        date,
        day,
        weekArray = new Array(),
        monthArray = new Array();

    _calendar = Array.apply(null, Array(365)).reduce(function (acum, d, i) {
        date = new Date("2019");
        date.setDate(i+1);
        if ((month || 0) != date.getMonth()) {
            monthArray.push(weekArray);
            weekArray = new Array();
            acum.push(monthArray);
            monthArray = new Array();
        }
        day = date.getDay();
        weekArray.push(date.getDate());
        if (day == 0) {
            monthArray.push(weekArray);
            weekArray = new Array();
        }
        month = date.getMonth();
        return acum;
    }, new Array());
    Object.freeze(_calendar);

    _year = _calendar.reduce(function (acum, month) {
        acum.push(month.reduce(function (acum, week) {
            week.map(function (day) {
                acum.push(day);
            });
            return acum;
        }, new Array()));
        return acum;
    }, new Array());
    Object.freeze(_year);

    var dates = (function () {
        var day, month, year;
        return (function* () {
            while (true) {
                day = _state.day + 1;
                month = _state.month;
                year = _state.year;
                
                if (day == _year[month].length) {
                    day = 0;
                    month++;
                }

                if (month == 12) {
                    month = 0;
                    year++;
                }

                date = {
                    year: year,
                    month: month,
                    day: day
                }

                yield date;
            }
        })();
    })();

    function Calendar () {
        Object.defineProperty(this, 'date', {
            set: function (val) {
                _state = Object.keys(val).reduce(function (acum, key) {
                    acum[key] = val[key] || _state[key];
                    return acum;
                }, new Object());
                Object.freeze(_state);
            },
            get: function () {
                return _state;
            }
        })
    }

    Calendar.prototype.getYear = function getMatrix () {
        return _year;
    }
    
    Calendar.prototype.getCalendar = function getWeeked () {
        return _calendar;
    }

    Calendar.prototype.getMonth = function getMonth () {
        return _year[this.date.month];
    }

    Calendar.prototype.next = function next () {
        _state = dates.next().value;
        Object.freeze(_state);
        return _state;
    }

    return Calendar;
})();