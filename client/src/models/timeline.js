export default (function () {
  function format(hour) {
    return "h" + (hour < 10 ? "0" + hour : hour);
  }

  function dispatch(direction, type) {
    this.view.$el.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          type: type || "day",
          direction: direction || "forward",
          src: this,
        },
      })
    );
  }

  let _quiet = false;

  function TimeLine(view) {
    this.view = view;
    let _state = 0;
    this.hours = (function () {
      return (function* () {
        while (true) {
          yield (_state + 1) % 24;
        }
      })();
    })();

    Object.defineProperty(this, "hour", {
      get: () => {
        return format(_state + 1);
      },
      set: val => {
        const _old = _state;
        _state = val - 1 < 0 ? 23 : val - 1 > 23 ? 0 : val - 1;

        if (_quiet) return;

        if (_old == 23 && _state == 0) {
          dispatch.call(this, "forward", "day");
        } else if (_old == 0 && _state == 23) {
          dispatch.call(this, "backward", "day");
        } else if (_old < _state) {
          dispatch.call(this, "forward", "hour");
        } else {
          dispatch.call(this, "backward", "hour");
        }
      },
    });
  }

  TimeLine.prototype.next = function next() {
    _quiet = true;
    this.hour = this.hours.next().value + 1;
    _quiet = false;
    return this.hour;
  };

  TimeLine.prototype.getHours = function getHours() {
    return Array.apply(null, Array(24)).map(function (d, i) {
      return i + 1;
    });
  };

  return TimeLine;
})();
