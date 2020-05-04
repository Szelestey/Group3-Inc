
$(document).ready(function() {

  $(window).resize(function() {
    if(this.resizeTo) clearTimeout(this.resizeTo);
    this.resizeTo = setTimeout(function() {
      $(this).trigger('resizeEnd');
    }, 300);
  });

  $(window).on('resizeEnd', function() {
    drawChart();
  });

  google.charts.load('current', {
    packages: ['line', 'corechart'],
    callback: drawChart
  });

});


function drawChart() {
  var occupancyData = new google.visualization.DataTable();
  occupancyData.addColumn('number', 'Weeks of Year');
  occupancyData.addColumn({type: 'string', role: 'tooltip', 'p':{'html':true}});
  occupancyData.addColumn('number', 'Projected Occupancy');
  occupancyData.addColumn('number', 'Actual Occupancy');

  sendGetWithCreds(baseApiUrl + "/management/occupancy")
  .done((data, status, jqXHR) => {
    occupancyData.addRows(data);
    var year = new Date().getFullYear();

    var options = {
      title: 'Hotel Occupancy Rate By Week of ' + year,
      hAxis: {
        title: 'Week of Year'
      },
      vAxis: {
        title: 'Percentage(%)',
        format: 'percent',
      },
      curveType: 'function',
      focusTarget: 'category',
      tooltip: {isHtml: true}
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(occupancyData, options);
    chart.setSelection([{row: 17, column: 2}]);
  });


}

