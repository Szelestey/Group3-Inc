
///////////////////////// Page Config \\\\\\\\\\\\\\\\\\\\\\\\\\

$(document).ready(function () {
  // make page scrollable again
  $('.close').on('click', function (event) {
    $('body').removeClass('overlay-open');
  });

  $('.booking-error-close').on('click', function (event) {
    window.location.href="#bookRoom";
    $('body').addClass('overlay-open');
  });


  // disable credit card fields if pay later is chosen
  $('#paymentMethod').change(function(event) {
    ($('#paymentMethod').val() === 'CA') ? disableCC() : enableCC();
  });

  // clear modal when closed
  $('#success-modal').on('hidden.bs.modal', function(event) {
    $(this).find('.modal-body').empty();
  });

  configureDatePickers();
  configureExpSelect();
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
      if (selectedMonth === $(this).val()) {
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


// Set up date pickers
function configureDatePickers() {
  var indate = $('#indate');
  var outdate = $('#outdate');

  // on change: hide rooms and prevent choosing a checkout <= checkin
  indate.change(function() {
    hideRooms();
    var dateStr = $(this).val();
    var date;
    date = (dateStr) ? new Date(dateStr) : new Date();
    date.setDate(date.getDate() + 1);
    var dateStr = date.toISOString().slice(0,10);
    outdate.attr('min', dateStr);
    outdate.val(dateStr);
  });

  // hide rooms on change
  outdate.change(function () {
    hideRooms();
  });

  // Set initial min dates
  var currDate = new Date();
  indate.attr('min', getLocalStringForPicker(currDate));
  currDate.setDate(currDate.getDate() + 1);
  outdate.attr('min', currDate.toISOString().slice(0,10));
}

// Returns a date string in the proper format for the date input
function getLocalStringForPicker(date) {
  var dateParts = date.toLocaleString().split(',')[0].split('/');

  var addLeadingZeros = function(string, totalLength) {
    var zeros = '';
    if(string.length < totalLength) {
      for(var i=string.length; i < totalLength; i++) {
        zeros += '0';
      }
    }
    return zeros + string;
  }

  return dateParts[2] + '-' + addLeadingZeros(dateParts[0], 2)  + '-'
      + addLeadingZeros(dateParts[1], 2);
}



/////////////////////////// END PAGE CONFIG \\\\\\\\\\\\\\\\\\\\\\\\\\\\\


// Checks reservation dates
// Returns string if error and empty string otherwise
function checkDates(checkin, checkout) {
  // Check for empty dates
  if(!checkin || !checkout) {
    return "Must select a check-in date and a check-out date";
  }

  // Check that checkin date is before checkout date
  var dateCheckIn = new Date(checkin + " EST");
  var dateCheckOut = new Date(checkout + " EST");

  var compDate = new Date(new Date().toLocaleDateString());
  if(dateCheckIn < compDate && dateCheckIn.toISOString().slice(0,10) !== compDate.toISOString().slice(0,10)) {
    return "Cannot choose check-in date from the past";
  }

  if(dateCheckOut <= dateCheckIn) {
    return "Check-in date must be before check-out date";
  }

  return "";
}


// gets available rooms and displays them
function showRooms() {
  var checkin = $('#indate').val();
  var checkout = $('#outdate').val();

  var err = checkDates(checkin, checkout);
  if(err) {
    showErrorModal(err);
    return;
  }

  getAvailableRooms(checkin, checkout);
  $('#rooms').removeClass("d-none");
}


// Shows the error modal with the provided message
function showErrorModal(text) {
  $('#error-modal-text').text(text);
  $('#error-modal').modal('show');
}

// Hides rooms that are displayed
function hideRooms() {
  $('#rooms').addClass('d-none');
}


// gets available rooms from the backend
function getAvailableRooms(checkin, checkout) {
  var url = baseApiUrl + '/reservation/rooms';
  var payload = {
    checkin,
    checkout
  };

  sendPostWithCreds(url, payload).done((data, status, jqXHR)=>{
    buildRoomRows(data);
  })
  .fail((data, status, jqXHR) => {
    showErrorModal(data.responseJSON.error);
  });
}

// generates and appends the html for each avialable room type
function buildRoomRows(rooms) {
  var roomsContainer = $('#rooms');
  var html = '';

  rooms.forEach(room => {
    html += buildRoomRow(room);
    window.localStorage.setItem(room.type_id, JSON.stringify(room));
  });

  roomsContainer.empty();
  roomsContainer.append(html);
  $('.bookButton').on('click', function(event) {
    configureAndShowBookingPopup($(this).attr('value'));
  });
}


// generates the html to display a single room type
function buildRoomRow(room) {
  rowHtml = "<div class='row my-4' id='"+room.type_id+"'>"
      + "<div class='col-md-4'>"
      + "<img src='"+room.image_path+"' class='img-responsive' style='width:100%;'>"
      + "</div>"
      + "<div class='col-md-4'>"
      + "<h2>"+room.type_name+"</h2>"
      + "<h6><i class='fas fa-smoking-ban' style='font-size:20px;color:#D00000;'></i>NON-SMOKING</h6>"
      + "<h5><i class='fas fa-bed'></i> Bed Count: "+room.type_num_beds+"</h5>"
      + "<h5><i class='fas fa-user-friends'></i> Max Occupancy: "+room.type_max_occupancy+"</h5>"
      + "</div>"
      + "<div class='col-md-4 rates'>"
      + "<h6>(USD-$)</h6>"
      + "<h6>Nightly rate excluding tax</h6>"
      + "<h4>"+room.type_base_price+"</h4>"
      + "<a href='#bookRoom'><button class='king-button bookButton' value='"+room.type_id+"'>BOOK NOW</button></a>"
      + "</div>"
      + "</div>"
      + "<hr>";
  return rowHtml;
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


// populates data in the booking popup
function configureAndShowBookingPopup(roomtypeId) {

  var indateStr = $('#indate').val();
  var outdateStr = $('#outdate').val();
  var err = checkDates(indateStr, outdateStr);
  if(err){
    showErrorModal(err);
    hideRooms();
    return;
  }

  // prevent scroll on body
  $('body').addClass('overlay-open');

  // get room info and set room name
  var roomtype = JSON.parse(window.localStorage.getItem(roomtypeId));
  $('#roomtype').text(roomtype.type_name);

  // Set popup dates
  $('#checkin').text(indateStr);
  $('#checkout').text(outdateStr);

  // Set popup num adults and children
  $('#num-adult').text($('#adult').val());
  $('#num-child').text($('#child').val());

  var indate = new Date(indateStr);
  var outdate = new Date(outdateStr);
  var numdays = (outdate.getTime() - indate.getTime()) / (24*60*60*1000);
  var price = (numdays*roomtype.type_base_price).toFixed(2);
  var totalWithTax = (price * 1.06625).toFixed(2);

  // display pricing info
  $('#num-nights').text(numdays);
  $('#price').text(price);
  $('#total').text(totalWithTax);

  // display appropriate photo
  $('#room-photo').attr('src', roomtype.image_path);

  window.localStorage.setItem('currType', roomtypeId);
  window.localStorage.setItem('currDates', JSON.stringify({in:indateStr, out:outdateStr}));
}


// Function called when user clicks to confirm booking
function bookRoom() {
  var guest = getGuestInfo();
  var payment = getPaymentInfo();
  var comments = $('#comments').val();
  var reservation = getReservation();
  var err = validateBooking(guest, payment);
  if(err) {
    $('#booking-error-modal-text').text(err);
    $('#booking-error-modal').modal('show');
    return false;
  }

  var url = baseApiUrl + '/reservation';
  var payload = {
    reservation: reservation,
    guest: guest,
    payment: payment,
    comments: comments
  };
  sendPostWithCreds(url, payload).done((data, status, jqXHR) => {
    hideRooms();
    $('body').removeClass('overlay-open');
    resetDatePickers();
    resetBookingPopup();
    showBookedModal(data);
  })
  .fail((data, status, jqXHR) => {
    showErrorModal(data.responseJSON.error);
  });
}

// show modal with Booked! title and reservation and payment IDs
function showBookedModal(ids) {
  $('#success-modal-title').text('Booked!');
  var html = "<strong>Reservation Complete</strong><br/>"
      + "<span>Reservation ID: " + ids.reservationId + "</span><br/>";
  if(ids.paymentId) {
    html += "<span>Payment ID: " + ids.paymentId + "</span>";
  }
  $('#success-modal-body').append(html);
  $('#success-modal').modal('show');
}

// Retrieves reservation info from page
function getReservation() {
  var reservation = {};
  reservation.roomtype = window.localStorage.getItem('currType');
  var dates = JSON.parse(window.localStorage.getItem('currDates'));
  reservation.checkin = dates.in;
  reservation.checkout = dates.out;
  reservation.estCost = parseFloat($('#total').text());
  return reservation;
}

// Retrieves guest info from the page
function getGuestInfo() {
  var guest = {};
  guest.firstname = $('#firstname').val();
  guest.lastname = $('#lastname').val();
  guest.email = $('#email').val();
  guest.phone = $('#phone').val();
  guest.address = {};
  guest.address.street = $('#street').val();
  guest.address.city = $('#city').val();
  guest.address.state = $('#state').val();
  guest.address.zip = $('#zip').val();

  return guest;
}

// Retrieves payment info from the page
function getPaymentInfo() {
  var payment = {};
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

// Validates input fields on booking popup
function validateBooking(guest, payment) {
  var err = '';
  var missingArr = [];
  var invalidArr = [];

  // Check for empty guest fields
  if(!guest.firstname) missingArr.push('First name');
  if(!guest.lastname) missingArr.push('Last name');
  if(!guest.email) missingArr.push('Email');
  if(!guest.address.street) missingArr.push('Address - Street');
  if(!guest.address.city) missingArr.push('Address - City');
  if(!guest.address.state) missingArr.push('Address - State');
  if(!guest.address.zip) missingArr.push('Address - Zip');

  // Check for empty payment fields
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
  if(!/^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+(?:[a-zA-Z]{2}|aero|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel)$/.test(guest.email)) invalidArr.push('Email invalid');
  if(!/^\D?(\d{3})\D?\D?(\d{3})\D?(\d{4})$/.test(guest.phone)) invalidArr.push('Phone invalid');
  var state = getState(guest.address.state);
  (state) ? guest.address.state = state : invalidArr.push('State not found');
  if(!/^(?!0{5})(\d{5})(?!-?0{4})(|-\d{4})?$/.test(guest.address.zip)) invalidArr.push('Zip invalid');
  if(payment.method === 'CC') {
    if (payment.credit.number.length < 15) invalidArr.push('Card number too short');
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

// Verifies the state and converts to 2 char abbreviation if necessary
function getState(state) {
  state = state.toUpperCase();

  var states = {"AL": "Alabama", "AK": "Alaska","AS": "American Samoa", "AZ": "Arizona",
    "AR": "Arkansas","CA": "California","CO": "Colorado","CT": "Connecticut",
    "DE": "Delaware","DC": "District Of Columbia","FM": "Federated States Of Micronesia",
    "FL": "Florida","GA": "Georgia","GU": "Guam","HI": "Hawaii","ID": "Idaho","IL": "Illinois",
    "IN": "Indiana","IA": "Iowa","KS": "Kansas","KY": "Kentucky","LA": "Louisiana",
    "ME": "Maine","MH": "Marshall Islands","MD": "Maryland","MA": "Massachusetts",
    "MI": "Michigan","MN": "Minnesota","MS": "Mississippi","MO": "Missouri","MT": "Montana",
    "NE": "Nebraska","NV": "Nevada","NH": "New Hampshire","NJ": "New Jersey",
    "NM": "New Mexico","NY": "New York","NC": "North Carolina","ND": "North Dakota",
    "MP": "Northern Mariana Islands","OH": "Ohio","OK": "Oklahoma","OR": "Oregon",
    "PW": "Palau","PA": "Pennsylvania","PR": "Puerto Rico","RI": "Rhode Island",
    "SC": "South Carolina","SD": "South Dakota","TN": "Tennessee","TX": "Texas",
    "UT": "Utah","VT": "Vermont","VI": "Virgin Islands","VA": "Virginia","WA": "Washington",
    "WV": "West Virginia","WI": "Wisconsin","WY": "Wyoming"
  };

  if(states[state]) {
    return state;
  }

  var stateAbbr = '';

  Object.keys(states).forEach((key) => {

    if(states[key].toUpperCase() === state) {
      stateAbbr = key;
    }
  });

  return stateAbbr;
}


// Reset date pickers
function resetDatePickers() {
  $('#indate').val('');
  $('#outdate').val('');
}

// Reset all fields on booking popup
function resetBookingPopup() {
  $('.reset-booking').val('');
  $('#paymentMethod').val('CC');
  $('#cardType').val('visa');
  enableCC();
}
