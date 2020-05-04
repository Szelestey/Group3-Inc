const express = require('express');
const router = express.Router();
const mgmtController = require('../controllers/management.controller');

router.get('/occupancy', mgmtController.getOccupancyData);

module.exports = router;
