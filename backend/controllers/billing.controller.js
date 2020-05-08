const dateFns = require('date-fns');
const billingService = require('../services/billing.service');


module.exports = {
  getCurrentInvoices,
  createInvoiceCharge,
  insertPayment
}


// Returns billing table data for reservations within 5 days of the current date (before or after)
async function getCurrentInvoices(req, res, next) {
  billingService.getInvoicesInInterval().then(results => {
    (results) ? res.status(200).json(results) : res.status(404).json({error: "No current invoices found"});
  })
  .catch(error => {
    res.status(400).json({error: "Current invoices could not be retrieved"});
  });
}



// Adds an invoice charge to the specified invoice
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



// Applies a payment towards an invoice
async function insertPayment(req, res, next) {
  var payment = req.body.payment;
  var applyPayment;

  // Assign applicable function for the payment method
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
