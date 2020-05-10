/*
 * Handlers for Billing related API endpoints:  /billing/
 */

const dateFns = require('date-fns');
const billingService = require('../services/billing.service');
const emailService = require('../services/email.service');


module.exports = {
  getCurrentInvoices,
  createInvoiceCharge,
  insertPayment,
  getDataByFirstName,
  getDataByLastName,
  getDataByEmail,
  getDataByPhone,
  getDataById,
  emailInvoice
}


/*
 * Returns billing table data for reservations.
 */
async function getCurrentInvoices(req, res, next) {
  billingService.getInvoicesInInterval().then(results => {
    (results) ? res.status(200).json(results) : res.status(404).json({error: "No current invoices found"});
  })
  .catch(error => {
    res.status(400).json({error: "Current invoices could not be retrieved"});
  });
}



/*
 * Adds an invoice charge to the specified invoice.
 */
async function createInvoiceCharge(req, res, next) {
  const invoiceCharge = {amount, reason, invoiceId} = req.body.charge;

  billingService.chargeInvoice(invoiceCharge).then(chargeId => {
    chargeId ? res.status(200).json({chargeId: chargeId}) :
        res.status(400).json({message: "Invoice could not be found"});
  })
  .catch(err => {
    console.log(err.stack);
    res.status(400).json({message: "Error applying invoice charge"});
  });
}



/*
 * Applies a payment towards an invoice.
 */
async function insertPayment(req, res, next) {
  var payment = req.body.payment;
  var applyPayment;

  // Assign applicable function depending on the payment method
  if(payment.method === 'CC') {
    applyPayment = billingService.createCCPayment;
  } else if(payment.method === 'CA') {
    applyPayment = billingService.createCAPayment;
  } else {
    res.status(400).json({error: "Invalid payment method"});
    res.end();
    return;
  }

  applyPayment(payment).then(paymentId => {
    paymentId ? res.status(200).json({ paymentId: paymentId }) :
        res.status(400).json({message: "Invoice could not be found"});
  })
  .catch(err => {
      console.log(err.stack);
      res.status(400).json({message: "Error applying payment to invoice"});
  });
}


/*
 * Finds all invoice data for guests with the specified first name.
 */
function getDataByFirstName(req, res, next) {
  const firstname = req.params.firstname.toLowerCase();
  getDataByParam(res, 'g', 'guest_firstname', firstname);
}

/*
 * Finds all invoice data for guests with the specified last name.
 */
function getDataByLastName(req, res, next) {
  const lastname = req.params.lastname.toLowerCase();
  getDataByParam(res, 'g', 'guest_lastname', lastname);
}

/*
 * Finds all invoice data for guests with the specified email.
 */
function getDataByEmail(req, res, next) {
  const email = req.params.email.toLowerCase();
  getDataByParam(res, 'g',  'guest_email', email);
}

/*
 * Finds all invoice data for guests with the specified phone number.
 */
function getDataByPhone(req, res, next) {
  var phone = req.params.phone;
  // Strip input of everything but digits
  phone = phone.replace(/\D/g, '');
  getDataByParam(res, 'g', 'guest_phone', phone);
}

/*
 * Finds invoice data for the invoice with the specified ID.
 */
function getDataById(req, res, next) {
  var id = req.params.id.replace(' ','').toLowerCase();
  getDataByParam(res, 'i', 'invoice_id', id);
}

/*
 * Designed for use by the above invoice data search functions.
 * Obtains invoice data that meet the specified criteria. SQL statement will look
 * like:  SELECT <data> FROM <tables> WHERE tableChar.paramName = paramValue
 */
async function getDataByParam(res, tableChar, paramName, paramValue) {
  billingService.getDataByParam(tableChar, paramName, paramValue).then(results => {
    (results) ? res.status(200).json(results) : res.status(404).json({error: "No invoices found"});
  })
  .catch(err => {
    res.status(400).json({error: "Error searching for invoice"});
  });
}

/*
 * Retrieves data for an invoice email and requests the email to be sent.
 * Exact email formatting will depend on the date in relation to check-in/check-out dates
 * and the amount owed on the account
 */
async function emailInvoice(req, res, next) {
  var invoiceId = req.params.id;

  var promises = [];

  // Get general invoice info
  promises.push(billingService.getReceiptInfo(invoiceId));

  // Get all payments for the invoice
  promises.push(billingService.getPayments(invoiceId));

  // Get all charges on the invoice
  promises.push(billingService.getCharges(invoiceId));

  Promise.all(promises).then(function(results) {
    var emailInfo = results[0];
    emailInfo.payments = results[1];
    emailInfo.charges = results[2];
    emailInfo.balanceDue = emailInfo.totalAmount - emailInfo.amountPaid;

    // Send invoice email
    emailService.sendReceiptEmail(emailInfo.email, emailInfo).then(() => {
      res.status(200).json({message: "Email sent successfully"});
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({error: "Email failed to send"});
    });

  })
  .catch(err => {
    res.status(400).json({error: "Error sending email"});
  });


}


