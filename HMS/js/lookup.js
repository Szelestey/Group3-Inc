/*
 * Javascript for the management/lookup.html page
 */

function searchByGuest(){
    // Get the value of the of the last name text box
    var searchedName = document.getElementById("lname").value;

    if(searchedName === "") {
        $('#lname-error').removeClass('d-none');
        return false;
    }
    $('#lname-error').addClass('d-none');

    $('#nameModalCenter').modal('show');

    // Concatinating the string
    var searchURL = baseApiUrl + "/reservation/name/" + searchedName;

    // Performing http request
    var response = sendGetWithCreds(searchURL);

    // Store the modal DOM content as a variable
    var nameModal = document.getElementById("name-modal-body");

    // Inject text to notify user that its still loading
    nameModal.innerHTML = "<h2>Loading Search Results...</h2>";

    // Wait x amount of milliseconds for a response from the API
    setTimeout(function(){

        // If their was a response enter if statement, else api timed out
        if(response.responseJSON){

            // If the response was there were no rooms=
            if (response.responseJSON.error) {

                // Inject header notifying that no data was found
                nameModal.innerHTML = "<h2>No guest matching that last name was found</h2>"
            // Else populate a table of rooms reservations
            } else {
                // Insert a blank table into modal
                nameModal.innerHTML = "<table class='table table-striped table-sm'>"
                    + "<thead id='thisNameTableHeader'>"
                    + "<tr>"
                    + "<th scope='col'>Check In</th>"
                    + "<th scope='col'>Check Out</th>"
                    + "<th scope='col'>City</th>"
                    + "<th scope='col'>Email</th>"
                    + "<th scope='col'>Full Name</th>"
                    + "<th scope='col'>Phone</th>"
                    + "<th scope='col'>Reservation ID</th>"
                    + "<th scope='col'>Room</th>"
                    + "<th scope='col'>Room Type</th>"
                    + "<th scope='col'>State</th>"
                    + "<th scope='col'>Street</th>"
                    + "<th scope='col'>Zip</th>"
                    + "<th scope='col'>Status</th>"
                    + "<th scope='col'>Cancel Reservation</th>"
                    + "</tr>"
                    + "</thead>"
                    + "<tbody id='thisNameTableBody'></tbody>"
                    + "</table>";

                // Store the response as an array
                var nameJSONArray = response.responseJSON;

                // Loop through array of reservations for this last name
                for(var i=0;i < nameJSONArray.length; i++){

                    // Store this item of the array as a variable
                    var thisReservation = nameJSONArray[i];

                    // Store each column data as a variable
                    var checkIn = thisReservation.CheckIn;
                    var checkOut = thisReservation.CheckOut;
                    var city = thisReservation.City;
                    var email = thisReservation.Email;
                    var fullName = thisReservation.FullName;
                    var phone = thisReservation.Phone;
                    var reservationId = thisReservation.ReservationID;
                    var roomNumber = thisReservation.RoomNumber;
                    var roomType = thisReservation.RoomType;
                    var state = thisReservation.State;
                    var street = thisReservation.Street;
                    var zip = thisReservation.Zip;
                    var status = thisReservation.Status;
                    status = status.charAt(0).toUpperCase() + status.slice(1);

                    if(roomNumber === null) {
                        roomNumber = 'Not Assigned';
                    }

                    // Store the table body as a variable
                    var tableBody = document.getElementById("thisNameTableBody");

                    var buttonStatus = '';
                    if(new Date(checkOut) < new Date() || status === 'Cancelled') {
                        buttonStatus = 'disabled';
                    }

                    // Inject the column data for this row into the innerHTML of the row
                    tableBody.innerHTML += "<tr>" +
                    "<td>" + checkIn + "</td>" +
                    "<td>" + checkOut + "</td>" +
                    "<td>" + city + "</td>" +
                    "<td>" + email + "</td>" +
                    "<td>" + fullName + "</td>" +
                    "<td>" + phone + "</td>" +
                    "<td>" + reservationId + "</td>" +
                    "<td>" + roomNumber + "</td>" +
                    "<td>" + roomType + "</td>" +
                    "<td>" + state + "</td>" +
                    "<td>" + street + "</td>" +
                    "<td>" + zip + "</td>" +
                    "<td>" + status + "</td>" +
                    "<td>" + "<button type='button' class='btn btn-secondary "+buttonStatus+"' "+buttonStatus+" onclick='cancelReservation(&quot;" + reservationId + "&quot;)' data-dismiss='modal'>Cancel</button>" + "</td>" +
                    "</tr>";
                }
            }
        // Else api timed out
        } else {
            alert("API Timed Out");
        }
    }, 3000);

    return false;
}

