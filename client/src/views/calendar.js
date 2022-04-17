import CalendarModel from "../models/calendar.js";

export default (function () {
  function Calendar(onClick, config) {
    this.onClick = onClick;
    this.model = new CalendarModel(this);
    this.$el = document.getElementById("calendar");

    if (config.background) return this;

    this.$el.innerHTML =
      '<div class="calendar__header"></div><div class="calendar__content"></div>';

    const $timelineBody = this.$el.children[1];
    $timelineBody.innerHTML =
      '<div class="calendar__nav backward" scale="month"><abbr title="navegació per mesos">&lsaquo;</abbr></div>' +
      '<div class="calendar__nav backward" scale="day"><abbr title="navegació per dies">&laquo;</abbr></div>' +
      '<div class="calendar__days-wrapper"></div>' +
      '<div class="calendar__nav forward disabled" scale="day"><abbr title="navegació per dies">&raquo;</abbr></div>' +
      '<div class="calendar__nav forward disabled" scale="month"><abbr title="navegació per mesos">&rsaquo;</abbr></div>';

    this.$el.addEventListener(
      "change",
      ev => {
        if (ev.detail.type == "month") {
          this.render();
        }
      },
      true
    );

    Array.apply(null, this.$el.getElementsByClassName("calendar__nav")).forEach($el => {
      $el.addEventListener("click", () => {
        if ($el.getAttribute("class").indexOf("forward") > 0) {
          if ($el.getAttribute("scale") == "month") {
            this.model.date = { month: this.model.date.month + 1 };
          } else {
            this.model.date = { day: this.model.date.day + 1 };
          }
        } else {
          if ($el.getAttribute("scale") == "month") {
            this.model.date = { month: this.model.date.month - 1 };
          } else {
            this.model.date = { day: this.model.date.day - 1 };
          }
        }
        this.onClick();
      });
    });
  }

  const months = {
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
    11: "Desembre",
  };

  Calendar.prototype.parseMonth = function parseMonth(index) {
    return months[index];
  };

  Calendar.prototype.render = function render() {
    const $daysWrapper = this.$el.getElementsByClassName("calendar__days-wrapper")[0];
    const $monthHeader = this.$el.children[0];

    $monthHeader.innerText =
      this.parseMonth(this.model.date.month) + " " + this.model.date.year;
    $daysWrapper.innerHTML = "";

    let $row, $el;
    this.model.getMonth().forEach((day, i, days) => {
      if (!$row || i == Math.ceil(days.length / 2)) {
        $row = document.createElement("div");
        $row.setAttribute("class", "calendar__days-row");
        $daysWrapper.appendChild($row);
      }

      $el = document.createElement("div");
      $el.classList.add("day");
      $el.innerText = day;
      $el.setAttribute("data-day", day);
      $el.setAttribute("data-month", this.model.date.month);
      $el.setAttribute("data-year", this.model.date.year);
      $el.addEventListener(
        "click",
        (function (self) {
          return function (ev) {
            if (ev.target.classList.contains("disabled")) return;
            self.model.date = {
              year: Number(ev.target.getAttribute("data-year")),
              month: Number(ev.target.getAttribute("data-month")),
              day: Number(ev.target.getAttribute("data-day")),
            };
            self.onClick();
          };
        })(this)
      );
      if (day === this.model.today.getDate()) {
        $el.classList.add("active");
      } else if (day > this.model.today.getDate()) {
        $el.classList.add("disabled");
      }
      $row.appendChild($el);
    });
  };

  return Calendar;
})();
