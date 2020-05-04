const dateFns = require('date-fns');
const reservationService = require('../services/reservation.service');
const roomService = require('../services/rooms.service');



module.exports = {
  getOccupancyData,
  cancelReservation
}


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


function generateInitialOccupancyArray() {
  var arr = [];
  for(var i=1; i<=52; i++) {
    var currYearVal = (i <= getWeek(new Date())) ? 0 : null;
    arr.push([i,0,currYearVal, '']);
  }
  return arr;
}


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

function getWeekTooltip(actual, projected, week, totalRooms) {
  return "<p style='white-space: nowrap;font-weight:normal;font-size:18px;padding:10px'>"
      + "<em>Week "+week+"</em><br/><br/>"
      + "Max Occupancy: <strong>"+totalRooms+"</strong><br/>"
      + "Projected Occupancy: <strong>"+projected+"</strong><br/>"
      + "Actual Occupancy: <strong>"+actual+"</strong>"
      + "</p>";
}


function cancelReservation(req, res, next) {
  if(Math.random() < 0.5) {
    res.status(200).send();
    res.end();
  } else {
    res.status(400).json({error: "Error cancelling reservation" + req.body.reservationId});
    res.end();
  }
}
