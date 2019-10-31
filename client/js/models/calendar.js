module.exports = (function () {
    
    var _calendar,
        _year;
        
    var month,
        date,
        day,
        weekArray = new Array(),
        monthArray = new Array();

    _calendar = Array.apply(null, Array(365)).reduce(function (acum, d, i) {
        date = new Date("2018");
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
    monthArray.push(weekArray);
    _calendar.push(monthArray);
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

    function dispatch (direction, type) {
        this.view.el.dispatchEvent(new CustomEvent("change", {
            detail: {
                type: type || "month",
                direction: direction || "forward",
                src: this
            }
        }));
    }

    function Calendar (view) {
        var self = this;
        this.view = view;
        this.state = {year: 2018, month: 0, day: 0};
        Object.freeze(this.state);
        this.dates = (function () {
            var day, month, year;
            return (function* () {
                while (true) {
                    day = self.state.day + 1;
                    month = self.state.month;
                    year = self.state.year;
                    
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
        Object.defineProperty(this, 'date', {
            set: function (val) {
                var _old = self.state;
                self.state = ["day", "month", "year"].reduce(function (acum, key) {
                    if (val[key] == undefined) {
                        acum[key] = self.state[key];
                    } else {
                        if (key == 'year') {
                            acum[key] = 2018; // val[key];
                        } else if (key == 'month') {
                            if (val[key] < 0) {
                                acum[key] = 12+val[key]%12;
                                val["year"] = val["year"] != undefined ? val["year"] - 1 : self.state["year"] - 1;
                            } else if (val[key] >= 12) {
                                acum[key] = val[key]%12;    
                                val["year"] = val["year"] != undefined ? val["year"] + 1 : self.state["year"] + 1;
                            } else {
                                acum[key] = val[key];
                            }

                            if (_year[acum[key]].length <= acum.day) {
                                acum.day = _year[acum[key]].length - 1;
                            }
                        } else {
                            if (val[key] < 0) {
                                acum[key] = self.getMonth(-1).length + val[key];
                                val["month"] = val["month"] != undefined ? val["month"] - 1 : self.state["month"] - 1;
                            } else if (val[key] >= self.getMonth().length) {
                                acum[key] = val[key] - self.getMonth().length;
                                val["month"] = val["month"] != undefined ? val["month"] + 1 : self.state["month"] + 1;
                            } else {
                                acum[key] = val[key];
                            }
                        }
                    }
                    return acum;
                }, new Object());
                Object.freeze(self.state);

                _old.month > self.state.month ?
                    dispatch.call(self, 'backward') :
                    _old.month < self.state.month ?
                        dispatch.call(self, 'forward') :
                        null;

                _old.day > self.state.day ?
                    dispatch.call(self, 'backward', 'day') :
                    _old.day < self.state.day ?
                        dispatch.call(self, 'forward', 'day') :
                        null;
            },
            get: function () {
                return self.state;
            }
        })
    }

    Calendar.prototype.getYear = function getMatrix () {
        return _year;
    }
    
    Calendar.prototype.getCalendar = function getWeeked () {
        return _calendar;
    }

    Calendar.prototype.getMonth = function getMonth (correction) {
        var index = this.date.month+(correction || 0);
        index = index < 0 ? (_year.length + index) % _year.length : index % _year.length;
        return _year[index];
    }

    Calendar.prototype.next = function next () {
        this.state = this.dates.next().value;
        Object.freeze(this.state);
        return this.state;
    }

    return Calendar;
})();