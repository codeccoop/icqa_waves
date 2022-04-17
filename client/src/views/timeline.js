import TimeLineModel from "../models/timeline.js";

export default (function () {
  function TimeLine(onClick, config) {
    this.onClick = onClick;
    this.model = new TimeLineModel(this);
    this.$el = document.getElementById("timeline");

    if (config.background) return this;

    this.$el.innerHTML = '<div class="timeline__content"></div>';

    const $timelineBody = this.$el.children[0];
    $timelineBody.innerHTML =
      '<div class="timeline__nav backward">' +
      '<abbr title="navegació per hores">&laquo;</abbr>' +
      "</div>" +
      '<div class="timeline__hours-wrapper"></div>' +
      '<div class="timeline__nav forward">' +
      '<abbr title="navegació per hores">&raquo;</abbr>' +
      "</div>";

    this.$el.addEventListener(
      "change",
      ev => {
        if (this.randomNav) {
          ev.detail.type = "hour";
          this.randomNav = false;
        }
      },
      true
    );

    Array.apply(null, this.$el.getElementsByClassName("timeline__nav")).forEach($el => {
      $el.addEventListener("click", () => {
        if ($el.getAttribute("class").indexOf("forward") > 0) {
          this.model.hour = 1 * this.model.hour.replace(/h0?/, "") + 1;
        } else {
          this.model.hour = 1 * this.model.hour.replace(/h0?/, "") - 1;
        }
        this.onClick(this.model.hour);
      });
    });
  }

  TimeLine.prototype.parseHour = function parseHour(index) {
    return (String(index).length == 1 ? "0" + index : index) + ":00";
  };

  TimeLine.prototype.render = function render() {
    const $hoursWrapper = this.$el.getElementsByClassName("timeline__hours-wrapper")[0];
    $hoursWrapper.innerHTML = "";

    let $hour, $row;
    this.model.getHours().forEach((hour, i, hours) => {
      if (!$row || i == Math.ceil(hours.length / 2)) {
        $row = document.createElement("div");
        $row.setAttribute("class", "timeline__hours-row");
        $hoursWrapper.appendChild($row);
      }
      $hour = document.createElement("div");
      $hour.classList.add("hour");
      $hour.innerText = this.parseHour(hour);
      $hour.setAttribute("data-hour", hour);
      $hour.addEventListener(
        "click",
        (function (self) {
          return function (ev) {
            const hour = ev.target.dataset.hour;
            if (hour != parseInt(self.model.hour.replace(/h0?/, ""))) {
              self.randomNav = true;
              self.model.hour = hour;
            }
            self.onClick();
          };
        })(this)
      );
      if (i === 0) {
        $hour.classList.add("active");
      }
      $row.appendChild($hour);
    });
  };

  return TimeLine;
})();
