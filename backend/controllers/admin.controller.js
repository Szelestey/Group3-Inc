/*
 * Handlers for Admin related API endpoints:  /admin/
 *
 */

const adminService = require('../services/admin.service');


module.exports = {
  getDbStatus
}


/*
 * Obtains the current database status.
 */
async function getDbStatus(req, res, next) {
  adminService.getDbStatus().then(() => {
    res.status(200).json({state: 'Connected'});
  })
  .catch(err => {
    if(err.code === 'ECONNREFUSED') {
      res.status(200).json({state: 'Disconnected'});
    }
  });
}
