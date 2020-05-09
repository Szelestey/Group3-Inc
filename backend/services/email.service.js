
// TODO: TEST ON AWS

var nodemailer = require('nodemailer');
var EmailTemplate = require('email-templates');
const format = require('date-fns/format');

module.exports = {
  sendConfirmationEmail,
  sendReceiptEmail
}

// Create transporter authenticated with our group gmail account
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // Authentication email
    user: 'myhmsmailer@gmail.com',
    // Authentication password
    pass: 'askelhnbzm'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Create and configure email
var email = new EmailTemplate({
  // send: true,
  message: {
    from: 'myhmsmailer@gmail.com'
  },
  transport: transporter
});

// Verify email server is working
transporter.verify(function(error, success) {
  if(error) {
    console.log(error);
  } else {
    console.log("Email server ready");
  }
});


// Sends an email using the confirmation template
function sendConfirmationEmail(receiverEmail, confirmInfo){

  email.send({
      template: 'confirmation',
      message: {
        to: receiverEmail
      },
      locals: {
        firstname: 'Logan',
        reservationId: confirmInfo.reservation_id,
        checkin: format(new Date(confirmInfo.checkin+" EST"), 'MMMM d, yyyy'),
        checkout: format(new Date(confirmInfo.checkout+" EST"), 'MMMM d, yyyy'),
        roomtypeName: confirmInfo.roomtypeName,
        total: confirmInfo.total,
        amountPaid: confirmInfo.amountPaid,
        amountOwed: confirmInfo.amountOwed
      }
  })
  .catch(console.error);

}

// Sends an email using the receipt template
function sendReceiptEmail(receiverEmail, receiptInfo) {
  var subject = (receiptInfo.balanceDue) ? "You Have a Balance Due" : "Thank You for Staying with us!";

  var endMessage = (receiptInfo.balanceDue) ? "Balance due must be paid within 10 days." :
      "We look forward to seeing you again!";

  return email.send({
    template: 'receipt',
    message: {
      to: receiverEmail
    },
    locals: {
      firstname: receiptInfo.firstname,
      lastname: receiptInfo.lastname,
      invoiceId: receiptInfo.invoiceId,
      checkin: format(new Date(receiptInfo.checkin+" EST"), 'MMMM d, yyyy'),
      checkout: format(new Date(receiptInfo.checkout+" EST"), 'MMMM d, yyyy'),
      charges: receiptInfo.charges,
      payments: receiptInfo.payments,
      totalPaid: receiptInfo.amountPaid,
      balanceDue: receiptInfo.balanceDue,
      subject: subject,
      endMessage: endMessage
    }
  });
}




