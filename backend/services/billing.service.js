const format = require('date-fns/format');
const db = require('../db/db');


module.exports = {
  getInvoicesInInterval,
  chargeInvoice,
  createCAPayment,
  createCCPayment
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


// Adds a charge to the specified invoice
async function chargeInvoice(invoiceCharge) {
  var num = await getNumForId(invoiceCharge.invoiceId, 'INVOICECHARGE');
  var charge_Id = invoiceCharge.invoiceId + "-ch" + addLeadingZeros(num.toString(),5);

  // Creates an invoice charge
  const query = "INSERT INTO INVOICECHARGE VALUES(?, ?, ?, ?, ?)";
  values = [
      charge_Id,
      invoiceCharge.invoiceId,
      format(new Date(), 'yyyy-MM-dd'),
      invoiceCharge.amount,
      invoiceCharge.reason
  ];

  return new Promise( (resolve, reject) => {
    db.query(query, values,
        function (error, results) {
          if(error) {
            console.log(error);
            reject(error);
          } else {
            if(results.affectedRows > 0) {
              resolve(charge_Id);
            } else {
              resolve();
            }
          }
        });
  });
}


// Adds a cash payment to the specified invoice
async function createCAPayment(payment) {
  var num = await getNumForId(payment.invoiceId, 'PAYMENT');
  var paymentId = payment.invoiceId + "-p" + addLeadingZeros(num.toString(), 5);

  const query = "INSERT INTO PAYMENT(payment_id, invoice_id, payment_date, payment_type, " +
      "payment_amount) VALUES(?, ?, ?, ?, ?)";
  values = [
    paymentId,
    payment.invoiceId,
    format(new Date(), 'yyyy-MM-dd'),
    payment.method,
    payment.amount
  ];

  return new Promise( (resolve, reject) => {
    db.query(query, values,
        function (error, results) {
          if(error) {
            console.log(error);
            reject(error);
          } else {
            if(results.affectedRows > 0) {
              resolve(paymentId);
            } else {
              resolve();
            }
          }
        });
  });
}



// Adds a credit card payment to the specified invoice
async function createCCPayment(payment) {
  var num = await getNumForId(payment.invoiceId, 'PAYMENT');
  var paymentId = payment.invoiceId + "-p" + addLeadingZeros(num.toString(), 5);

  const query = "INSERT INTO PAYMENT VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  values = [
      paymentId,
      payment.invoiceId,
      format(new Date(), 'yyyy-MM-dd'),
      payment.method,
      payment.amount,
      payment.credit.name,
      payment.credit.number,
      payment.credit.exp.month,
      payment.credit.exp.year,
      payment.credit.cvv,
      payment.credit.type
  ];

  return new Promise( (resolve, reject) => {
    db.query(query, values,
        function (error, results) {
          if(error) {
            console.log(error);
            reject(error);
          } else {
            if(results.affectedRows > 0) {
              resolve(paymentId);
            } else {
              resolve();
            }
          }
        });
  });
}


// Gets the number for a new payment/charge Id based on how many payments/charges already exist
function getNumForId(invoiceId, tableName) {
  const query = "SELECT COUNT(??) AS num FROM ?? WHERE invoice_id=?"
  var columnName = '';

  if(tableName === 'PAYMENT') columnName = 'payment_id';
  if(tableName === 'INVOICECHARGE') columnName = 'charge_id';

  const values = [columnName, tableName, invoiceId];

  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if(error) reject(error);
      resolve(results[0].num+1);
    });
  });
}


function addLeadingZeros(string, totalLength) {
  var zeros = '';
  if(string.length < totalLength) {
    for(var i=string.length; i < totalLength; i++) {
      zeros += '0';
    }
  }
  return zeros + string;
}
