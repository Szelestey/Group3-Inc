const eachDayOfInterval = require('date-fns/eachDayOfInterval');
const roomService = require('./rooms.service');
const db = require('../db/db');


module.exports = {
  getAvailableRoomsForInterval,
  verifyAvailability
};


// Returns all room type info and the rooms available each day of the interval
function getAvailableRoomsForInterval(checkin, checkout) {
  var days = eachDayOfInterval({start: checkin, end: checkout});
  days.pop();

  var promises = [];
  promises.push(roomService.getAllRoomTypeInfo());
  days.forEach(day => {
    promises.push(getRoomsAvailableOnDate(day.toISOString().slice(0,10)));
  });

  return Promise.all(promises);
}


function verifyAvailability(roomtype, checkin, checkout) {
  var days = eachDayOfInterval({start: checkin, end: checkout});
  days.pop();

  var promises = [];
  days.forEach(day => {
    promises.push(getRoomsAvailableOnDate(day.toISOString().slice(0,10)));
  });

  var result = {verification: true};
  return Promise.all(promises).then(results => {
    results.forEach(dayResults => {
      if(!dayResults.includes(roomtype)) {
        result.verification = false;
        return result;
      }
    });
    return result;
  })
  .catch(error => {
    result.error = error.toString();
    return result;
  });
}


// Returns the available room types for a given day
function getRoomsAvailableOnDate(date) {
  const query = "SELECT roomtype FROM AVAILABILITY WHERE date=? AND isAvailable=true";
  const values = [date];
  return new Promise((resolve, reject) => {
    db.query(query,values,(error, results) => {
      if(error) reject(error);
      var arr = [];
      results.forEach(type => arr.push(type.roomtype));
      resolve(arr);
    });
  });
}


