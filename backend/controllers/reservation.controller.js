const dateFns = require('date-fns');
const guestService = require('../services/guest.service');
const roomService = require('../services/rooms.service');
const reservationService = require('../services/reservation.service');
const availabilityService = require('../services/availability.service');
const emailer = require('../services/email.service');
const billingService = require('../services/billing.service');


module.exports = {
  createReservation,
  getByName,
  getById,
  getByRoom,
  getAvailableRooms
};


// Creates a new reservation, invoice charge for the cost of the reservation, and
// a new payment if applicable
async function createReservation(req, res, next) {
  var reservation = req.body.reservation;
  var payment = req.body.payment;
  var guest = req.body.guest;
  var comments = req.body.comments;
  var checkinDate = new Date(reservation.checkin+" EST");
  var checkoutDate = new Date(reservation.checkout+" EST");
  reservation.comments = comments;


  // Verify room availability for specified dates
  var verify = await availabilityService.verifyAvailability(reservation.roomtype,
      checkinDate, checkoutDate);

  if(!verify.verification) {
    res.status(400).json({error: "Room type no longer available on specified dates"});
    res.end();
    return;
  }

  // Create guest in database
  var guestID = await guestService.createGuest(guest);
  if(!guestID.guest_id) {
    res.status(400).json({error: "Error creating new guest"});
    res.end();
    return;
  }
  reservation.guest_id = guestID.guest_id;

  // Calculate cost of reservation
  var cost = await reservationService.calculateCostOfReservation(checkinDate,checkoutDate,reservation.roomtype);
  if(cost !== parseFloat(reservation.estCost).toFixed(2)) {
    console.log(cost + " : " + reservation.estCost);
    res.status(400).json({error: "Payment amount does not match calculated price"});
    res.end();
    return;
  }

  // Insert reservation
  var reservationId = await reservationService.insertReservation(reservation);

  // Insert standard room charge
  await billingService.chargeInvoice({
    invoiceId: reservationId,
    amount: cost,
    reason: "Standard Room Charge"
  });

  // Insert payment if applicable
  if(payment.method === 'CC') {
    payment.invoiceId = reservationId;
    payment.amount = cost;
    var paymentId = await billingService.createCCPayment(payment);
    res.status(200).json({reservationId: reservationId, paymentId: paymentId});
  } else {
    res.status(200).json({reservationId: reservationId});
  }


  var roomtypeInfo = await roomService.getRoomTypeInfo(reservation.roomtype);
  var amountPaid = (payment.method === 'CC') ? payment.amount : 0;
  var amountOwed = cost - amountPaid;

  // Compile email info with payment details
  var emailInfo = {
    reservation_id: reservationId,
    firstname: guest.firstname.slice(0,1).toUpperCase() + guest.firstname.slice(1),
    checkin: reservation.checkin,
    checkout: reservation.checkout,
    roomtypeName: roomtypeInfo.type_name,
    total: cost,
    amountPaid: parseFloat(amountPaid).toFixed(2),
    amountOwed: amountOwed.toFixed(2)
  };

  emailer.sendConfirmationEmail(guest.email, emailInfo);
}


// Gets a reservation by searching for the guest's last name
async function getByName(req, res, next) {
  var name = req.params.name;
  reservationService.getReservationByName(name.toLowerCase()).then(results => {
    getReservationCallback(results, res);
  })
  .catch(err => {
    res.status(400).json({error: "Error finding reservation"});
  });
}


// Gets a reservation by ID
async function getById(req, res, next) {
  var id = req.params.id;
  reservationService.getReservationById(id.toUpperCase()).then(results => {
    getReservationCallback(results, res);
  })
  .catch(err => {
    res.status(400).json({error: "Error finding reservation"})
  });
}


// Gets all reservations related to a room number
async function getByRoom(req, res, next) {
  var room = req.params.room;
  reservationService.getReservationByRoom(room).then(results => {
    getReservationCallback(results, res);
  })
  .catch(err => {
    res.status(400).json({error: "Error finding reservation"})
  });
}

// callback for all of the functions that search reservations
function getReservationCallback(results, res) {
  if(results.length > 0) {
    res.status(200).json(results);
  } else {
    res.status(404).json({error: "No reservations found"});
  }
}


// Finds and returns the available room types for the given dates
async function getAvailableRooms(req, res, next) {
  var checkin = req.body.checkin;
  var checkout = req.body.checkout;

  var checkinDate = new Date(checkin + " EST");
  var checkoutDate = new Date(checkout + " EST");

  if(dateFns.isPast(checkinDate) && !dateFns.isSameDay(checkinDate, new Date())){
    res.status(400).json({error: "Invalid check-in date"});
    return;
  }

  if(dateFns.isAfter(checkinDate, checkoutDate) || dateFns.isSameDay(checkinDate, checkoutDate)) {
   res.status(400).json({error: "Check-in date must be after check-out date"});
   return;
  }

  availabilityService.getAvailableRoomsForInterval(checkinDate,checkoutDate).then(results => {
    var commonRooms = compareAvailableRoomsCallback(results);

    if(commonRooms.length > 0) {
      res.status(200).json(commonRooms);
    } else {
      res.status(404).json({error: "No rooms available on the given dates"});
    }
  })
  .catch(err => {
    res.status(400).json({error: err.toString()});
  });
}


// Returns the info for available room types
function compareAvailableRoomsCallback(results) {
  var roomsInfo = results[0];
  var commonRooms = results[1];

  for(var i=2; i < results.length; i++) {
    commonRooms = getCommonItems(commonRooms, results[i]);
  }

  var commonRoomsWithInfo = [];

  commonRooms.forEach(room => {
    roomsInfo.forEach(info => {
      if(info.type_id === room) commonRoomsWithInfo.push(info);
    });
  });

  return commonRoomsWithInfo;
}


// Returns the common items in two string arrays
function getCommonItems(arr1, arr2) {
  var commonItems = [];

  arr1.forEach(item => {
    if(arr2.includes(item)) commonItems.push(item);
  });

  return commonItems;
}
