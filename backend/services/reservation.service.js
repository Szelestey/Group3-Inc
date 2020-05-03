const differenceInCalendarDays = require('date-fns/differenceInCalendarDays');
const db = require('../db/db');
const roomService = require('./rooms.service');
const availabilityService = require('./availability.service');



const reservationTable = "RESERVATION";
const taxrate = 1.06625;


module.exports = {
  getReservationByName,
  getReservationById,
  getReservationByRoom,
  calculateCostOfReservation,
  insertReservation
}

const reservationSelectQuery = "SELECT r.reservation_id AS 'ReservationID', r.room_id AS 'RoomNumber'"
    + ", r.roomtype_id AS 'RoomType', DATE_FORMAT(r.check_in_date, '%Y-%m-%e') AS 'CheckIn'"
    + ", DATE_FORMAT(r.check_out_date, '%Y-%m-%e') AS 'CheckOut'"
    + ", CONCAT(g.guest_lastname, ', ', g.guest_firstname) AS 'FullName'"
    + ", g.guest_email AS 'Email', g.guest_phone AS 'Phone', g.guest_street AS 'Street'"
    + ", g.guest_city AS 'City', g.guest_state AS 'State', g.guest_zip AS 'Zip' "
    + "FROM RESERVATION AS r "
    + "INNER JOIN GUEST AS g "
    + "ON r.guest_id=g.guest_id "
    + "WHERE ??.?? = ?";


function getReservationByName(name) {
  const values = ['g', 'guest_lastname', name];

  return new Promise((resolve, reject) => {
    db.query(reservationSelectQuery, values, (error, results) => {
      if(error) {
        reject(error);
      } else {
        resolve(results);
      }
    })
  });
}


function getReservationById(id) {
  const values = ['r', 'reservation_id', id];

  return new Promise((resolve, reject) => {
    db.query(reservationSelectQuery, values, (error, results) => {
      if(error) {
        reject(error);
      } else {
        resolve(results);
      }
    })
  });
}


function getReservationByRoom(room) {
  const values = ['r', 'room_id', room];

  return new Promise((resolve, reject) => {
    db.query(reservationSelectQuery, values, (error, results) => {
      if(error) {
        reject(error);
      } else {
        resolve(results);
      }
    })
  });
}


function calculateCostOfReservation(checkin, checkout, roomtype) {
  var numDays = differenceInCalendarDays(checkout, checkin);

  const query = "SELECT type_base_price FROM ROOMTYPE WHERE type_id=?";
  const values = [roomtype];
  return new Promise((resolve, reject) => {
    db.query(query, values, (error,results) => {
      if(error) reject(error);
      resolve((results[0].type_base_price*taxrate*numDays).toFixed(2));
    });
  });
}


function insertReservation(reservation) {
  // Generate reservation ID
  var reservationId = reservation.checkin.replace(/-/g,'') + reservation.roomtype + new Date().getTime();

  const query = "INSERT INTO RESERVATION VALUES(?, ?, ?, ?, ?, ?, ?, ?)"
  const values = [
      reservationId,
      reservation.guest_id,
      null,
      reservation.roomtype,
      reservation.checkin,
      reservation.checkout,
      reservation.comments,
      'active'
  ];

  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if(error) reject(error);
      if(results.affectedRows > 0) {
        resolve(reservationId);
      } else {
        reject();
      }
    });
  });
}












