const db = require('../db/db');


module.exports = {
  getInvoicesInInterval
};


// gets billing table data for invoices with check in or check out with a
// certain number of days of the current date
function getInvoicesInInterval() {
  const query = "SELECT i.invoice_id AS invoiceId, CONCAT(g.guest_firstname,' ',g.guest_lastname) AS name, g.guest_email AS email, g.guest_phone AS phone, i.amount_paid AS amountPaid, i.total_amount AS totalAmount, (i.total_amount - i.amount_paid) AS amountOwed "
      + "FROM RESERVATION AS r "
      + "INNER JOIN INVOICE AS i ON r.reservation_id=i.invoice_id "
      + "INNER JOIN GUEST AS g ON r.guest_id=g.guest_id "
      + "WHERE (r.check_in_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY) AND r.check_in_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY)) OR (r.check_out_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY) AND r.check_out_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY))"

  return new Promise((resolve, reject) => {
    db.query(query, (error, results) => {
      if(error) reject(error);
      var dataArr = [];
      if(results.length > 0) {
        results.forEach(row => {
          dataArr.push({invoiceId: row.invoiceId, name: row.name, email: row.email,
          phone: row.phone, amountPaid: row.amountPaid, totalAmount: row.totalAmount, amountOwed: row.amountOwed});
        });
        resolve(dataArr);
      } else {
        resolve();
      }
    });
  });

}
