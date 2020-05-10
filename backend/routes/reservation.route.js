/*
 * Reservation API endpoints:  /reservation
 */

const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');

/**
 * @api {post} /reservation/
 * @apiName Create Reservation
 * @apiPermission User
 * @apiGroup reservation
 *
 * @apiParam {Object} [reservation] Reservation related data
 * @apiParam {Object} [payment] Payment related data
 * @apiParam {Object} [guest] Guest related data
 * @apiParam {String} [comments] Comments for reservation
 *
 * @apiSuccess (200) {Object} [reservationId[, paymentId]] ReservationID and if applicable, paymentID
 * @apiFailure (400) {String} [error] Error message
 */
router.post('/', reservationController.createReservation);

/**
 * @api {get} /reservation/id/:id
 * @apiName Get Reservation By ID
 * @apiPermission User
 * @apiGroup reservation
 *
 * @apiParam {String} [id] Reservation ID
 *
 * @apiSuccess (200) {Array} [] Array of reservations in JSON format
 * @apiFailure (404) {String} [error] Reservation not found error
 * @apiFailure (400) {String} [error] Generic error message
 */
router.get('/id/:id', reservationController.getById);

/**
 * @api {get} /reservation/name/:name
 * @apiName Get Reservation By Guest Last Name
 * @apiPermission User
 * @apiGroup reservation
 *
 * @apiParam {String} [name] Guest last name
 *
 * @apiSuccess (200) {Array} [] Array of reservations in JSON format
 * @apiFailure (404) {String} [error] Reservation not found error
 * @apiFailure (400) {String} [error] Generic error message
 */
router.get('/name/:name', reservationController.getByName);

/**
 * @api {get} /reservation/room/:room
 * @apiName Get Reservation By Room Number
 * @apiPermission User
 * @apiGroup reservation
 *
 * @apiParam {Integer} [room] Reservation Room Number
 *
 * @apiSuccess (200) {Array} [] Array of reservations in JSON format
 * @apiFailure (404) {String} [error] Reservation not found error
 * @apiFailure (400) {String} [error] Generic error message
 */
router.get('/room/:room', reservationController.getByRoom);

/**
 * @api {post} /reservation/rooms
 * @apiName Room Availability for Interval
 * @apiPermission User
 * @apiGroup reservation
 *
 * @apiParam {String} [checkin] Check In date yyyy-MM-dd
 * @apiParam {String} [checkout] Check out date yyyy-MM-dd
 *
 * @apiSuccess (200) {Object} [rooms] Room types that are available
 * @apiFailure (404) {Object} [error] No Rooms available
 * @apiFailure (400) {Object} [error] Error message
 */
router.post('/rooms', reservationController.getAvailableRooms);


module.exports = router;
