/*
 * Management API endpoints:  /management
 */

const express = require('express');
const router = express.Router();
const mgmtController = require('../controllers/management.controller');

/**
 * @api {get} /management/occupancy
 * @apiName Occupancy Data for Current Year
 * @apiPermission none
 * @apiGroup Management
 *
 * @apiSuccess (200) {Array} [occupancyArr] Array of data to be used by Google Line chart
 */
router.get('/occupancy', mgmtController.getOccupancyData);

/**
 * @api {get} /management/cancel
 * @apiName Cancel Reservation
 * @apiPermission none
 * @apiGroup Management
 *
 * @apiParam {String} [reservationId] ID of reservation to be cancelled
 *
 * @apiSuccess (200) {Object} [remark] Remark that indicates if cancellation fee was applied
 */
router.post('/cancel', mgmtController.cancelReservation);

/**
 * @api {get} /management/report
 * @apiName Financial Data for Current and Previous Years to Date
 * @apiPermission none
 * @apiGroup Management
 *
 * @apiSuccess (200) {Object} [finData] Data to populate financial report table
 */
router.get('/report', mgmtController.getFinancialReportData);


module.exports = router;
