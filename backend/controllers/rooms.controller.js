/*
 * Handlers for Room/RoomType related API endpoints:  /rooms/
 * Also contains related functions.
 */

const roomsService = require('../services/rooms.service');

module.exports = {
  getAllRoomTypeData,
  modifyRoom
};


/*
 * Retrieves data for each room type.
 */
async function getAllRoomTypeData(req, res, next) {
  var promises = [];
  promises.push(roomsService.getAllRoomTypeInfo());
  promises.push(roomsService.getTotalAvailableRoomsOfEachType());

  Promise.all(promises).then(results => {
    var roomtypeData = results[0];
    var roomtypeTotals = results[1];

    roomtypeData.forEach(type => {
      type.numInService = roomtypeTotals[type.type_id];
    });

    res.status(200).json(roomtypeData);
  })
  .catch(err => {
    console.log(err);
    res.status(400).json({error: "Error retrieving room type data"});
  });

}

/*
 * Updates a room type with the new name, price, and description.
 */
async function modifyRoom(req, res, next) {
  var typeData = req.body;
  typeData.name = titleCase(typeData.name);

  // Check that price is valid
  if(isNaN(typeData.price)) {
    res.status(400).json({error: "Price must be a number"});
    return;
  }

  roomsService.modifyRoom(typeData).then(result => {
    (result) ? res.status(200).json({message: "Room updated"}) : res.status(400).json({error: "Room type could not be found"});
  })
  .catch(err => {
    console.log(err);
    res.status(400).json({error: "Error modifying room"});
  });

}

/*
 * Capitalizes each word of a string.
 */
function titleCase(string) {
  var words = string.split(" ");
  var newStr = '';
  words.forEach(word => {
    newStr += word.slice(0,1).toUpperCase() + word.slice(1) + " ";
  });
  return newStr.trim();
}