function searchByRoom(){
    // Get the value of the room number selected in the dropdown
    var searchedRoom = document.getElementById("rooms").value;

    if(searchedRoom === "") {
        $('#room-error').removeClass('d-none');
        return false;
    }
    $('#room-error').addClass('d-none');

    $('#roomModalCenter').modal('show');

    // Concatinating the string
    var searchURL = baseApiUrl + "/reservation/room/" + searchedRoom;

    // Performing http request
    var response = sendGetWithCreds(searchURL);

    // Store the modal DOM content as a variable
    var roomModal = document.getElementById("room-modal-body");

    // Inject text to notify user that its still loading
    roomModal.innerHTML = "<h2>Loading Search Results...</h2>";


    // Wait x amount of milliseconds for a response from the API
    setTimeout(function(){

        // If their was a response enter if statement, else api timed out
        if(response.responseJSON){

            // If the response was there were no rooms=
            if (response.responseJSON.error) {

                // Inject header notifying that no data was found
                roomModal.innerHTML = "<h2>No room matching that room number was found</h2>"


            // Else populate a table of rooms reservations
            } else {

                // Insert a blank table into modal
                roomModal.innerHTML = "<table class='table table-striped table-sm'><thead id='thisRoomTableHeader'><tr><th scope='col'>Check In</th><th scope='col'>Check Out</th><th scope='col'>City</th><th scope='col'>Email</th><th scope='col'>Full Name</th><th scope='col'>Phone</th><th scope='col'>Reservation ID</th><th scope='col'>Room</th><th scope='col'>Room Type</th><th scope='col'>State</th><th scope='col'>Street</th><th scope='col'>Zip</th><th scope='col'>Status</th><th scope='col'>Cancel</th></tr></thead><tbody id='thisRoomTableBody'></tbody></table>";

                // Store the response as an array
                var roomJSONArray = response.responseJSON;

                // Loop through array of reservations for this room
                for(var i=0;i < roomJSONArray.length; i++){

                    // Store this item of the array as a variable
                    var thisReservation = roomJSONArray[i];

                    // Store each column data as a variable
                    var checkIn = thisReservation.CheckIn;
                    var checkOut = thisReservation.CheckOut;
                    var city = thisReservation.City;
                    var email = thisReservation.Email;
                    var fullName = thisReservation.FullName;
                    var phone = thisReservation.Phone;
                    var reservationId = thisReservation.ReservationID;
                    var roomNumber = thisReservation.RoomNumber;
                    var roomType = thisReservation.RoomType;
                    var state = thisReservation.State;
                    var street = thisReservation.Street;
                    var zip = thisReservation.Zip;
                    var status = thisReservation.Status;
                    status = status.charAt(0).toUpperCase() + status.slice(1);

                    if(roomNumber === null) {
                        roomNumber = 'Not Assigned';
                    }

                    // Store the table body as a variable
                    var tableBody = document.getElementById("thisRoomTableBody");


                    var buttonStatus = '';
                    if(new Date(checkOut) < new Date() || status === 'Cancelled') {
                        buttonStatus = 'disabled';
                    }

                    // Inject the column data for this row into the innerHTML of the row
                    tableBody.innerHTML += "<tr>" +
                    "<td>" + checkIn + "</td>" +
                    "<td>" + checkOut + "</td>" +
                    "<td>" + city + "</td>" +
                    "<td>" + email + "</td>" +
                    "<td>" + fullName + "</td>" +
                    "<td>" + phone + "</td>" +
                    "<td>" + reservationId + "</td>" +
                    "<td>" + roomNumber + "</td>" +
                    "<td>" + roomType + "</td>" +
                    "<td>" + state + "</td>" +
                    "<td>" + street + "</td>" +
                    "<td>" + zip + "</td>" +
                    "<td>" + status + "</td>" +
                    "<td>" + "<button type='button' class='btn btn-secondary "+buttonStatus+"' "+buttonStatus+" onclick='cancelReservation(&quot;" + reservationId + "&quot;);' data-dismiss='modal'>Cancel</button>" + "</td>" +
                    "</tr>";
                }
            }
        // Else api timed out
        } else {
            alert("API Timed Out");
        }
    }, 3000);

    return false;
}

