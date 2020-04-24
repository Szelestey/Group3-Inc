const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db/db');

const userTable = 'USER';

module.exports = {
  authenticate,
  verify,
  hashPassword
};

// Verifies the provided username and password match a user in the database and resolves
// with a new JWT
function authenticate(username, password) {
  const query = "SELECT username,password,role FROM ?? WHERE username=?"
  const values = [userTable,username];
  return new Promise(resolve => {
    db.query(query, values,
        (error, results) => {
          if(error) {
            console.log(error);
          } else {
            user = results[0];
            if(user) {
              bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                  const token = getToken(user.username, user.role);
                  resolve({username: user.username, role: user.role, token: token});
                } else {
                  resolve();
                }
              });
            } else {
              resolve();
            }
          }
        });
  });
}

// Verifies a user with the provided username and password exists in the database
function verify(username, password) {
  const query = "SELECT username FROM ?? WHERE username=? AND password=?"
  const values = [userTable,username, password];
  return new Promise( resolve => {
    db.query(query, values,
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            resolve(results.length > 0);
          }
        });
  });
}

// Returns a new JWT with a 20 minute expiration
function getToken(username, role) {
  var permission = (role === 'admin') ? 'admin' : 'user';
  var payload = {
    sub: username,
    permissions: [permission]
  };
  return jwt.sign(payload, config.secret, {expiresIn: config.timeout});
}

// Returns hash of the provided password
function hashPassword(password) {
  return (password) ? bcrypt.hashSync(password, 10) : null;
}



