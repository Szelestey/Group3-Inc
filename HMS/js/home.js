/*
 * Javascript for the home.html page
 */

$(document).ready(function() {
  checkAdmin();
});

// Displays admin tab if admin and adjusts container width
function checkAdmin() {
  var admin = window.localStorage.getItem('ad-auth');
  var maxWidth = '800px';
  if(admin === 'true') {
    $('#admin-tab').removeClass('d-none');
    maxWidth = '1000px';
  }
  $('#home-container').css('max-width',maxWidth);
}
