/*
 * Execution file for the backend API application.
 * Creates two Express servers for the front-end files and the API listening on
 * ports 8080 and 3000 respectively.
 */

var express = require('express');
var cors = require('cors');
var parser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressjwt = require('express-jwt');
var adminGuard = require('express-jwt-permissions')();
var refreshJwt = require('./backend/utils/refreshJwt');
var config = require('./backend/config.json');
var serverUtils = require('./backend/utils/server.utils');
var routes = require('./backend/routes');
var authCtrl = require('./backend/controllers/auth.controller');

// Create the servers
var app = express();
var api = express();

// Define the ports
var appPort = 8080;
var apiPort = 3000;

// Front-end paths excluded from authentication
const excludedAppPaths = [
    /\S*\/login/,
    /\S*\.css/,
    /photos\/\S*/,
    /js\/\S*/,
    /\S*\/timeout.html/,
    /dev\/\S*/
];

// API paths excluded from authentication
const excludedApiPaths = [
    '/auth',
    '/auth/logout'
];


/////////////////////////// Configure App \\\\\\\\\\\\\\\\\\\\\\\\\
app.use(cors({
  origin: true,
  optionsSuccessStatus: 200,
  credentials: true
}))

// Parse Json body
.use(parser.urlencoded({extended: false}))
.use(parser.json())

// Parse Cookies
.use(cookieParser())

// Redirect to home page if requesting login page and already logged in
.use(/\S*\/login/, function(req, res, next) {
  serverUtils.loggedInRedirect(req, res, next);
})

// Validate JWT if applicable
.use(expressjwt({
      secret: config.secret,
      credentialsRequired: true,
      getToken: function(req) { return req.cookies.auth; }
    }).unless({ path: excludedAppPaths }))

// Refresh JWT
.use(refreshJwt().unless({ path: excludedAppPaths }))

// Verify admin privileges if requesting admin pages
.use(/\/pages\/admin\/\S*/, adminGuard.check(['admin']))

// Error handler
.use(function(err, req, res, next) {
  // ERROR HANDLER
  if(err.code === 'permission_denied') {    // adminGuard blocked request

    res.status(403).send('Not authorized to access this resource');

  } else if(err.name === 'UnauthorizedError') {    // expressJwt blocked request

    err.inner.name === 'TokenExpiredError' ? res.redirect('/pages/timeout.html') : res.redirect('/pages/login');

  } else {

    console.log(err);
    res.status(500).send("Internal Server Error");

  }
})

// Serve static files
.use(express.static('HMS'))

// Requesting unknown route, redirect to login
.use(function(req, res, next) {
  res.redirect('/pages/login');
});


///////////////////////// Configure API \\\\\\\\\\\\\\\\\\\\\\\\\\\
api.use(cors({
  origin: true,
  optionsSuccessStatus: 200,
  credentials: true
}))

// Parse JSON body
.use(parser.urlencoded({extended: true}))
.use(parser.json())

// Parse Cookies
.use(cookieParser())

// Logout route
.use(/\S*\/logout/, function(req, res, next) {
  // if logout route, immediately invalidate auth cookie
  res.cookie('auth', 'bad', {httpOnly: true, sameSite: true});
  authCtrl.removeJWT(req.cookies.auth);
  res.send();
})

// Verify JWT if applicable
.use(expressjwt({
      secret: config.secret,
      credentialsRequired: true,
      getToken: function(req) { return req.cookies.auth; }
    }).unless({ path: excludedApiPaths}))

// Refresh JWT
.use(refreshJwt().unless({ path: excludedApiPaths }))

// Authentication routes
.use('/auth', routes.authRoutes)

// Rooms routes
.use('/rooms', routes.roomsRoutes)

// Reservation routes
.use('/reservation', routes.reservationRoutes)

// Management routes
.use('/management', routes.managementRoutes)

// Billing routes
.use('/billing', routes.billingRoutes)

// Users routes
.use('/users', adminGuard.check(['admin']), routes.usersRoutes)

// Admin routes
.use('/admin', adminGuard.check(['admin']), routes.adminRoutes)

// Error handler
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
