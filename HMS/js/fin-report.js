$(document).ready(function() {
  $('#loadingMessage').text('Loading Financial Data...');

  configureTableHeaders();

  getFinancialData();

});


// Set correct years for the table headers
function configureTableHeaders() {
  var currentYear = new Date().getFullYear();
  var previousYear = new Date();
  previousYear.setFullYear(currentYear-1);
  previousYear = previousYear.getFullYear();

  $('#currentYearHeader').text(currentYear);
  $('#previousYearHeader').text(previousYear);
}


// Get financial data from backend
function getFinancialData() {

  const url = baseApiUrl + '/management/report';

  sendGetWithCreds(url).then(function(data, status, jqXHR) {
    setTimeout(function() {

      addFinancialDataToTable(data);
      $('#loadingMessage').text('');
      $('#table-container').removeClass('d-none');

    }, 2000);
  })
  .fail(function(data, status, jqXHR) {
    setTimeout(function() {

      $('#loadingMessage').text('Error retrieving financial data.');

    }, 2000);
  });
}


// Add returned data to the financial report
function addFinancialDataToTable(data) {
  var currTodayTotal = 0;
  var currWeekTotal = 0;
  var currMonthTotal = 0;
  var currYearTotal = 0;

  var prevTodayTotal = 0;
  var prevWeekTotal = 0;
  var prevMonthTotal = 0;
  var prevYearTotal = 0;

  var tableHtml = '';

  Object.keys(data).forEach(roomtype => {
    var typeDataCurrent = data[roomtype].currentYear;
    var typeDataPrevious = data[roomtype].previousYear;

    var html = '<tr class="text-right">'
        + '<td>'+data[roomtype].name+'&emsp;</td>'
        + '<td>&nbsp;'+formatToLocaleCurrency(typeDataCurrent.today)+'&nbsp;</td>'
        + '<td>&nbsp;'+formatToLocaleCurrency(typeDataCurrent.wtd)+'&nbsp;</td>'
        + '<td>&nbsp;'+formatToLocaleCurrency(typeDataCurrent.mtd)+'&nbsp;</td>'
        + '<td>&nbsp;'+formatToLocaleCurrency(typeDataCurrent.ytd)+'&nbsp;</td>'
        + '<td>&nbsp;'+formatToLocaleCurrency(typeDataPrevious.today)+'&nbsp;</td>'
        + '<td>&nbsp;'+formatToLocaleCurrency(typeDataPrevious.wtd)+'&nbsp;</td>'
        + '<td>&nbsp;'+formatToLocaleCurrency(typeDataPrevious.mtd)+'&nbsp;</td>'
        + '<td>&nbsp;'+formatToLocaleCurrency(typeDataPrevious.ytd)+'&nbsp;</td>'
        + '</tr>';

    tableHtml += html;

    currTodayTotal += typeDataCurrent.today;
    currWeekTotal += typeDataCurrent.wtd;
    currMonthTotal += typeDataCurrent.mtd;
    currYearTotal += typeDataCurrent.ytd;

    prevTodayTotal += typeDataPrevious.today;
    prevWeekTotal += typeDataPrevious.wtd;
    prevMonthTotal += typeDataPrevious.mtd;
    prevYearTotal += typeDataPrevious.ytd;
  });

  tableHtml += '<tr class="text-right">'
      + '<td><b>Total Revenue&nbsp;</b></td>'
      + '<td>'+formatToLocaleCurrency(currTodayTotal)+'&nbsp;</td>'
      + '<td>&nbsp;'+formatToLocaleCurrency(currWeekTotal)+'&nbsp;</td>'
      + '<td>&nbsp;'+formatToLocaleCurrency(currMonthTotal)+'&nbsp;</td>'
      + '<td>&nbsp;'+formatToLocaleCurrency(currYearTotal)+'&nbsp;</td>'
      + '<td>&nbsp;'+formatToLocaleCurrency(prevTodayTotal)+'&nbsp;</td>'
      + '<td>&nbsp;'+formatToLocaleCurrency(prevWeekTotal)+'&nbsp;</td>'
      + '<td>&nbsp;'+formatToLocaleCurrency(prevMonthTotal)+'&nbsp;</td>'
      + '<td>&nbsp;'+formatToLocaleCurrency(prevYearTotal)+'&nbsp;</td>'
      + '</tr>';

  $('table').find('tbody').append(tableHtml);
}


function formatToLocaleCurrency(number) {
  return number.toLocaleString('en', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}