function searchById(){
    // Get the value of the room number selected in the dropdown
    var searchedId = document.getElementById("idNumber").value;

    if(searchedId === "") {
        $('#id-error').removeClass('d-none');
        return false;
    }
    $('#id-error').addClass('d-none');

    $('#idModalCenter').modal('show');

    // Concatinating the string
    var searchURL = baseApiUrl + "/reservation/id/" + searchedId;


    // Performing http request
    var response = sendGetWithCreds(searchURL);

    // Store the modal DOM content as a variable
    var idModal = document.getElementById("id-modal-body");

    // Inject text to notify user that its still loading
    idModal.innerHTML = "<h2>Loading Search Results...</h2>";

    // Wait x amount of milliseconds for a response from the API
    setTimeout(function(){

        // If their was a response enter if statement, else api timed out
        if(response.responseJSON){

            // If the response was there were no rooms=
            if (response.responseJSON.error) {

                // Inject header notifying that no data was found
                idModal.innerHTML = "<h2>No reservation found matching that id number</h2>"
            // Else populate a table of rooms reservations
            } else {
                // Insert a blank table into modal
                idModal.innerHTML = "<table class='table table-striped table-sm'><thead id='thisIdTableHeader'><tr><th scope='col'>Check In</th><th scope='col'>Check Out</th><th scope='col'>City</th><th scope='col'>Email</th><th scope='col'>Full Name</th><th scope='col'>Phone</th><th scope='col'>Reservation ID</th><th scope='col'>Room</th><th scope='col'>Room Type</th><th scope='col'>State</th><th scope='col'>Street</th><th scope='col'>Zip</th><th scope='col'>Status</th><th scope='col'>Cancel</th></tr></thead><tbody id='thisIdTableBody'></tbody></table>";

                // Store the response as an array
                var idJSONArray = response.responseJSON;

                // Loop through array of reservations for this id number (should only be 1)
                for(var i=0;i < idJSONArray.length; i++){

                    // Store this item of the array as a variable
                    var thisReservation = idJSONArray[i];

                    // Store each column data as a variable
                    var checkIn = thisReservation.CheckIn;
                    var checkOut = thisReservation.CheckOut;
                    var city = thisReservation.City;
                    var email = thisReservation.Email;
                    var fullName = thisReservation.FullName;
                    var phone = thisReservation.Phone;
                    var reservationId = thisReservation.ReservationID;
                    var roomNumber = thisReservation.RoomNumber;
                    var roomType = thisReservation.RoomType;
                    var state = thisReservation.State;
                    var street = thisReservation.Street;
                    var zip = thisReservation.Zip;
                    var status = thisReservation.Status;
                    status = status.charAt(0).toUpperCase() + status.slice(1);

                    if(roomNumber === null) {
                        roomNumber = 'Not Assigned';
                    }

                    // Store the table body as a variable
                    var tableBody = document.getElementById("thisIdTableBody");

                    var buttonStatus = '';
                    if(new Date(checkOut) < new Date() || status === 'Cancelled') {
                        buttonStatus = 'disabled';
                    }

                    // Inject the column data for this row into the innerHTML of the row
                    tableBody.innerHTML += "<tr>" +
                    "<td>" + checkIn + "</td>" +
                    "<td>" + checkOut + "</td>" +
                    "<td>" + city + "</td>" +
                    "<td>" + email + "</td>" +
                    "<td>" + fullName + "</td>" +
                    "<td>" + phone + "</td>" +
                    "<td>" + reservationId + "</td>" +
                    "<td>" + roomNumber + "</td>" +
                    "<td>" + roomType + "</td>" +
                    "<td>" + state + "</td>" +
                    "<td>" + street + "</td>" +
                    "<td>" + zip + "</td>" +
                    "<td>" + status + "</td>" +
                    "<td>" + "<button type='button' class='btn btn-secondary "+buttonStatus+"' "+buttonStatus+" onclick='cancelReservation(&quot;" + reservationId + "&quot;);' data-dismiss='modal'>Cancel</button>" + "</td>" +
                    "</tr>";

                }
            }
        // Else api timed out
        } else {
            alert("API Timed Out");
        }
    }, 3000);

    return false;
}


function cancelReservation(reservationId){
    // Concatenating the string
    var postURL = baseApiUrl + "/management/cancel";

    sendPostWithCreds(postURL, { id: reservationId}).then((data, status, jqXHR) => {
        $('.modal').modal('hide');
        $('#cancel-success-remark').text(data.remark);
        $('#cancel-success-alert-id').text(reservationId);
        triggerAlert('#cancel-success-alert');
    })
    .fail((data, status, jqXHR) => {
        $('.modal').modal('hide');
        triggerAlert('#cancel-failure-alert');
    });

}


// Alert drops in to screen and stops just below nav bar
// Fades after 5 seconds
function triggerAlert(alertId) {
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
        }, 500);
    }, 4000);

}
