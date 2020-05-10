var jwt = require('jsonwebtoken');
var config = require('../config.json');
var authCtrl = require('../controllers/auth.controller');

module.exports = {
  loggedInRedirect
};

function loggedInRedirect(req, res, next) {
  // Redirect to home page if valid token exists
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

