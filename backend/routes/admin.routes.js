/*
 * Admin API endpoints:  /admin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

/**
 * @api {get} /admin/db
 * @apiName DB status
 * @apiPermission admin
 * @apiGroup admin
 *
 * @apiSuccess (200) {Object} [state] Connection state of the database
 */
router.get('/db', adminController.getDbStatus);

module.exports = router;
