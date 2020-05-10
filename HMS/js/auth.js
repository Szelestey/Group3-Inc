/*
 * Javascript for authentication.
 * All pages with logout must include this file.
 */

$(document).ready(() => {

})

function auth() {
  const url = baseApiUrl + "/auth";
  var username = $("#username").val();
  var password = $("#password").val();

  if(username === "" || password === "") {
    $('#invalid-login').text("*Username/password cannot be blank");
    return;
  }

  const payload = {
    username: username,
    password: password
  }

  sendPostWithCreds(url, payload).done(function (data, status, jqXHR) {
    window.localStorage.setItem('username', data['username']);
    window.localStorage.setItem('ad-auth', data['ad-auth']);
    window.location.assign(baseAppUrl + '/pages/home.html');
  }).fail(function(data, status, jqXHR) {
    $('#invalid-login').text("*Username/password not found");
  });
}

function logout() {
  const url = baseApiUrl + "/auth/logout";
  sendPostWithCreds(url, null).done(function (data, status, jqXHR) {
    window.localStorage.clear();
    window.location.replace(baseAppUrl + '/pages');
  }).fail(function(data, status, jqXHR) {
    window.localStorage.clear();
    window.location.replace(baseAppUrl + '/pages');
  });
}
