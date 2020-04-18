/*
  This is the backend server.
  All http requests come in and go through all the middleware before being routed
  to the proper endpoint.
 */
var express = require('express');
var cors = require('cors');
var parser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressjwt = require('express-jwt');
var adminGuard = require('express-jwt-permissions')();
var config = require('./backend/config.json');
var serverUtils = require('./backend/server.utils');
var routes = require('./backend/routes');

// Create the servers
var app = express();
var api = express();

var appPort = 8080;
var apiPort = 3000;

const excludedAppPaths = [
    /\S*\/login/,
    /\S*\.css/,/photos\/\S*/,
    /js\/\S*/,
    /\S*\/timeout.html/,
    /dev\/\S*/
];

const excludedApiPaths = [
  '/auth',
  '/users/new'
];

/////////////////////////// Configure App \\\\\\\\\\\\\\\\\\\\\\\\\
app.use(cors({
  origin: true,
  optionsSuccessStatus: 200,
  credentials: true
}))
.use(parser.urlencoded({extended: false}))
.use(parser.json())
.use(cookieParser())
.use(/\S*\/login/, function(req, res, next) {
  // redirect to home if already logged in
  serverUtils.loggedInRedirect(req, res, next);
})
.use(expressjwt({
      secret: config.secret,
      credentialsRequired: true,
      getToken: function(req) { return req.cookies.auth; }
    }).unless({ path: excludedAppPaths }))
.use(/\/pages\/admin\/\S*/, adminGuard.check(['admin']))
.use(function(err, req, res, next) {
  // ERROR HANDLER
  if(err.code === 'permission_denied') {
    res.status(403).send('Not authorized to access this resource');
  } else if(err.name === 'UnauthorizedError') {
    if(err.inner.name === 'TokenExpiredError') {
      res.redirect('/pages/timeout.html');
    } else {
      res.redirect('/pages/login');
    }
  } else {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
})
.use(express.static('HMS'))
.use(function(req, res, next) {
  res.redirect('/pages/login');
});


///////////////////////// Configure API \\\\\\\\\\\\\\\\\\\\\\\\\\\
api.use(cors({
  origin: true,
  optionsSuccessStatus: 200,
  credentials: true
}))
.use(parser.urlencoded({extended: false}))
.use(parser.json())
.use(cookieParser())
.use(expressjwt({
      secret: config.secret,
      credentialsRequired: true,
      getToken: function(req) { return req.cookies.auth; }
    }).unless({ path: excludedApiPaths}))
.use('/auth', routes.authRoutes)
.use('/rooms', routes.roomsRoutes)
.use('/users', adminGuard.check(['admin']), routes.usersRoutes)
.use(function(err, req, res, next) {
  // ERROR HANDLER
  if(err.code === 'permission_denied') {
    console.log("Guard blocked a request to '"+req.url+"' by user: '"+req.user.sub+"'");
  } else if(err.name === 'UnauthorizedError') {
    res.status(401).send(err.message);
  } else {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

//  Listens for all http requests to 'localhost:8080/'
app.listen(appPort, function() {
  console.log('Server listening on port ' + appPort);
});

// Listens for all http requests to 'localhost:3000/'
api.listen(apiPort, function() {
  console.log('API listening on port '+ apiPort);
});

module.exports = {
  app,
  api
};
