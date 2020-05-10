/*
 * Javascript for the login/index.html page
 */

// Configure Page
$(document).ready(function() {

  $("#username").keyup(function(event) {
    if(event.key === "Enter") {
      $("#login-button").click();
    }
  });

  $("#password").keyup(function(event) {
    if(event.key === "Enter") {
      $("#login-button").click();
    }
  });

  $('#username').focus();

});


