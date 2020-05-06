const dateFns = require('date-fns');
const reservationService = require('../services/reservation.service');
const roomService = require('../services/rooms.service');
const mgmtService = require('../services/management.service');



module.exports = {
  getOccupancyData,
  cancelReservation,
  getFinancialReportData
}


// Retrieves occupancy data to be displayed by a Google line chart
async function getOccupancyData(req, res, next) {
  var promises = [];
  promises.push(reservationService.getReservationsInCalendarYear());
  promises.push(roomService.getTotalAvailableRooms());

  Promise.all(promises).then(results => {
    var reservations = results[0];
    var totalRoomsAvailablePerWeek = results[1]*7;

    var occupancyArr = generateInitialOccupancyArray();
    reservations.forEach(reservation => {
      addReservationToOccupancyData(reservation, occupancyArr);
    });

    convertOccupancyData(occupancyArr, totalRoomsAvailablePerWeek);
    res.status(200).json(occupancyArr);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({error: "Server error"});
  });
}


// Generates an occupancy array to add reservation data to
function generateInitialOccupancyArray() {
  var arr = [];
  for(var i=1; i<=52; i++) {
    var currYearVal = (i <= getWeek(new Date())) ? 0 : null;
    arr.push([i,0,currYearVal, '']);
  }
  return arr;
}


// Adds a information from a single reservation to the occupancy data array
function addReservationToOccupancyData(reservation, occupancyArr) {
  var checkin = new Date(reservation.check_in_date);
  var currDate = new Date();
  var weekIndex = getWeek(checkin) - 1;
  if(checkin > currDate && getWeek(checkin) > getWeek(currDate)) {
    // check-in date is after current date, add to projected occupancy
    occupancyArr[weekIndex][1]++;
  } else if(checkin <= currDate && getWeek(checkin) <= getWeek(currDate)) {
    // check-in is on or before current date

    // Only add non-cancelled reservations to actual occupancy
    if(reservation.status !== 'cancelled') {
      occupancyArr[weekIndex][2]++;
    }
    // add cancelled and non-cancelled to projected
    occupancyArr[weekIndex][1]++;
  }
}


// Returns the week number
function getWeek(date) {
  return dateFns.getWeek(date, {weekStartsOn: 1});
}


function convertOccupancyData(occupancyData, totalRooms) {
  for(var i=0; i<occupancyData.length; i++) {
    var week = occupancyData[i];
    var actual = week[2];
    var projected = week[1];
    var actualTooltip = (actual===null) ? 'TBD' : actual;

    week[1] = getWeekTooltip(actualTooltip, projected, week[0], totalRooms);
    week[2] = projected/totalRooms;
    if(actual !== null) {
      week[3] = actual / totalRooms;
    } else {
      week[3] = null;
    }
  }
}


// Creates the tooltip html to be used in the Google line chart
function getWeekTooltip(actual, projected, week, totalRooms) {
  return "<p style='white-space: nowrap;font-weight:normal;font-size:18px;padding:10px'>"
      + "<em>Week "+week+"</em><br/><br/>"
      + "Max Occupancy: <strong>"+totalRooms+"</strong><br/>"
      + "Projected Occupancy: <strong>"+projected+"</strong><br/>"
      + "Actual Occupancy: <strong>"+actual+"</strong>"
      + "</p>";
}


// Cancels a reservation
// TODO: finish
function cancelReservation(req, res, next) {
  if(Math.random() < 0.5) {
    res.status(200).send();
    res.end();
  } else {
    res.status(400).json({error: "Error cancelling reservation" + req.body.reservationId});
    res.end();
  }
}


// Returns financial data for the current and the previous year
async function getFinancialReportData(req, res, next) {
  const currYear = new Date().getFullYear();
  var prevYear = new Date();
  prevYear.setFullYear(currYear-1);
  prevYear = prevYear.getFullYear();

  mgmtService.getFinancialDataPerRoom(currYear, prevYear).then(results => {

    var finData = buildFinData(results);

    res.status(200).json(finData);
  })
  .catch(error => {
    console.log("CONTROLLER ERROR: "+error.stack);
    res.status(400).json({error: "Error retrieving financial data"});
  });
}


function buildFinData(data) {
  var finData = {};

  var currDate = new Date();
  var prevYearCurrDate = new Date();
  prevYearCurrDate.setFullYear(currDate.getFullYear()-1);

  data.forEach(payment => {

    if(dateFns.isSameYear(currDate,new Date(payment.date))) {
      addPaymentToFinData(payment, "currentYear", finData, currDate);
    } else {
      addPaymentToFinData(payment, "previousYear", finData, prevYearCurrDate);
    }

  });

  return finData;

}


function addPaymentToFinData(payment, yearTitle, finData, currDate) {
  if(!Object.keys(finData).includes(payment.roomtype)) {
    addRoomTypeToFinData(payment.roomtype, payment.roomname, finData);
  }

  var yearData = finData[payment.roomtype][yearTitle];
  var paymentDate = new Date(payment.date);

  // Check if payment is same year and <= current date
  if(dateFns.isSameYear(paymentDate, currDate) &&
      (dateFns.isBefore(paymentDate, currDate) || dateFns.isSameDay(paymentDate, currDate))) {

    // Add amount to YTD number
    yearData.ytd += payment.amount;

    // Check if payment is same month and <= current date
    if(dateFns.isSameMonth(paymentDate, currDate) &&
        (dateFns.isSameDay(paymentDate, currDate) || dateFns.isBefore(paymentDate, currDate))) {

      // Add amount to MTD number
      yearData.mtd += payment.amount;
    }

    // Check if payment is same week and <= current date
    if(dateFns.isSameWeek(paymentDate, currDate) &&
        (dateFns.isSameDay(paymentDate, currDate) || dateFns.isBefore(paymentDate, currDate))) {

      // Add amount to WTD number
      yearData.wtd += payment.amount;
    }

    // Check if payment is same day
    if(dateFns.isSameDay(paymentDate, currDate)) {

      // Add amount to today number
      yearData.today += payment.amount;
    }

  }
}


function addRoomTypeToFinData(type, name, finData) {
  finData[type] = {};

  finData[type].name = name;

  finData[type].currentYear = {};
  finData[type].currentYear.today = 0;
  finData[type].currentYear.wtd = 0;
  finData[type].currentYear.mtd = 0;
  finData[type].currentYear.ytd = 0;

  finData[type].previousYear = {};
  finData[type].previousYear.today = 0;
  finData[type].previousYear.wtd = 0;
  finData[type].previousYear.mtd = 0;
  finData[type].previousYear.ytd = 0;
}
