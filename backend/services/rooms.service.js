const db = require('../db/db');
const async = require('async');

const roomtypeTable = "ROOMTYPE";

module.exports = {
  getTotalAvailableRoomsOfEachType,
  getAllRoomTypeInfo,
  getTotalAvailableRooms
};


// Returns the total number of rooms for each room type
function getTotalAvailableRoomsOfEachType() {
  return new Promise((resolve, reject) => {
    var types;
    var callback = function(roomTypeTotals) {
      if(Object.keys(roomTypeTotals).length === types.length) {
        resolve(roomTypeTotals);
      }
    }
    getRoomTypes().then(roomtypes => {
      types = roomtypes;
      var roomTypeTotals = {};
      for(var i = 0; i < roomtypes.length; i++) {
        const query = "SELECT roomtype,COUNT(roomtype) AS num FROM ROOM WHERE roomtype=?";
        db.query(query, [roomtypes[i]], function(error, results) {
          (error) ? reject(error) : roomTypeTotals[results[0].roomtype] = results[0].num;
          callback(roomTypeTotals);
        });
      }
    })
    .catch(err => reject(err));
  });
}


function getTotalAvailableRooms() {
  const query = "SELECT COUNT(room_id) AS numRooms FROM ROOM WHERE room_in_service=true";
  return new Promise((resolve, reject) => {
    db.query(query, (error, results) => {
      if(error) reject(error);
      resolve(results[0].numRooms);
    });
  });
}


function getAllRoomTypeInfo() {
  const query = "SELECT * FROM ??";
  const values = [roomtypeTable];
  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if(error) reject(error);
      resolve(results);
    });
  })
}


function getRoomTypes() {
  const query = "SELECT ?? FROM ??";
  const values = ['type_id', roomtypeTable];

  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results, fields) => {
      if(error) reject(error);
      var roomTypes = [];
      results.forEach(type => {
        roomTypes.push(type.type_id);
      });
      resolve(roomTypes);
    });
  });
}



