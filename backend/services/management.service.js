const db = require('../db/db');


module.exports = {
  getFinancialDataPerRoom
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
