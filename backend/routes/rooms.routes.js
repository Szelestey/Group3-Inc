/*
 * Rooms API endpoints:  /rooms
 */

const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/rooms.controller');

/**
 * @api {get} /rooms/
 * @apiName Get All Room Type Data
 * @apiPermission User
 * @apiGroup rooms
 *
 * @apiSuccess (200) {Object} [roomtypeData] Array of room types and related information
 */
router.get('/', roomsController.getAllRoomTypeData);

/**
 * @api {post} /rooms/
 * @apiName Modify Room Type
 * @apiPermission User
 * @apiGroup rooms
 *
 * @apiParam {Object} [typeData] New Name, Price, Description
 *
 * @apiSuccess (200) {Object} [message] Success message
 */
router.post('/', roomsController.modifyRoom);


module.exports = router;
