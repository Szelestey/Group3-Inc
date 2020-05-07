const db = require('../db/db');


module.exports = {

};


// gets billing table data for invoices with check in or check out with a
// certain number of days of the current date
function getInvoicesInInterval(days) {
  const query = "SELECT i.invoice_id AS invoiceId, CONCAT(g.guest_firstname,' ',g.guest_lastname)"


}
