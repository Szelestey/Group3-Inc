const dateFns = require('date-fns');
const billingService = require('../services/billing.service');


module.exports = {
  getCurrentInvoices
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
