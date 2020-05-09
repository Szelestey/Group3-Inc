const format = require('date-fns/format');
const db = require('../db/db');


module.exports = {
  getInvoicesInInterval,
  chargeInvoice,
  createCAPayment,
  createCCPayment,
  getDataByParam,
  getReceiptInfo,
  getPayments,
  getCharges,
  zeroCharges,
  zeroPayments
};


// gets billing table data for invoices with check in or check out with a
// certain number of days of the current date
function getInvoicesInInterval() {
    const query = "SELECT i.invoice_id AS invoiceId, CONCAT(g.guest_firstname,' ',g.guest_lastname) AS name, g.guest_email AS email, g.guest_phone AS phone, i.amount_paid AS amountPaid, i.total_amount AS totalAmount, (i.total_amount - i.amount_paid) AS amountOwed, r.status AS status "
      + "FROM RESERVATION AS r "
      + "INNER JOIN INVOICE AS i ON r.reservation_id=i.invoice_id "
      + "INNER JOIN GUEST AS g ON r.guest_id=g.guest_id "
      + "WHERE ((r.check_in_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY) AND r.check_in_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY)) OR (r.check_out_date <= DATE_ADD(CURRENT_DATE(), INTERVAL 5 DAY) AND r.check_out_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY))) AND NOT (r.status='cancelled' AND i.total_amount=0.00)"

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

// Expecting {invoiceId, amount, reason}
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



function getDataByParam(tableChar, paramName, paramValue) {

  const query = "SELECT i.invoice_id AS invoiceId, CONCAT(g.guest_firstname,' ',g.guest_lastname) AS name, g.guest_email AS email, g.guest_phone AS phone, i.amount_paid AS amountPaid, i.total_amount AS totalAmount, (i.total_amount - i.amount_paid) AS amountOwed "
      + "FROM RESERVATION AS r "
      + "INNER JOIN INVOICE AS i ON r.reservation_id=i.invoice_id "
      + "INNER JOIN GUEST AS g ON r.guest_id=g.guest_id "
      + "WHERE (LOWER(??.??) = ?) AND NOT (r.status='cancelled' AND i.total_amount=0.00)";

  const values = [tableChar, paramName, paramValue];

  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if(error) reject(error);

      var dataArr = [];
      if(results.length > 0) {
        results.forEach(row => {
          dataArr.push(row);
        });
        resolve(dataArr);
      } else {
        resolve();
      }
    });
  });
}



function getReceiptInfo(invoiceId) {
  const query = "SELECT i.invoice_id AS invoiceId, r.check_in_date AS checkin, r.check_out_date AS checkout"
      + ", i.total_amount AS totalAmount, i.amount_paid AS amountPaid, g.guest_email AS email, g.guest_firstname AS firstname, g.guest_lastname AS lastname "
      + "FROM INVOICE AS i "
      + "INNER JOIN RESERVATION AS r ON i.invoice_id=r.reservation_id "
      + "INNER JOIN GUEST AS g ON r.guest_id=g.guest_id "
      + "WHERE i.invoice_id=?";

  return new Promise((resolve, reject) => {
    db.query(query, [invoiceId], (error, results) => {
      if(error) reject(error);

      if(results.length > 0) {
        var info = {
          invoiceId: invoiceId,
          checkin: results[0].checkin,
          checkout: results[0].checkout,
          totalAmount: results[0].totalAmount,
          amountPaid: results[0].amountPaid,
          email: results[0].email,
          firstname: results[0].firstname,
          lastname: results[0].lastname
        };
        resolve(info);
      } else {
        resolve();
      }

    })
  })
}


function getPayments(invoiceId) {
  const query = "SELECT * FROM PAYMENT WHERE invoice_id=?";
  return new Promise((resolve, reject) => {
    db.query(query, [invoiceId], (error, results) => {
      if(error) reject(error);
      if(results.length > 0) {
        var arr = [];
        results.forEach(row => {
          arr.push({
            paymentId: row.payment_id,
            amount: row.payment_amount,
            method: row.payment_type,
            creditnumber: row.account_number
          });
        });
        resolve(arr);
      } else {
        resolve();
      }
    });
  });
}


function getCharges(invoiceId) {
  const query = "SELECT * FROM INVOICECHARGE WHERE invoice_id=?";
  return new Promise((resolve, reject) => {
    db.query(query, [invoiceId], (error, results) => {
      if(error) reject(error);
      if(results.length > 0) {
        var arr = [];
        results.forEach(row => {
          arr.push({
            chargeId: row.charge_id,
            amount: row.charge_amount,
            reason: row.charge_reason
          });
        });
        resolve(arr);
      } else {
        resolve();
      }
    });
  });
}

// Changes all charges to 0
function zeroCharges(invoiceId) {
  const query = "UPDATE INVOICECHARGE SET charge_amount=0 WHERE invoice_id=?";
  return new Promise((resolve, reject) => {
    db.query(query, [invoiceId], (error, results) => {
      if(error) reject(error);
      if(results.affectedRows > 0) {
        resolve(results.affectedRows);
      } else {
        resolve();
      }
    });
  });
}


// changes all payments to 0
function zeroPayments(invoiceId) {
  const query = "UPDATE PAYMENT SET payment_amount=0 WHERE invoice_id=?";
  return new Promise((resolve, reject) => {
    db.query(query, [invoiceId], (error, results) => {
      if(error) reject(error);
      if(results.affectedRows > 0) {
        resolve(results.affectedRows);
      } else {
        resolve();
      }
    });
  });
}



