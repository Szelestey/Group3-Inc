const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');

router.get('/current', billingController.getCurrentInvoices);

module.exports = router;
