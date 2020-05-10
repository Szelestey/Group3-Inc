/*
 * Javascript for the admin/index.html page
 */

$(document).ready(function() {
  refresh();
});

function refresh() {
  getDbStatus();
  getUsersStatus();
}

// Gets current status of mysql database
function getDbStatus() {
  var url = baseApiUrl + '/admin/db';
  var dbStatus = $('#db-status');
  dbStatus.css('min-width',dbStatus.width());
  dbStatus.text('');

  $('#refresh-icon').addClass('fa-spin');
  sendGetWithCreds(url).done( function(data, status) {
    dbStatus.text(data.state);
    var color = (data.state === 'Connected') ? '#05b600' : '#D00000';
    dbStatus.css('color',color);
    $('#refresh-icon').removeClass('fa-spin');
  })
  .fail(function(data, status) {
    dbStatus.text('Error');
    dbStatus.css('color','#D00000')
    $('#refresh-icon').removeClass('fa-spin');
  });
}

// Gets total users, num admins, and num users
function getUsersStatus() {
  var url = baseApiUrl + '/users/status';
  var usersTotal = $('#users-total');
  var usersAdmins = $('#users-admins');
  var usersUsers = $('#users-users');

  sendGetWithCreds(url).done(function(data, status) {
    $('.users-data').find('span').removeClass('status-error');
    usersTotal.text(data.total);
    usersAdmins.text(data.admins);
    usersUsers.text(data.users);
  })
  .fail(function(data, status) {
    $('.users-data').find('span').addClass('status-error');
    usersTotal.text('-');
    usersAdmins.text('-');
    usersUsers.text('-');
  });
}

