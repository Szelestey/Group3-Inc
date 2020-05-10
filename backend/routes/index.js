/*
   Compiles all routes files to simplify the server.js file.
 */

const authRoutes = require('./auth.routes')
const roomsRoutes = require('./rooms.routes');
const usersRoutes = require('./users.routes');
const adminRoutes = require('./admin.routes');
const reservationRoutes = require('./reservation.route');
const managementRoutes = require('./management.routes');
const billingRoutes = require('./billing.routes');

module.exports = {
  authRoutes,
  roomsRoutes,
  usersRoutes,
  adminRoutes,
  reservationRoutes,
  managementRoutes,
  billingRoutes
};



