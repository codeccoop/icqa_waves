module.exports = function Calendar (onClick) {
    this.el = document.getElementById('calendar');
    this.el.innerHTML = '<table class="calendar"></table>'
    var months = Array.apply(null, Array(10)).map((d, i) => i+1);
    var days = Array.apply(null, Array(31)).map((d, i) => i+1);
    var calendarBody = this.el.children[0];

    var weeks = new Array();
    days.reduce((a,d,i) => {
        if (i % 7 != 0) {
            a.push(i+1);
        } else {
            weeks.push(a);
            a = new Array();
            a.push(i+1);
        }
        return a;
    }, new Array());

    console.log(weeks);
    
    months.map(month => {
        var monthHeader = document.createElement('tr');
        monthHeader.innerHTML = '<th>'+month+'</th>';
        calendarBody.appendChild(monthHeader);
        weeks.map(week => {
            var weekRow = document.createElement('tr');
            week.map(day => {
                var dayData = document.createElement('td');
                dayData.addEventListener('click', () => onClick(month, day));
                dayData.innerHTML = day;
                weekRow.appendChild(dayData);
            });
            calendarBody.appendChild(weekRow);
        });
    });
}