/*
 * Javascript for the billing/index.html
 */

var triggering = false;

$(document).ready(function() {

  let paymentModal = $('#makePaymentModal');
  let chargeModal = $('#addChargeModal');


  $("#searchValue").keyup(function(event) {
    if(event.key === "Enter") {
      $("#searchButton").click();
    }
  });


  // disable credit card fields if pay later is chosen
  $('#paymentMethod').change(function(event) {
    ($('#paymentMethod').val() === 'CA') ? disableCC() : enableCC();
  });

  // clear modal when closed
  chargeModal.on('hidden.bs.modal', function(event) {
    resetChargeModal();
  });

  // clear modal when closed
  paymentModal.on('hidden.bs.modal', function(event) {
    resetPaymentModal();
  });


  // Show modal event for changePassword
  paymentModal.on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget);
    var invoiceId = button.data('inv');
    var name = button.data('name');
    var amount = button.data('amount');
    var modal = $(this);
    modal.find('#modalTitleId').text(invoiceId);
    modal.find('#modalTitleName').text(name);
    modal.find('#paymentAmount').val(amount);
    modal.find('#hiddenAmountOwed').val(amount);
  });

  chargeModal.on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var invoiceId = button.data('inv');
    var name = button.data('name');
    var modal = $(this);
    modal.find('#modalChargeTitleId').text(invoiceId);
    modal.find('#modalChargeTitleName').text(name);
  });

  configureExpSelect();
  populateTable();

});


// Adds the next 15 years as expiration options
function configureExpSelect() {
  var date = new Date();
  var year = parseInt(date.getFullYear());
  var yearSelect = $('#expYear');
  var monthSelector = $('#expMonth');

  var html = '<option value="">Year...</option>';
  for(var i=0; i<15; i++) {
    var y = year + i;
    html += '<option value="'+y+'">'+y+'</option>';
  }

  // Checks if current year is selected, if so only populates valid months
  yearSelect.change(function() {
    var selectedYear = yearSelect.val();
    var selectedMonth = monthSelector.val();
    (year === parseInt(selectedYear)) ? populateMonthSelect(new Date().getMonth()) : populateMonthSelect(0);
    $('#expMonth > option').each(function() {
      if(selectedMonth === $(this).val()) {
        monthSelector.val(selectedMonth);
      }
    });

  });

  populateMonthSelect(0);
  yearSelect.empty();
  yearSelect.append(html);
}


// populates the month selector with all months starting with the firstMo
function populateMonthSelect(firstMo) {
  var months = ["January","February","March","April","May","June","July","August",
    "September","October","November","December"];

  var monthSelector = $('#expMonth');
  var html = '<option value="">Month...</option>';

  for(var i=firstMo; i < months.length; i++) {
    html += "<option value='"+(i+1)+"'>"+months[i]+"</option>";
  }

  monthSelector.empty();
  monthSelector.append(html);
}


// disable credit card fields
function disableCC() {
  $('.cc-item').each(function() {
    $(this).prop('disabled', true);
  });
}

// enable credit card fields
function enableCC() {
  $('.cc-item').each(function() {
    $(this).prop('disabled', false);
  });
}


// Shows the error modal with the provided message
function showErrorModal(text, returnModalClass) {
  if(returnModalClass) {
    var modalClose = $('#modalCloseButton');
    modalClose.removeClass();
    modalClose.addClass('btn btn-primary ' + returnModalClass);

    var modalX = $('#modalCloseX');
    modalX.removeClass();
    modalX.addClass('close close-styling ' + returnModalClass);
  }

  $('#error-modal-text').text(text);
  $('#error-modal').modal('show');
}


// Attempts to apply a payment to the specified invoice
function addPayment() {
  var payment = getPaymentInfo();
  var err = validatePayment(payment);
  if(err) {
    showErrorModal(err, 'payment-error-close');
    return;
  }

  var url = baseApiUrl + '/billing/payment';

  sendPostWithCreds(url, {payment}).then((data,status,jqXHR) => {
    triggerAlert('#success-alert', getPaymentSuccessHTML(payment));
    $('#makePaymentModal').modal('hide');
    repopulate();
  })
  .fail(data => {
    triggerAlert('#failure-alert', 'Payment could not be processed at this time');
    $('#makePaymentModal').modal('hide');
  });
}



function getPaymentSuccessHTML(payment) {
  return 'Payment of <b>$'+ payment.amount +'</b> applied to '
      + '&emsp;<b>' + $("#modalTitleName").text() + ':&nbsp;' + payment.invoiceId + '</b>';
}



// Attempts to apply a charge to the specified invoice
function addCharge() {
  var charge = getChargeInfo();
  var err = validateCharge(charge);
  if(err) {
    showErrorModal(err, '');
    return;
  }

  var url = baseApiUrl + '/billing/charge';
  var payload = {
    charge
  };

  sendPostWithCreds(url, payload).then((data, status, jqXHR) => {
    triggerAlert('#success-alert', getChargeSuccessHTML(charge));
    $('#addChargeModal').modal('hide');
    repopulate();
  })
  .fail(data => {
    triggerAlert('#failure-alert', 'Charge could not be processed at this time');
    $('#addChargeModal').modal('hide');
  });
}

