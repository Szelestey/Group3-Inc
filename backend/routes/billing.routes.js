/*
 * Billing API endpoints:  /billing
 */

const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');

/**
 * @api {get} /billing/current
 * @apiName Current Invoices
 * @apiPermission none
 * @apiGroup Billing
 *
 * @apiSuccess (200) {Array} [results] Array of invoice data
 */
router.get('/current', billingController.getCurrentInvoices);

/**
 * @api {post} /billing/charge
 * @apiName Apply Charge
 * @apiPermission none
 * @apiGroup Billing
 *
 * @apiParam {Float} [amount] Charge amount
 * @apiParam {String} [reason] Charge reason
 * @apiParam {String} [invoiceId] Invoice ID
 *
 * @apiSuccess (200) {Object} [chargeId] ID for the new charge
 */
router.post('/charge', billingController.createInvoiceCharge);

/**
 * @api {post} /billing/payment
 * @apiName Apply Payment
 * @apiPermission none
 * @apiGroup Billing
 *
 * @apiParam {Object} [payment] Payment object with all necessary payment information
 *
 * @apiSuccess (200) {Object} [paymentId] ID for the new payment
 */
router.post('/payment', billingController.insertPayment);

/**
 * @api {get} /billing/fname/:firstname
 * @apiName Invoice Search by First Name
 * @apiPermission none
 * @apiGroup Billing
 *
 * @apiSuccess (200) {Array} Array of invoice data
 */
router.get('/fname/:firstname', billingController.getDataByFirstName);

/**
 * @api {get} /billing/lname/:lastname
 * @apiName Invoice Search by Last Name
 * @apiPermission none
 * @apiGroup Billing
 *
 * @apiSuccess (200) {Array} Array of invoice data
 */
router.get('/lname/:lastname', billingController.getDataByLastName);

/**
 * @api {get} /billing/email/:email
 * @apiName Invoice Search by Email
 * @apiPermission none
 * @apiGroup Billing
 *
 * @apiSuccess (200) {Array} Array of invoice data
 */
router.get('/email/:email', billingController.getDataByEmail);

/**
 * @api {get} /billing/phone/:phone
 * @apiName Invoice Search by Phone
 * @apiPermission none
 * @apiGroup Billing
 *
 * @apiSuccess (200) {Array} Array of invoice data
 */
router.get('/phone/:phone', billingController.getDataByPhone);

/**
 * @api {get} /billing/id/:id
 * @apiName Invoice Search by Invoice ID
 * @apiPermission none
 * @apiGroup Billing
 *
 * @apiSuccess (200) {Array} Array of invoice data
 */
router.get('/id/:id', billingController.getDataById);

/**
 * @api {get} /billing/send/:id
 * @apiName Email Invoice
 * @apiPermission none
 * @apiGroup Billing
 *
 * @apiSuccess (200) {Object} [message] Success Message
 */
router.get('/send/:id', billingController.emailInvoice);


module.exports = router;
