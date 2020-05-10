/*
 * Javascript for the nav bar.
 * Any page with the nav bar should include this file.
 */

var username = window.localStorage.getItem('username');

$(document).ready(function() {
  clockUpd();
  var time = setInterval('clockUpd()', 1000);

  checkAdmin();
});

function clockUpd() {
  var now = new Date();
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  $('#nav-info-text').text("Logged in as:\xa0\xa0" + username+"\xa0\xa0\xa0\xa0"+now.toLocaleString('en-US', options)+" "+
      now.toLocaleTimeString());
}

function checkAdmin() {
  var admin = window.localStorage.getItem('ad-auth');
  if(admin === 'true') {
    $('#admin-tab').removeClass('d-none');
  }
}
