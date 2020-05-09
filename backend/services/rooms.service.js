const db = require('../db/db');
const async = require('async');

const roomtypeTable = "ROOMTYPE";

module.exports = {
  getTotalAvailableRoomsOfEachType,
  getAllRoomTypeInfo,
  getTotalAvailableRooms,
  getRoomTypeInfo,
  modifyRoom
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
        const query = "SELECT roomtype,COUNT(roomtype) AS num FROM ROOM WHERE roomtype=? AND room_in_service=true";
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
  });
}


function getRoomTypeInfo(roomtype) {
  const query = "SELECT * FROM ROOMTYPE WHERE type_id=?";
  return new Promise((resolve, reject) => {
    db.query(query, [roomtype], (error, results) => {
      if(error) reject(error);
      if(results.length > 0)
        resolve(results[0]);
      else
        resolve();
    });
  });
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



function modifyRoom(roomData) {
  const query = "UPDATE ROOMTYPE SET type_name=?, type_base_price=?, type_description=? WHERE type_id=?";
  const values = [roomData.name, roomData.price, roomData.description, roomData.type];

  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if(error) reject(error);
      if(results.affectedRows > 0) {
        resolve("success");
      } else {
        resolve();
      }
    });
  });
}



