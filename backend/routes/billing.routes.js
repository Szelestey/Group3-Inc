const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');

router.get('/current', billingController.getCurrentInvoices);


router.post('/charge', billingController.createInvoiceCharge);


router.post('/payment', billingController.insertPayment);

module.exports = router;
