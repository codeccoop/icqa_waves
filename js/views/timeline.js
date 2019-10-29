var TimeLineModel = require('../models/timeline.js');

module.exports = (function () {
    
    function TimeLine (onClick) {
    
        this.model = new TimeLineModel();
        this.onClick = onClick;
        this.el = document.getElementById('timeline');
        this.el.innerHTML = '<div class="timeline-content"></div>';

        var timelineBody = this.el.children[0];
        timelineBody.innerHTML = '<div class="timeline__nav backward">&laquo;</div><div class="timeline__hours-wrapper"></div><div class="timeline__nav forward">&raquo;</div>';
    }

    TimeLine.prototype.parseDay = function (index) {
        return (String(index).length == 1 ? '0'+index : index) + ':00';
    }

    TimeLine.prototype.render = function render () {
        var self = this;

        var hoursWrapper = this.el.getElementsByClassName('timeline__hours-wrapper')[0];

        var hourEl;
        this.model.getHours().map(function (hour) {
            hourEl = document.createElement('div');
            hourEl.classList.add('hour');
            hourEl.innerText = self.parseDay(hour);
            hourEl.setAttribute('data-hour', hour);
            hourEl.addEventListener('click', function (ev) {
                var hour = ev.currentTarget.getAttribute('data-hour');
                self.model.hour = hour;
                self.onClick(self.model.hour);
            });
            hoursWrapper.appendChild(hourEl);
        });

        this.el.getElementsByClassName('hour')[0].classList.add('active');

        Array.apply(null, this.el.getElementsByClassName('timeline__nav')).map(function (el) {
            el.addEventListener('click', function () {
                debugger;
                el.getAttribute('class').indexOf('forward') > 0 ?
                    self.model.hour = self.model.hour + 1 :
                    self.model.hour = self.model.hour - 1;

                self.onClick(self.model.hour);
            });
        })
    }

    return TimeLine;
})();