function getChargeSuccessHTML(charge) {
  return 'Charge of <b>$'+ charge.amount +'</b> applied to '
      + '&emsp;<b>' + $("#modalChargeTitleName").text() + ':&nbsp;' + charge.invoiceId + '</b>';
}



// Retrieves payment info from the page
function getPaymentInfo() {
  var payment = {};

  payment.amount = $('#paymentAmount').val();
  payment.invoiceId = $('#modalTitleId').text();
  payment.method = $('#paymentMethod').val();
  if(payment.method === 'CC') {
    payment.credit = {};
    payment.credit.type = $('#cardType').val();
    payment.credit.number = $('#accountNum').val();
    payment.credit.name = $('#accountHolder').val();
    payment.credit.exp = {};
    payment.credit.exp.month = $('#expMonth').val();
    payment.credit.exp.year = $('#expYear').val();
    payment.credit.cvv = $('#cvvCode').val();
  }

  return payment;
}

// Retrieves charge into from the page
function getChargeInfo() {
  var charge = {};

  charge.invoiceId = $('#modalChargeTitleId').text();
  charge.amount = $('#chargeAmount').val();
  charge.reason = $('#chargeReason').val().trim();

  return charge;
}


// Reset all fields on payment modal
function resetPaymentModal() {
  $('.reset-booking').val('');
  $('#paymentMethod').val('CC');
  $('#cardType').val('visa');
  enableCC();
}

// Reset all fields on charge modal
function resetChargeModal() {
  $('#chargeAmount').val('');
  $('#chargeReason').val('');
}


// Validates input fields on booking popup
function validatePayment(payment) {
  var err = '';
  var missingArr = [];
  var invalidArr = [];

  // Check for empty payment fields
  if(!payment.amount) missingArr.push('Payment amount');
  if(!payment.method) missingArr.push('Payment method');
  if(payment.method === 'CC') {
    if(!payment.credit.type) missingArr.push('Card type');
    if(!payment.credit.number) missingArr.push('Card number');
    if(!payment.credit.name) missingArr.push('Name on card');
    if(!payment.credit.exp.month) missingArr.push('Card expiration month');
    if(!payment.credit.exp.year) missingArr.push('Card expiration year');
    if(!payment.credit.cvv) missingArr.push('CVV Code');
  }

  // Create string if items are missing
  if(missingArr.length > 0) {
    err += "\tMISSING ITEMS:\n";
    missingArr.forEach(item => {
      err += "\t\t- "+item+"\n";
    });
    return err;
  }

  // Validate applicable fields
  var amountOwed = parseFloat($('#hiddenAmountOwed').val());
  if(parseFloat(payment.amount) > amountOwed) invalidArr.push('Payment amount greater than amount owed');
  if(parseFloat(payment.amount) === 0) invalidArr.push('Payment amount must be grater than 0');
  if(!/^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.[0-9][0-9])?$/.test(payment.amount)) invalidArr.push('Amount invalid');
  if(payment.method === 'CC') {
    if (payment.credit.number.length < 15) invalidArr.push('Card number too short');
    if(!/^(\d{4}[- ]){3}\d{4}|\d{16}$/.test(payment.credit.number)) invalidArr.push('Invalid card number');
    if(!/^[0-9]{3,4}$/.test(payment.credit.cvv)) invalidArr.push('CVV invalid');
  }

  // Create string if items are invalid
  if(invalidArr.length > 0) {
    err += "\tINVALID ITEMS:\n";
    invalidArr.forEach(item => {
      err += "\t\t- "+item+"\n";
    });
    return err;
  }

  return err;
}


// Checks that all charge fields exist and are valid
function validateCharge(charge) {
  var err = '';
  var missingArr = [];
  var invalidArr = [];

  if(!charge.amount) missingArr.push('Charge amount');
  if(!charge.reason) missingArr.push('Charge reason');

  // Create string if items are missing
  if(missingArr.length > 0) {
    err += "\tMISSING ITEMS:\n";
    missingArr.forEach(item => {
      err += "\t\t- "+item+"\n";
    });
    return err;
  }

  if(!/^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.[0-9][0-9])?$/.test(charge.amount)) invalidArr.push('Amount invalid');

  // Create string if items are invalid
  if(invalidArr.length > 0) {
    err += "\tINVALID ITEMS:\n";
    invalidArr.forEach(item => {
      err += "\t\t- "+item+"\n";
    });
    return err;
  }

  return err;
}


