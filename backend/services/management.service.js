const db = require('../db/db');
const reservationService = require('./reservation.service');
const billingService = require('./billing.service');
const datefns = require('date-fns');


module.exports = {
  getFinancialDataPerRoom,
  cancelReservation
};


function getFinancialDataPerRoom(currYear, prevYear) {
  const query = "SELECT r.roomtype_id AS roomtype, rt.type_name AS roomname, p.payment_amount AS amount, p.payment_date AS date "
      + "FROM RESERVATION AS r "
      + "INNER JOIN INVOICE AS i ON r.reservation_id=i.invoice_id "
      + "INNER JOIN PAYMENT AS p ON p.invoice_id=i.invoice_id "
      + "INNER JOIN ROOMTYPE AS rt ON r.roomtype_id=rt.type_id "
      + "WHERE Year(p.payment_date)=? OR Year(p.payment_date)=?"
  const values = [currYear, prevYear];

  return new Promise((resolve, reject) => {
    db.query(query, values, (error, results) => {
      if(error) reject(error);

      var dataRows = [];

      results.forEach(row => dataRows.push(row));
      resolve(dataRows);
    });
  });
}


async function cancelReservation(reservationId) {
  const query = "UPDATE RESERVATION SET status='cancelled' WHERE reservation_id=?";

  var cancellationStatus = await assessCancellationFees(reservationId);

  return new Promise((resolve, reject) => {
    db.query(query, [reservationId], (error, results) => {
      if(error) reject(error);
      if(results.affectedRows > 0) {
        // resolve based on whether a cancellation fee was applied and if there was an error
        (cancellationStatus < 0) ? reject(cancellationStatus) : resolve(cancellationStatus);
      } else {
        reject("Reservation could not be found");
      }
    });
  });
}


// Clears payments and charges for the account and assesses cancellation fee
async function assessCancellationFees(reservationId) {
  var reservation = await reservationService.getReservationById(reservationId);
  reservation = reservation[0];

  // Zero payments and charges
  var result1 = await billingService.zeroPayments(reservationId);
  var result2 = await billingService.zeroCharges(reservationId);

  return new Promise((resolve, reject) => {
    if (datefns.differenceInDays(new Date(reservation.CheckIn), new Date()) < 1) {
      // Cancellation within 24 hours, charge fee
      billingService.chargeInvoice({
        invoiceId: reservationId,
        amount: 29.99,
        reason: "Cancellation Fee"
      }).then(() => {
        resolve(1);   // Fee applied
      }).catch(err => {
        reject(err);   // Error
      });
    } else {
      resolve(0);   // No fee
    }
  });

}
