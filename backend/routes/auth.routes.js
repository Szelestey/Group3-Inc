/*
 * Authentication API endpoints:  /auth
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @api {post} /auth
 * @apiName Log in
 * @apiPermission none
 * @apiGroup auth
 *
 * @apiParam {String} [username] username
 * @apiParam {String} [password] password
 *
 * @apiSuccess (200) {Object} [username, ad-auth] username, admin privs
 */
router.post('/', authController.authenticate);

/**
 * @api {post} /auth/logout
 * @apiName Log out
 * @apiPermission none
 * @apiGroup auth
 *
 * @apiSuccess (200)
 */
router.post('/logout', authController.logout);

module.exports = router;