function populateTable() {
  var url = baseApiUrl + '/billing/current';
  $('#billing-table').find('tbody').empty();
  $('#billingHeader').text('Loading Invoices...');

  sendGetWithCreds(url).then((data, status, jqXHR) => {
    window.localStorage.setItem('invsearchval', '');
    window.localStorage.setItem('invsearchpar', 'current');

    var html = '';
    data.forEach(row => {
      html += buildTableRow(row);
    });
    $('#billing-table').find('tbody').append(html);
    $('#billingHeader').text('Current Invoices');
    $('#showCurrent').prop("disabled", true);

    $('.receipt-bill-button').on('click', function(event) {
      var invoiceId = $(this).val();
      emailBillReceipt(invoiceId);
    });
  })
  .fail((data, status, jqXHR) => {
    $('#billing-wrap').addClass('d-none');
    $('#billingHeader').text('Error loading invoices');
  });
}



function buildTableRow(data) {
  var disable = (data.amountOwed == 0) ? 'disabled' : '';
  var splitInvoiceId = data.invoiceId.slice(0,10) + " " + data.invoiceId.slice(10);
  var phone;
  if(data.phone.length === 10) {
    phone = data.phone.slice(0,3)+"-"+data.phone.slice(3,6)+"-"+data.phone.slice(6);
  } else {
    phone = data.phone;
  }

  return html = '<tr>'
      + '<td>'+splitInvoiceId+'</td>'
      + '<td>'+data.name+'</td>'
      + '<td>'+data.email+'</td>'
      + '<td>'+phone+'</td>'
      + '<td>$&nbsp;'+data.amountPaid.toFixed(2)+'</td>'
      + '<td>$&nbsp;'+data.amountOwed.toFixed(2)+'</td>'
      + '<td>$&nbsp;'+data.totalAmount.toFixed(2)+'</td>'
      + '<td><button class="btn m-0 receipt-bill-button" value="'+data.invoiceId+'"><i class="fas fa-file-invoice table-button"></i></button></td>'
      + '<td><button class="btn m-0" '+ disable +' data-toggle="modal" data-target="#makePaymentModal" data-inv="'+data.invoiceId+'" data-amount="'+data.amountOwed+'" data-name="'+data.name+'"><i class="fas fa-hand-holding-usd table-button"></i></button></td>'
      + '<td><button class="btn m-0" data-toggle="modal" data-target="#addChargeModal" data-inv="'+data.invoiceId+'" data-name="'+data.name+'"><i class="fas fa-file-invoice-dollar table-button"></i></button></td>'
      + '</tr>';
}




// Alert drops in to screen and stops just below nav bar
// Fades after 5 seconds
function triggerAlert(alertId, html) {
  $(alertId).empty();
  $(alertId).append(html);

  if(triggering) {
    return;
  }

  triggering = true;
  $(alertId).addClass('show');
  var x = -20;
  setInterval(function() {
    if(x < 140) {
      $(alertId).css('top', x + 'px');
    }
    x += 5;
  }, 2)
  setTimeout(function() {
    $(alertId).removeClass('show');

    setTimeout(function() {
      $(alertId).css('top', -80);
      triggering = false;
    }, 500);

  }, 4000);

}


function searchForInvoices(param, val) {
  var searchParam;
  var searchValue;

  if(!param) {
    searchParam = $('#searchParam').val();
    searchValue = $('#searchValue').val().trim();
    if(!searchValue) return;
  } else {
    searchParam = param;
    searchValue = val;
  }

  var url = baseApiUrl + '/billing';

  switch (searchParam) {
    case 'first': url += '/fname/'; break;
    case 'last': url += '/lname/'; break;
    case 'email': url += '/email/'; break;
    case 'phone': url += '/phone/'; break;
    case 'id': url += '/id/'; break;
  }

  url += searchValue;

  sendGetWithCreds(url).then((data, status, jqXHR) => {
    window.localStorage.setItem('invsearchval', searchValue);
    window.localStorage.setItem('invsearchpar', searchParam);
    populateWithSearchResults(data);
  })
  .fail((data, status, jqXHR) => {
    showErrorModal(data.responseJSON.error);
  });

}


function populateWithSearchResults(results) {
  var html = '';
  results.forEach(row => {
    html += buildTableRow(row);
  });

  $('#billing-table').find('tbody').empty();
  $('#billing-table').find('tbody').append(html);
  $('#showCurrent').prop("disabled", false);

  $('.receipt-bill-button').on('click', function(event) {
    var invoiceId = $(this).val();
    emailBillReceipt(invoiceId);
  });
}


function repopulate() {
  var searchParam = window.localStorage.getItem('invsearchpar');
  var searchValue = window.localStorage.getItem('invsearchval');

  if(searchValue && searchParam) {
    searchForInvoices(searchParam, searchValue);
  } else {
    populateTable();
  }

}


function emailBillReceipt(invoiceId) {
  var url = baseApiUrl + '/billing/send/' + invoiceId;
  sendGetWithCreds(url).then((data, status, jqXHR) => {
    triggerAlert('#success-alert', "Email Sent!");
  })
  .fail(data => {
    triggerAlert('#failue-alert', "Error sending email");
  });

}

