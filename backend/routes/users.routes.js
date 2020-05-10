/*
 * Users API endpoints:  /users
 */

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');


/**
 * @api {get} /users
 * @apiName Get all users
 * @apiPermission Admin
 * @apiGroup users
 *
 * @apiSuccess (200) {Object} [userArr] JSON array of users
 */
router.get('/', usersController.getAllUsers);

/**
 * @api {post} /users/delete
 * @apiName Delete user
 * @apiPermission Admin
 * @apiGroup users
 *
 * @apiParam {String} [username] username to be deleted
 *
 * @apiSuccess (200) {String} [message]
 */
router.post('/delete', usersController.removeUser);

/**
 * @api {post} /users/update
 * @apiName Update user password
 * @apiPermission Admin
 * @apiGroup users
 *
 * @apiParam {String} [username] username
 * @apiParam {String} [unhashedPassword] new unhashed password
 *
 * @apiSuccess (200) {String} [message]
 */
router.post('/update', usersController.updatePassword);

/**
 * @api {post} /users/create
 * @apiName Create user
 * @apiPermission Admin
 * @apiGroup users
 *
 * @apiParam {String} [firstname] First name
 * @apiParam {String} [lastname] Last name
 * @apiParam {String} [username] username to be deleted
 * @apiParam {String} [unhashedPassword] unhashed password
 * @apiParam {String} [role] Privilege role
 *
 * @apiSuccess (200) {String} [message]
 */
router.post('/create', usersController.createUser);

/**
 * @api {get} /users/status
 * @apiName Users status
 * @apiPermission Admin
 * @apiGroup users
 *
 * @apiSuccess (200) {Object} [statusJSON]
 */
router.get('/status', usersController.getStatus);

module.exports = router;
