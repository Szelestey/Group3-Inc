var jwt = require('jsonwebtoken');
var config = require('../config.json');
var authCtrl = require('../controllers/auth.controller');

module.exports = {
  loggedInRedirect
};

// Redirect to home page if valid token exists
function loggedInRedirect(req, res, next) {
  var token = req.cookies.auth;
  try {
    jwt.verify(token, config.secret);
    if(!authCtrl.validateJWT(token)) {
      next();
    } else {
      res.redirect('/pages/home.html');
    }
  } catch(err) {
    next();
  }
}

