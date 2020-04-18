const baseApiUrl = "http://localhost:3000";
const baseAppUrl = "http://localhost:8080";

var loginErr;

$(document).ready(() => {
  loginErr = $("#invalid-login");
})

function auth() {
  const url = baseApiUrl + "/auth";
  username = $("#username").val();
  password = $("#password").val();

  if(username === "" || password === "") {
    loginErr.text("*Username/password cannot be blank");
    return;
  }

  const payload = {
    username,
    password
  }
  sendAuthRequest(url,payload);
}

function logout() {
  const url = baseApiUrl + "/auth/logout";
  $.ajax({
    method: "POST",
    url: url,
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    }
  }).done(function (data, status, jqXHR) {
    window.localStorage.clear();
    window.location.replace(baseAppUrl + '/pages');
  }).fail(function(data, status, jqXHR) {
    alert(JSON.stringify(data.responseJSON.message));
  });
}

function sendAuthRequest(url, payload) {
  $.ajax({
    method: "POST",
    url: url,
    data: payload,
    crossDomain: true,
    xhrFields: {
      withCredentials: true
    }
  }).done(function (data, status, jqXHR) {
    window.localStorage.setItem('username', data['username']);
    window.localStorage.setItem('ad-auth', data['ad-auth']);
    window.location.assign(baseAppUrl + '/pages/home.html');
  }).fail(function(data, status, jqXHR) {
    loginErr.text("*Username/password not found");
  });
}
