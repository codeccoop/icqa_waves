export default (function () {
  const date = new Date();
  date.setMonth(0);
  date.setDate(1);
  date.setHours(1);
  date.setMinutes(0);
  date.setSeconds(0);

  let month = date.getMonth(),
    day = date.getDate(),
    weekArray = [],
    monthArray = [];
  const _calendar = Array.apply(null, Array(365)).reduce(function (acum, d, i) {
    if (month != date.getMonth()) {
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
    date.setDate(date.getDate() + 1);
    return acum;
  }, new Array());

  monthArray.push(weekArray);
  _calendar.push(monthArray);
  Object.freeze(_calendar);

  const _year = _calendar.reduce(function (acum, month) {
    acum.push(
      month.reduce(function (acum, week) {
        week.map(function (day) {
          acum.push(day);
        });
        return acum;
      }, new Array())
    );
    return acum;
  }, new Array());
  Object.freeze(_year);

  function dispatch(direction, type) {
    this.view.$el.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          type: type || "month",
          direction: direction || "forward",
          src: this,
        },
      })
    );
  }

  let _quiet = false;
  function Calendar(view) {
    var self = this;

    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.today = today;

    this.view = view;

    const _state = {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate(),
    };

    this.dates = (function (self) {
      let day, month, year;
      return (function* () {
        while (true) {
          day = _state.day + 1;
          month = _state.month;
          year = _state.year;

          if (day === _year[month].length) {
            day = 1;
            month++;
          }

          if (month === 12) {
            month = 0;
            year++;
          }

          yield {
            year: year,
            month: month,
            day: day,
          };
        }
      })();
    })(this);

    Object.defineProperty(this, "date", {
      set: val => {
        const _old = { ..._state };
        ["day", "month", "year"].forEach(key => {
          if (!isNaN(val[key])) {
            if (key === "year") {
              _state[key] = val[key];
            } else if (key == "month") {
              if (val[key] < 0) {
                _state[key] = 12 + (val[key] % 12);
                _state.year = val.year != undefined ? val.year - 1 : _old.year - 1;
              } else if (val[key] >= 12) {
                _state[key] = val[key] % 12;
                _state.year = val.year != undefined ? val.year + 1 : _old.year + 1;
              } else {
                _state[key] = val[key];
              }

              if (_year[_state[key]].length <= _state.day) {
                _state.day = _year[_state[key]].length - 1;
              }
            } else {
              if (val[key] < 1) {
                _state[key] = this.getMonth(-1).length + val[key];
                _state.month = val.state != undefined ? val.month - 1 : _old.month - 1;
              } else if (val[key] > this.getMonth().length) {
                _state[key] = val[key] - this.getMonth().length;
                _state.month = val.month != undefined ? val.month + 1 : _old.month + 1;
              } else {
                _state[key] = val[key];
              }
            }
          }
        });

        // if (_state.year >= this.today.getFullYear() && _state.month >= today.getMonth()) {
        if (this.isTomorrow(_state)) {
          _state.day = this.today.getDate();
        }

        if (_quiet) return;

        _old.month > _state.month
          ? dispatch.call(this, "backward")
          : _old.month < _state.month
          ? dispatch.call(this, "forward")
          : null;

        _old.day > _state.day
          ? dispatch.call(this, "backward", "day")
          : _old.day < _state.day
          ? dispatch.call(this, "forward", "day")
          : null;
      },
      get: () => {
        return { ..._state };
      },
    });
  }

  Calendar.prototype.getYear = function getMatrix() {
    return _year;
  };

  Calendar.prototype.getCalendar = function getWeeked() {
    return _calendar;
  };

  Calendar.prototype.getMonth = function getMonth(seek) {
    seek = isNaN(seek) ? 0 : seek;
    let index = this.date.month + seek;
    index = index < 0 ? (_year.length + index) % _year.length : index % _year.length;
    return _year[index];
  };

  Calendar.prototype.next = function next() {
    _quiet = true;
    this.date = this.dates.next().value;
    _quiet = false;
    return this.date;
  };

  Calendar.prototype.isTomorrow = function isTomorrow(date) {
    const _date = new Date("2000-1-1 00:00");
    _date.setFullYear(date.year);
    _date.setMonth(date.month);
    _date.setDate(date.day);
    return _date.getTime() > this.today.getTime();
  };

  return Calendar;
})();
