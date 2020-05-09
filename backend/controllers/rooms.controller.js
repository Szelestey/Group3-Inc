/*
  This is where the http requests for rooms get routed.
  The controller deconstructs the request body and takes the appropriate action
  for the request, then returns the appropriate response.

  Functions that receive http requests must be async.

  The appropriate services are used to query databases or perform other actions.
  'res' is the response object, you can set the status code that you want and then
  use .json to send a json payload with the response.

  Services will typically return a Promise object. If you want an async function to
  wait for the Promise to resolve before continuing, use the 'await' keyword.

  Any function you want publicly available for other files that 'require()' this file,
  the function name must be in the module.exports statement.
 */
const roomsService = require('../services/rooms.service');

module.exports = {
  changeBasePrice,
  getAllRoomTypeData,
  modifyRoom
};

async function changeBasePrice(req, res, next) {
  const {roomId,price} = req.body;
  roomsService.changeBasePrice(roomId, price).then(success => {
    success ? res.json({message: "Price changed"}) : res.status(404).json({message: "Room could not be found"});
  })
  .catch(err => next(err));
}


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


async function modifyRoom(req, res, next) {
  var typeData = req.body;
  typeData.name = capitalizeEachWord(typeData.name);

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


function capitalizeEachWord(string) {
  var words = string.split(" ");
  var newStr = '';
  words.forEach(word => {
    newStr += word.slice(0,1).toUpperCase() + word.slice(1) + " ";
  });
  return newStr.trim();
}
