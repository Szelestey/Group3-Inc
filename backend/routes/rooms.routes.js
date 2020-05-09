/*
  Routes for rooms.

  To create a new route, use the router object and typically the .post function,
  though not always.

  router.post('remaining/url', handlerMethod)
   - the remaining url in this file would be whatever is after 'localhost:3000/rooms'

 */
const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/rooms.controller');


/**
 * @api {post} /rooms/price
 * @apiName Change room price
 * @apiPermission User
 * @apiGroup rooms
 *
 * @apiParam {String} [roomId] Room ID
 * @apiParam {String} [price] New price
 *
 * @apiSuccess (200) {String} [message]
 */
router.post('/price', roomsController.changeBasePrice);


router.get('/', roomsController.getAllRoomTypeData);


router.post('/', roomsController.modifyRoom);


module.exports = router;
