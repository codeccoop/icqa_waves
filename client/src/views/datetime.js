import CalendarView from "./calendar.js";
import TimeLineView from "./timeline.js";

export default (function () {
  function onAnimationChange(run, el) {
    if (run) {
      this.start();
    } else {
      this.animation && this.stop();
    }
    this.animation = run;
  }

  function onInteractiveChange() {
    onAnimationChange.call(this, false);
  }

  function DateTime(onChange, config) {
    this.config = config || new Object();
    this.throttleResolver;
    this.onChange = (year, month, day, hour) => {
      if (!this.config.background) {
        Array.apply(null, this.calendarView.$el.getElementsByClassName("day")).forEach(
          $el => {
            if (
              $el.dataset.year == year &&
              $el.dataset.month == month - 1 &&
              $el.dataset.day == day
            ) {
              $el.classList.add("active");
              $el.classList.remove("disabled");
            } else {
              $el.classList.remove("active");
            }

            const today = this.calendarView.model.today;
            $el.classList.remove("disabled");
            if (
              this.calendarView.model.isTomorrow({
                year: $el.dataset.year,
                month: $el.dataset.month,
                day: $el.dataset.day,
              })
            ) {
              $el.classList.add("disabled");
            }
          }
        );
        Array.apply(null, this.timeLineView.$el.getElementsByClassName("hour")).forEach(
          $el => {
            if ($el.dataset.hour == hour.replace(/h0?/, "")) {
              $el.classList.add("active");
            } else {
              $el.classList.remove("active");
            }
          }
        );
        Array.apply(
          null,
          this.calendarView.$el.getElementsByClassName("calendar__nav")
        ).forEach($el => {
          $el.classList.remove("disabled");
          if (!$el.classList.contains("forward")) return;
          const today = this.calendarView.model.today;
          if (year == today.getFullYear()) {
            if ($el.getAttribute("scale") === "month") {
              if (this.calendarView.model.isTomorrow({ year, day, month: month })) {
                $el.classList.add("disabled");
              }
            } else {
              if (
                this.calendarView.model.isTomorrow({
                  year,
                  month: month - 1,
                  day: day + 1,
                })
              ) {
                $el.classList.add("disabled");
              }
            }
          }
        });

        return onChange
          .call(null, year, month, day)
          .then(function (geojson) {
            return geojson;
          })
          .catch(function (geojson) {
            return geojson;
          });
      } else {
        return onChange.call(null, year, month, day);
      }
    };

    this.calendarView = new CalendarView(onInteractiveChange.bind(this), this.config);
    this.timeLineView = new TimeLineView(onInteractiveChange.bind(this), this.config);

    if (!this.config.background) {
      this.calendarView.render();
      this.timeLineView.render();

      this.calendarView.$el.addEventListener("change", ev => {
        this.onChange(
          this.calendarView.model.date.year,
          this.calendarView.model.date.month + 1,
          this.calendarView.model.date.day,
          this.timeLineView.model.hour
        );
      });
    }

    this.animation = false;
    document.getElementById("animate").addEventListener("click", ev => {
      onAnimationChange.call(this, !this.animation, ev.currentTarget);
    });

    this.timeLineView.$el.addEventListener("change", ev => {
      if (ev.detail.type == "day") {
        if (ev.detail.direction == "forward") {
          this.calendarView.model.date = { day: this.calendarView.model.date.day + 1 };
        } else {
          this.calendarView.model.date = { day: this.calendarView.model.date.day - 1 };
        }
      } else {
        this.onChange(
          this.calendarView.model.date.year,
          this.calendarView.model.date.month + 1,
          this.calendarView.model.date.day,
          this.timeLineView.model.hour
        );
      }
    });
  }

  DateTime.prototype.start = function start() {
    let hour, date, init, delta;

    const next = () => {
      init = new Date();
      if (this.throttleResolver) {
        this.throttleResolver = false;
        return;
      }

      hour = this.timeLineView.model.next();
      if (hour == "h01") {
        const currentDate = date;
        date = this.calendarView.model.next();
        if (date.day == currentDate.day) {
          this.stop();
        }
      } else {
        date = this.calendarView.model.date;
      }

      this.onChange(date.year, Number(date.month) + 1, date.day, hour).then(() => {
        if (this.config.background) {
          next();
        } else {
          delta = new Date() - init;
          if (delta < 500) {
            setTimeout(next, 500 - delta);
          } else {
            next();
          }
        }
      });
    };

    next();

    if (this.config.background) return;

    document.getElementById("canvas").classList.add("blocked");
    document.getElementById("animate").classList.add("active");
  };

  DateTime.prototype.stop = function stop() {
    document.getElementById("canvas").classList.remove("blocked");
    document.getElementById("animate").classList.remove("active");
    this.throttleResolver = true;
    this.animation = false;
  };

  return DateTime;
})();
