var TimeLineModel = require('../models/timeline.js');

module.exports = (function () {
    
    function TimeLine (onClick) {
        var self = this;
        this.onClick = onClick;
        this.model = new TimeLineModel(this);
        this.el = document.getElementById('timeline');
        this.el.innerHTML = '<div class="timeline__content"></div>';

        var timelineBody = this.el.children[0];
        timelineBody.innerHTML = '<div class="timeline__nav backward">' +
            '<abbr title="navegació per hores">&laquo;</abbr>' +
        '</div>' +
        '<div class="timeline__hours-wrapper"></div>' +
        '<div class="timeline__nav forward">' +
            '<abbr title="navegació per hores">&raquo;</abbr>' +
        '</div>';

        this.el.addEventListener("change", function (ev) {
            if (self.randomNav) {
                ev.detail.type = "hour";
                self.randomNav = false;
            }
        }, true);

        Array.apply(null, this.el.getElementsByClassName('timeline__nav')).map(function (el) {
            el.addEventListener('click', function () {
                if (el.getAttribute('class').indexOf('forward') > 0) {
                    self.model.hour = 1*self.model.hour.replace(/h0?/, '') + 1;
                } else {
                    self.model.hour = 1*self.model.hour.replace(/h0?/, '') - 1;
                }
                self.onClick();
            });
        });
    }

    TimeLine.prototype.parseDay = function (index) {
        return (String(index).length == 1 ? '0'+index : index) + ':00';
    }

    TimeLine.prototype.render = function render () {
        var self = this;

        var hoursWrapper = this.el.getElementsByClassName('timeline__hours-wrapper')[0];
        hoursWrapper.innerHTML = "";

        var hourEl, row;
        this.model.getHours().map(function (hour, i, hours) {
            if (!row || i == Math.ceil(hours.length/2)) {
                row = document.createElement('div');
                row.setAttribute('class', 'timeline__hours-row');
                hoursWrapper.appendChild(row);
            }
            hourEl = document.createElement('div');
            hourEl.classList.add('hour');
            hourEl.innerText = self.parseDay(hour);
            hourEl.setAttribute('data-hour', hour);
            hourEl.addEventListener('click', function (ev) {
                var hour = ev.currentTarget.getAttribute('data-hour');
                if (hour != parseInt(self.model.hour.replace(/h0?/, ''))) {
                    self.randomNav = true;
                    self.model.hour = hour;
                };
                self.onClick();
            });
            row.appendChild(hourEl);
        });

        this.el.getElementsByClassName('hour')[0].classList.add('active');
    }

    return TimeLine;
})();