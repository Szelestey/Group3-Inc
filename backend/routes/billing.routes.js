const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');


router.get('/current', billingController.getCurrentInvoices);


router.post('/charge', billingController.createInvoiceCharge);


router.post('/payment', billingController.insertPayment);


router.get('/fname/:firstname', billingController.getDataByFirstName);


router.get('/lname/:lastname', billingController.getDataByLastName);


router.get('/email/:email', billingController.getDataByEmail);


router.get('/phone/:phone', billingController.getDataByPhone);


router.get('/id/:id', billingController.getDataById);


module.exports = router;
